import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwtUtils';
import { authSequelize } from '@/lib/db';
import { getMenusByRole } from "@/controllers/menuController";

interface UserRecord {
  ID: string;
  USERNAME: string;
  EMAIL: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  ROLE_ID: number;
  STATUS: string;
  LAST_LOGIN: Date | null;
  ROLE_NAME: string;
  ROLE_DESCRIPTION: string;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }

  const decoded = verifyToken(token);

  if (!decoded?.id) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }

  try {
    // Buscar usuario con su rol usando SQL directo
    const [users] = await authSequelize.query(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.FIRST_NAME, u.LAST_NAME, 
             u.ROLE_ID, u.STATUS, u.LAST_LOGIN,
             r.NAME as ROLE_NAME, r.DESCRIPTION as ROLE_DESCRIPTION
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.ID = :userId AND u.STATUS = 'active'
    `, {
      replacements: { userId: decoded.id },
      type: 'SELECT'
    });

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = (Array.isArray(users) ? users[0] : users) as UserRecord;
    
    // Obtener permisos del usuario
    const [permissionsResult] = await authSequelize.query(`
      SELECT p.NAME
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.ROLE_ID = :roleId
    `, {
      replacements: { roleId: user.ROLE_ID },
      type: 'SELECT'
    });

    const permissions = Array.isArray(permissionsResult) ? permissionsResult : [permissionsResult];
    
    const responseUser = {
      id: user.ID,
      username: user.USERNAME,
      email: user.EMAIL,
      firstName: user.FIRST_NAME,
      lastName: user.LAST_NAME,
      role: user.ROLE_NAME,
      permissions: permissions.filter((p: any) => p && p.NAME).map((p: any) => p.NAME)
    };

    return NextResponse.json({ user: responseUser, menus: [] }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/me] Error:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
