import { NextRequest, NextResponse } from "next/server";
import { authSequelize } from '@/lib/db';
import { QueryTypes } from 'sequelize';
import { verifyToken } from '@/lib/jwtUtils';

// GET: listar roles
export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Verificar permisos: solo ADMIN o users.manage/roles.read
  try {
    const decoded: any = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 403 });

    // Cargar permisos
    const [users] = await authSequelize.query(`
      SELECT u.ROLE_ID, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.ID = :userId AND u.STATUS = 'active'
    `, { replacements: { userId: decoded.id }, type: QueryTypes.SELECT });

    const userRow: any = Array.isArray(users) ? (users.length > 0 ? users[0] : null) : users;
    const roleName = (userRow?.ROLE_NAME || '').toUpperCase();
    let permissions: string[] = [];
    if (userRow && userRow.ROLE_ID != null) {
      const result = await authSequelize.query(`
        SELECT p.NAME FROM CGBRITO.PERMISSIONS p
        JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
        WHERE rp.ROLE_ID = :roleId
      `, { replacements: { roleId: userRow.ROLE_ID }, type: QueryTypes.SELECT });
      const rows = Array.isArray(result) ? result : [result];
      permissions = rows.map((r: any) => (r.NAME || r.name)).filter(Boolean);
    }

    const allowed = roleName === 'ADMIN' || permissions.includes('roles.read') || permissions.includes('roles.manage');
    if (!allowed) {
      return NextResponse.json({ error: 'Sin permiso para listar roles' }, { status: 403 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const sql = `
      SELECT r.ID, r.NAME, r.DESCRIPTION, r.CREATED_AT, r.UPDATED_AT,
             (SELECT COUNT(*) FROM CGBRITO.USERS u WHERE u.ROLE_ID = r.ID) as user_count
      FROM CGBRITO.ROLES r
      ORDER BY r.ID ASC
    `;
    const result = await authSequelize.query(sql, {
      type: QueryTypes.SELECT
    });

    // Extraer el array de roles del resultado
    const roles = Array.isArray(result) ? result : [result];

    // Transformar los resultados
    const transformedRoles = roles.map((role: any) => ({
      id: role.ID,
      name: role.NAME,
      description: role.DESCRIPTION,
      status: 'active', // Asumimos que todos los roles están activos
      created_at: role.CREATED_AT,
      updated_at: role.UPDATED_AT,
      userCount: parseInt(role.user_count) || 0
    }));

    return NextResponse.json({ roles: transformedRoles }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/roles] Error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// POST: crear nuevo rol
export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const decoded: any = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
    // Verificar permisos para crear roles
    const [users] = await authSequelize.query(`
      SELECT u.ROLE_ID, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.ID = :userId AND u.STATUS = 'active'
    `, { replacements: { userId: decoded.id }, type: QueryTypes.SELECT });
    const userRow: any = Array.isArray(users) ? (users.length > 0 ? users[0] : null) : users;
    const roleName = (userRow?.ROLE_NAME || '').toUpperCase();
    let permissions: string[] = [];
    if (userRow && userRow.ROLE_ID != null) {
      const result = await authSequelize.query(`
        SELECT p.NAME FROM CGBRITO.PERMISSIONS p
        JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
        WHERE rp.ROLE_ID = :roleId
      `, { replacements: { roleId: userRow.ROLE_ID }, type: QueryTypes.SELECT });
      const rows = Array.isArray(result) ? result : [result];
      permissions = rows.map((r: any) => (r.NAME || r.name)).filter(Boolean);
    }
    const allowed = roleName === 'ADMIN' || permissions.includes('roles.manage') || permissions.includes('roles.create');
    if (!allowed) return NextResponse.json({ error: 'Sin permiso para crear roles' }, { status: 403 });

    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Nombre de rol inválido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un rol con ese nombre
    const [existingRole] = await authSequelize.query(
      'SELECT ID FROM CGBRITO.ROLES WHERE NAME = ?',
      {
        replacements: [name.trim()],
        type: QueryTypes.SELECT
      }
    );

    if (Array.isArray(existingRole) && existingRole.length > 0) {
      return NextResponse.json(
        { error: "Ya existe un rol con ese nombre" },
        { status: 409 }
      );
    }

    // Obtener el siguiente ID disponible
    const maxIdResult = await authSequelize.query(`
      SELECT MAX(ID) as max_id FROM CGBRITO.ROLES
    `, { type: QueryTypes.SELECT });
    
    // Si no hay roles, empezar con ID 1, sino usar el máximo + 1
    const nextId = maxIdResult && maxIdResult.length > 0 && (maxIdResult[0] as any)?.MAX_ID 
      ? parseInt((maxIdResult[0] as any).MAX_ID) + 1 
      : 1;

    // Crear el nuevo rol
    await authSequelize.query(
      `INSERT INTO CGBRITO.ROLES (ID, NAME, DESCRIPTION, CREATED_AT, UPDATED_AT) 
       VALUES (?, ?, ?, SYSDATE, SYSDATE)`,
      {
        replacements: [nextId, name.trim(), description || null],
        type: QueryTypes.INSERT
      }
    );

    return NextResponse.json(
      { 
        message: "Rol creado exitosamente",
        role: {
          id: nextId,
          name: name.trim(),
          description: description || null,
          status: 'active'
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/roles] Error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}


