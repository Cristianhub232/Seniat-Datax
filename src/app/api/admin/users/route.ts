import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authSequelize } from '@/lib/db';
import { verifyToken } from '@/lib/jwtUtils';
import { createUserSchema } from '@/schemas/userSchemas';
import { hashPassword } from '@/lib/authUtils';

// Función para generar UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// GET /api/auth/users → listar usuarios
export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }
  
  const tokenPayload = verifyToken(token);
  if (!tokenPayload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const email = searchParams.get('email');

    // Construir consulta SQL con filtros
    let sql = `
      SELECT u.ID as id, u.USERNAME as username, u.EMAIL as email, u.FIRST_NAME as first_name, u.LAST_NAME as last_name, u.ROLE_ID as role_id, u.STATUS as status, u.CREATED_AT as created_at, u.UPDATED_AT as updated_at,
             r.ID as role_table_id, r.NAME as role_name
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
    `;
    
    const conditions = [];
    const params: any[] = [];
    
    if (username) {
      conditions.push('u.USERNAME LIKE ?');
      params.push(`%${username}%`);
    }
    if (email) {
      conditions.push('u.EMAIL LIKE ?');
      params.push(`%${email}%`);
    }
    
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    sql += ' ORDER BY u.CREATED_AT DESC';

    // Usar una consulta que garantice múltiples resultados
    const result = await authSequelize.query(sql, {
      replacements: params,
      type: 'SELECT'
    });

    // Extraer el array de usuarios del resultado
    const users = Array.isArray(result) ? result : [result];

    // Transformar los resultados para que coincidan con el formato esperado
    const transformedUsers = users.map((user: any) => ({
      id: user.ID || user.id,
      username: user.USERNAME || user.username,
      email: user.EMAIL || user.email,
      first_name: user.FIRST_NAME || user.first_name,
      last_name: user.LAST_NAME || user.last_name,
      role_id: user.ROLE_ID || user.role_id,
      status: (user.STATUS || user.status) === 'active' || (user.STATUS || user.status) === true,
      created_at: user.CREATED_AT || user.created_at,
      updated_at: user.UPDATED_AT || user.updated_at,
      role: {
        id: user.ROLE_ID || user.role_id,
        name: user.ROLE_NAME || user.role_name || 'Sin rol'
      }
    }));

    return NextResponse.json(transformedUsers, { status: 200 });
  } catch (error) {
    console.error('[GET /api/auth/users] Error fetching users:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  if (!verifyToken(token)) return NextResponse.json({ error: 'Token inválido' }, { status: 403 });

  try {
    const body = createUserSchema.parse(await req.json());

    // Validación de duplicados
    const [existingUser] = await authSequelize.query(
      'SELECT ID FROM CGBRITO.USERS WHERE USERNAME = ? OR EMAIL = ?',
      {
        replacements: [body.username, body.email],
        type: 'SELECT'
      }
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({ error: 'El nombre de usuario o email ya existe' }, { status: 409 });
    }

    // Obtener role_id a partir del nombre de rol
    const [roleResult] = await authSequelize.query(
      'SELECT ID FROM CGBRITO.ROLES WHERE NAME = ?',
      {
        replacements: [body.role],
        type: 'SELECT'
      }
    );

    const role = Array.isArray(roleResult) ? roleResult[0] : roleResult;
    if (!role || !(role as any).ID) {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }

    // Crear usuario
    const password_hash = await hashPassword(body.password);
    const userId = generateUUID(); // Generar UUID para el usuario
    
    await authSequelize.query(
      `INSERT INTO CGBRITO.USERS (ID, USERNAME, EMAIL, PASSWORD_HASH, ROLE_ID, STATUS, CREATED_AT, UPDATED_AT) 
       VALUES (?, ?, ?, ?, ?, 'active', SYSDATE, SYSDATE)`,
      {
        replacements: [userId, body.username, body.email, password_hash, (role as any).ID],
        type: 'INSERT'
      }
    );

    // Obtener el usuario creado
    const [createdUser] = await authSequelize.query(
      `SELECT u.ID as id, u.USERNAME as username, u.EMAIL as email, u.ROLE_ID as role_id, u.STATUS as status, u.CREATED_AT as created_at, u.UPDATED_AT as updated_at,
               r.NAME as role_name
       FROM CGBRITO.USERS u
       LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
       WHERE u.ID = ?`,
      {
        replacements: [userId],
        type: 'SELECT'
      }
    );

    const user = Array.isArray(createdUser) ? createdUser[0] : createdUser;
    if (!user) {
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
    }

    const userSafe = {
      id: (user as any).ID || (user as any).id,
      username: (user as any).USERNAME || (user as any).username,
      email: (user as any).EMAIL || (user as any).email,
      role_id: (user as any).ROLE_ID || (user as any).role_id,
      status: (user as any).STATUS === 'active' || (user as any).status === true,
      created_at: (user as any).CREATED_AT || (user as any).created_at,
      updated_at: (user as any).UPDATED_AT || (user as any).updated_at,
      role: {
        id: (user as any).ROLE_ID || (user as any).role_id,
        name: (user as any).ROLE_NAME || (user as any).role_name || 'Sin rol'
      }
    };

    return NextResponse.json(userSafe, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const messages = err.issues.map(issue => issue.message);
      return NextResponse.json({ errors: messages }, { status: 400 });
    }
    console.error('[POST /api/auth/users] Error:', err);
    return NextResponse.json({ error: 'Error creando usuario' }, { status: 500 });
  }
}
