import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwtUtils";

export async function GET(req: NextRequest) {
  try {
    // Obtener el token de la cookie
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: "No hay sesión activa" 
        },
        { status: 401 }
      );
    }

    // Verificar el token JWT
    const decoded = verifyToken(token);
    
    if (!decoded?.id) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: "Token inválido o expirado" 
        },
        { status: 401 }
      );
    }

    // Token válido - devolver información del usuario
    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.id,
        role: decoded.role,
        // Agregar más campos si es necesario
      },
      message: "Sesión válida"
    });

  } catch (error) {
    console.error("❌ Error en endpoint /me:", error);
    return NextResponse.json(
      { 
        authenticated: false, 
        error: "Error interno del servidor" 
      },
      { status: 500 }
    );
  }
} 