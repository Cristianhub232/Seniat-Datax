import { NextRequest, NextResponse } from "next/server";
import { authSequelize } from '@/lib/db';

// GET: listar roles
export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    let sql = `
      SELECT r.ID as id, r.NAME as name, r.DESCRIPTION as description, r.CREATED_AT as created_at, r.UPDATED_AT as updated_at,
             COUNT(u.ID) as user_count
      FROM CGBRITO.ROLES r
      LEFT JOIN CGBRITO.USERS u ON r.ID = u.ROLE_ID
    `;
    
    const params: any[] = [];
    
    // Removemos el filtro por STATUS ya que la tabla ROLES no tiene esa columna
    // if (!all) {
    //   sql += ' WHERE r.STATUS = ?';
    //   params.push('active');
    // }
    
    sql += ' GROUP BY r.ID, r.NAME, r.DESCRIPTION, r.CREATED_AT, r.UPDATED_AT';
    sql += ' ORDER BY r.CREATED_AT DESC';

    const result = await authSequelize.query(sql, {
      replacements: params,
      type: 'SELECT'
    });

    // Extraer el array de roles del resultado
    const roles = Array.isArray(result) ? result : [result];

    // Transformar los resultados
    const transformedRoles = roles.map((role: any) => ({
      id: role.ID || role.id,
      name: role.NAME || role.name,
      description: role.DESCRIPTION || role.description,
      status: 'active', // Asumimos que todos los roles están activos
      created_at: role.CREATED_AT || role.created_at,
      updated_at: role.UPDATED_AT || role.updated_at,
      userCount: parseInt(role.USER_COUNT || role.user_count) || 0
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
        type: 'SELECT'
      }
    );

    if (Array.isArray(existingRole) && existingRole.length > 0) {
      return NextResponse.json(
        { error: "Ya existe un rol con ese nombre" },
        { status: 409 }
      );
    }

    // Obtener el siguiente ID disponible
    const [maxIdResult] = await authSequelize.query(`
      SELECT MAX(ID) as max_id FROM CGBRITO.ROLES
    `);
    const nextId = ((maxIdResult[0] as any).MAX_ID || 0) + 1;

    // Crear el nuevo rol
    await authSequelize.query(
      `INSERT INTO CGBRITO.ROLES (ID, NAME, DESCRIPTION, CREATED_AT, UPDATED_AT) 
       VALUES (?, ?, ?, SYSDATE, SYSDATE)`,
      {
        replacements: [nextId, name.trim(), description || null],
        type: 'INSERT'
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


