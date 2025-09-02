import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';

// GET - Obtener un ejecutivo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [ejecutivos] = await authSequelize.query(`
      SELECT 
        e.ID,
        e.CEDULA,
        e.NOMBRE,
        e.APELLIDO,
        e.EMAIL,
        e.STATUS,
        e.CREATED_AT,
        e.UPDATED_AT,
        u.ID as USER_ID
      FROM CGBRITO.EJECUTIVOS e
      LEFT JOIN CGBRITO.USERS u ON e.EMAIL = u.EMAIL
      WHERE e.ID = ?
    `, {
      replacements: [id],
      type: 'SELECT'
    });

    if (!ejecutivos || ejecutivos.length === 0) {
      return NextResponse.json(
        { error: 'Ejecutivo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(ejecutivos[0]);
  } catch (error) {
    console.error('Error obteniendo ejecutivo:', error);
    return NextResponse.json(
      { error: 'Error obteniendo ejecutivo' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar ejecutivo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { cedula, nombre, apellido, email } = await request.json();

    // Validaciones
    if (!cedula || !nombre || !apellido || !email) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si existe el ejecutivo
    const [existingEjecutivo] = await authSequelize.query(`
      SELECT ID FROM CGBRITO.EJECUTIVOS WHERE ID = ?
    `, {
      replacements: [id],
      type: 'SELECT'
    });

    if (!existingEjecutivo || existingEjecutivo.length === 0) {
      return NextResponse.json(
        { error: 'Ejecutivo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya existe otro ejecutivo con esa cédula o email
    const [duplicateEjecutivo] = await authSequelize.query(`
      SELECT ID FROM CGBRITO.EJECUTIVOS 
      WHERE (CEDULA = ? OR EMAIL = ?) AND ID != ?
    `, {
      replacements: [cedula, email, id],
      type: 'SELECT'
    });

    if (duplicateEjecutivo && duplicateEjecutivo.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe otro ejecutivo con esa cédula o email' },
        { status: 409 }
      );
    }

    // Actualizar el ejecutivo
    await authSequelize.query(`
      UPDATE CGBRITO.EJECUTIVOS 
      SET CEDULA = ?, NOMBRE = ?, APELLIDO = ?, EMAIL = ?, UPDATED_AT = SYSDATE
      WHERE ID = ?
    `, {
      replacements: [cedula, nombre, apellido, email, id],
      type: 'UPDATE'
    });

    // Actualizar el usuario asociado si existe
    await authSequelize.query(`
      UPDATE CGBRITO.USERS 
      SET EMAIL = ?, FIRST_NAME = ?, LAST_NAME = ?, UPDATED_AT = SYSDATE
      WHERE EMAIL = (SELECT EMAIL FROM CGBRITO.EJECUTIVOS WHERE ID = ?)
    `, {
      replacements: [email, nombre, apellido, id],
      type: 'UPDATE'
    });

    return NextResponse.json(
      { message: 'Ejecutivo actualizado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error actualizando ejecutivo:', error);
    return NextResponse.json(
      { error: 'Error actualizando ejecutivo' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar ejecutivo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar si existe el ejecutivo
    const [existingEjecutivo] = await authSequelize.query(`
      SELECT EMAIL FROM CGBRITO.EJECUTIVOS WHERE ID = ?
    `, {
      replacements: [id],
      type: 'SELECT'
    });

    console.log('🔍 Resultado de consulta ejecutivo:', JSON.stringify(existingEjecutivo, null, 2));

    if (!existingEjecutivo || existingEjecutivo.length === 0) {
      return NextResponse.json(
        { error: 'Ejecutivo no encontrado' },
        { status: 404 }
      );
    }

    // Acceder al email directamente del resultado
    const email = (existingEjecutivo as any)?.EMAIL;
    
    if (!email) {
      console.log('❌ Email no encontrado en:', existingEjecutivo);
      return NextResponse.json(
        { error: 'Email del ejecutivo no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el usuario asociado si existe
    await authSequelize.query(`
      DELETE FROM CGBRITO.USERS WHERE EMAIL = ?
    `, {
      replacements: [email],
      type: 'DELETE'
    });

    // Eliminar el ejecutivo
    await authSequelize.query(`
      DELETE FROM CGBRITO.EJECUTIVOS WHERE ID = ?
    `, {
      replacements: [id],
      type: 'DELETE'
    });

    return NextResponse.json(
      { message: 'Ejecutivo eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error eliminando ejecutivo:', error);
    return NextResponse.json(
      { error: 'Error eliminando ejecutivo' },
      { status: 500 }
    );
  }
} 