import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/controllers/authController";
import { verifyToken } from "@/lib/jwtUtils";

export async function POST(req: NextRequest) {
  try {
    // Obtener el token de la cookie
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Verificar el token JWT
    const decoded = verifyToken(token);
    
    if (!decoded?.id) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    // Obtener información del cliente
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Cerrar sesión
    const result = await logoutUser(
      decoded.id,
      token,
      ipAddress,
      userAgent
    );

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Crear respuesta y eliminar cookie
    const response = NextResponse.json({
      message: result.message
    });

    // Eliminar la cookie de autenticación
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    console.log(`✅ Logout exitoso para usuario: ${decoded.id}`);

    return response;
  } catch (error) {
    console.error("❌ Error en endpoint de logout:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
