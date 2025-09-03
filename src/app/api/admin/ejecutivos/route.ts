import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET - Obtener todos los ejecutivos
export async function GET() {
  try {
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
      ORDER BY e.CREATED_AT DESC
    `);

    return NextResponse.json(ejecutivos);
  } catch (error) {
    console.error('Error obteniendo ejecutivos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo ejecutivos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo ejecutivo
export async function POST(request: NextRequest) {
  try {
    const { cedula, nombre, apellido, email, password } = await request.json();

    // Validaciones
    if (!cedula || !nombre || !apellido || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un ejecutivo con esa cédula o email
    const [existingEjecutivo] = await authSequelize.query(`
      SELECT ID FROM CGBRITO.EJECUTIVOS 
      WHERE CEDULA = ? OR EMAIL = ?
    `, {
      replacements: [cedula, email],
      type: 'SELECT'
    });

    if (existingEjecutivo && existingEjecutivo.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un ejecutivo con esa cédula o email' },
        { status: 409 }
      );
    }

    // Verificar si ya existe un usuario con ese email
    const [existingUser] = await authSequelize.query(`
      SELECT ID FROM CGBRITO.USERS 
      WHERE EMAIL = ?
    `, {
      replacements: [email],
      type: 'SELECT'
    });

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 409 }
      );
    }

    // Verificar si ya existe un usuario con ese username
    const username = email.split('@')[0];
    const [existingUsername] = await authSequelize.query(`
      SELECT ID FROM CGBRITO.USERS 
      WHERE USERNAME = ?
    `, {
      replacements: [username],
      type: 'SELECT'
    });

    if (existingUsername && existingUsername.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese username' },
        { status: 409 }
      );
    }

    // Crear el ejecutivo y usuario
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el ejecutivo primero
    await authSequelize.query(`
      INSERT INTO CGBRITO.EJECUTIVOS (CEDULA, NOMBRE, APELLIDO, EMAIL, STATUS, CREATED_AT, UPDATED_AT)
      VALUES (?, ?, ?, ?, 1, SYSDATE, SYSDATE)
    `, {
      replacements: [cedula, nombre, apellido, email],
      type: 'INSERT'
    });

    // Obtener ROLE_ID dinámico para EJECUTIVO
    const [roleRows] = await authSequelize.query(`
      SELECT ID FROM CGBRITO.ROLES WHERE UPPER(NAME) = 'EJECUTIVO'
    `, { type: 'SELECT' });

    if (!roleRows || (Array.isArray(roleRows) && roleRows.length === 0)) {
      return NextResponse.json(
        { error: 'Rol EJECUTIVO no encontrado' },
        { status: 400 }
      );
    }

    const roleId = Array.isArray(roleRows) ? (roleRows[0] as any).ID : (roleRows as any).ID;

    // Crear usuario asociado con ROLE_ID correcto
    await authSequelize.query(`
      INSERT INTO CGBRITO.USERS (ID, USERNAME, EMAIL, PASSWORD_HASH, FIRST_NAME, LAST_NAME, ROLE_ID, STATUS, CREATED_AT, UPDATED_AT)
      VALUES (SYS_GUID(), ?, ?, ?, ?, ?, ?, 'active', SYSDATE, SYSDATE)
    `, {
      replacements: [username, email, hashedPassword, nombre, apellido, roleId],
      type: 'INSERT'
    });

    return NextResponse.json(
      { message: 'Ejecutivo creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creando ejecutivo:', error);
    
    // Manejar errores específicos
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json(
        { error: 'Ya existe un registro con los datos proporcionados (cédula o email duplicado)' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error creando ejecutivo' },
      { status: 500 }
    );
  }
} 