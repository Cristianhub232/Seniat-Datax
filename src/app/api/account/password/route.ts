import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/index";
import { verifyToken } from "@/lib/jwtUtils";
import bcrypt from "bcrypt";

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
    const { current_password, new_password } = body;

    // Validar campos requeridos
    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: "Contraseña actual y nueva contraseña son requeridas" },
        { status: 400 }
      );
    }

    // Validar longitud de la nueva contraseña
    if (new_password.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
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

    // Verificar la contraseña actual
    const isValidPassword = await bcrypt.compare(current_password, (user as any).password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 400 }
      );
    }

    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(new_password, (user as any).password_hash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "La nueva contraseña debe ser diferente a la actual" },
        { status: 400 }
      );
    }

    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Actualizar la contraseña
    await user.update({
      password_hash: hashedPassword
    });

    return NextResponse.json(
      { message: "Contraseña actualizada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PUT /api/account/password] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 