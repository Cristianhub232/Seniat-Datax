import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/index";
import { verifyToken } from "@/lib/jwtUtils";
import { Op } from "sequelize";

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!verifyToken(token)) return NextResponse.json({ error: "Token inválido" }, { status: 403 });

  try {
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Token inválido" }, { status: 403 });
    }

    const body = await req.json();
    const { first_name, last_name, phone, location, bio } = body;

    // Validar que al menos un campo editable esté presente
    if (!first_name && !last_name && !phone && !location && !bio) {
      return NextResponse.json(
        { error: "Al menos un campo debe ser proporcionado para actualizar" },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Los campos username y email no se pueden modificar desde este endpoint
    // Solo se permiten modificar campos de perfil personales

    // Actualizar solo los campos editables del usuario
    await user.update({
      first_name: first_name?.trim() || null,
      last_name: last_name?.trim() || null,
      phone: phone?.trim() || null,
      location: location?.trim() || null,
      bio: bio?.trim() || null
    });

    // Obtener el usuario actualizado con el rol usando consulta SQL directa
    const [updatedUsers] = await User.sequelize!.query(`
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, 
        u.avatar, u.phone, u.location, u.bio, u.status, 
        u.created_at, u.last_login,
        r.name as role_name
      FROM app.users u
      INNER JOIN app.roles r ON u.role_id = r.id
      WHERE u.id = :userId
    `, {
      replacements: { userId: decoded.id },
      type: require('sequelize').QueryTypes.SELECT
    });

    const userData = updatedUsers && (updatedUsers as any[])[0] ? {
      ...(updatedUsers as any[])[0],
      role: { name: (updatedUsers as any[])[0].role_name }
    } : null;

    return NextResponse.json(
      { 
        message: "Perfil actualizado exitosamente",
        user: userData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PUT /api/account/profile] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 