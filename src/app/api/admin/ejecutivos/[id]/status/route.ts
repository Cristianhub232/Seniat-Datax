import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';

// PATCH - Cambiar estado del ejecutivo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    // Verificar si existe el ejecutivo
    const [existingEjecutivo] = await authSequelize.query(`
      SELECT EMAIL FROM CGBRITO.EJECUTIVOS WHERE ID = ?
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

    const email = (existingEjecutivo[0] as any).EMAIL;

    // Actualizar el estado del ejecutivo
    await authSequelize.query(`
      UPDATE CGBRITO.EJECUTIVOS 
      SET STATUS = ?, UPDATED_AT = SYSDATE
      WHERE ID = ?
    `, {
      replacements: [status, id],
      type: 'UPDATE'
    });

    // Actualizar el estado del usuario asociado si existe
    await authSequelize.query(`
      UPDATE CGBRITO.USERS 
      SET STATUS = ?, UPDATED_AT = SYSDATE
      WHERE EMAIL = ?
    `, {
      replacements: [status ? 'active' : 'inactive', email],
      type: 'UPDATE'
    });

    return NextResponse.json(
      { message: 'Estado actualizado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error actualizando estado:', error);
    return NextResponse.json(
      { error: 'Error actualizando estado' },
      { status: 500 }
    );
  }
} 