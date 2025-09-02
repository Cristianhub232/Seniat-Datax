import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/controllers/authController";

export async function GET(req: NextRequest) {
  try {
    // Obtener el token de la cookie
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Verificar la sesión
    const sessionResult = await verifySession(token);
    
    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    // Devolver información del usuario
    return NextResponse.json({
      user: sessionResult.user,
      authenticated: true
    });

  } catch (error) {
    console.error("❌ Error en endpoint /me:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 