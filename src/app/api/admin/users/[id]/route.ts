import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { authSequelize } from "@/lib/db";
import { z } from "zod";
import { updateUserSchema } from "@/schemas/userSchemas";
import { hashPassword } from "@/lib/authUtils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!uuidValidate(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const [users] = await authSequelize.query(`
      SELECT u.ID as id, u.USERNAME as username, u.EMAIL as email, u.ROLE_ID as role_id, u.STATUS as status, u.CREATED_AT as created_at, u.UPDATED_AT as updated_at,
             r.NAME as role_name
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.ID = ?
    `, {
      replacements: [id],
      type: 'SELECT'
    });

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const user = users[0] as any;
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      status: user.status === 'active' || user.status === true,
      created_at: user.created_at,
      updated_at: user.updated_at,
      role: {
        id: user.role_id,
        name: user.role_name || 'Sin rol'
      }
    };

    return NextResponse.json({ user: userData });
  } catch (err) {
    console.error("[GET /admin/users/:id] Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uuidValidate(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch (error) {
    console.error('[PATCH /admin/users/:id] JSON parse error:', error);
    return NextResponse.json(
      { error: 'JSON malformado en el body' },
      { status: 400 }
    );
  }

  let body: Record<string, any>;
  try {
    body = updateUserSchema.parse(parsedBody);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err.issues }, { status: 400 });
    }
    console.error('[PATCH /admin/users/:id] Zod validation error:', err);
    return NextResponse.json(
      { error: 'Error validando datos' },
      { status: 400 }
    );
  }

  const messages: string[] = [];
  const updates: string[] = [];
  const queryParams: any[] = [];

  if (body.password) {
    const hashed = await hashPassword(body.password);
    updates.push('PASSWORD_HASH = ?');
    queryParams.push(hashed);
    messages.push('Contraseña actualizada');
  }

  if (body.role) {
    // Obtener role_id a partir del nombre de rol
    const [roleResult] = await authSequelize.query(
      'SELECT ID FROM CGBRITO.ROLES WHERE NAME = ?',
      {
        replacements: [body.role],
        type: 'SELECT'
      }
    );

    const role = Array.isArray(roleResult) ? roleResult[0] : roleResult;
    if (!role || !(role as any).id) {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }

    updates.push('ROLE_ID = ?');
    queryParams.push((role as any).id);
    messages.push('Rol actualizado');
  }

  if (body.email) {
    updates.push('EMAIL = ?');
    queryParams.push(body.email);
    messages.push('Email actualizado');
  }

  if (body.username) {
    updates.push('USERNAME = ?');
    queryParams.push(body.username);
    messages.push('Nombre de usuario actualizado');
  }

  if (updates.length === 0) {
    messages.push('Sin cambios a aplicar');
  } else {
    updates.push('UPDATED_AT = SYSDATE');
    queryParams.push(id);

    const updateQuery = `UPDATE CGBRITO.USERS SET ${updates.join(', ')} WHERE ID = ?`;
    
    try {
      const [affected] = await authSequelize.query(updateQuery, {
        replacements: queryParams,
        type: 'UPDATE'
      });

      if (!affected) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }
    } catch (err) {
      console.error('[PATCH /admin/users/:id] DB update error:', err);
      return NextResponse.json({ error: 'Error actualizando usuario' }, { status: 500 });
    }
  }

  return NextResponse.json({ message: messages.join(', ') }, { status: 200 });
}


