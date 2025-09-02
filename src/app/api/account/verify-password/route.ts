import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/index";
import { verifyToken } from "@/lib/jwtUtils";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!verifyToken(token)) return NextResponse.json({ error: "Token inválido" }, { status: 403 });

  try {
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Token inválido" }, { status: 403 });
    }

    const body = await req.json();
    const { password } = body;

    // Validar campo requerido
    if (!password) {
      return NextResponse.json(
        { error: "Contraseña es requerida" },
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

    // Verificar la contraseña
    const isValidPassword = await bcrypt.compare(password, (user as any).password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Autorización exitosa" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/account/verify-password] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 