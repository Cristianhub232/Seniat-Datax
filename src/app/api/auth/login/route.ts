import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/controllers/authController";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    // Validar datos de entrada
    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Obtener información del cliente
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log(`🔍 Intento de login desde IP: ${ipAddress}`);

    const result = await loginUser(username, password, ipAddress, userAgent);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({
      message: result.message,
      user: {
        id: result.id,
        username: result.username,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        role: result.role,
        permissions: result.permissions
      }
    });

    // Configurar cookie de autenticación
    const isHttps = req.nextUrl.protocol === "https:";
    response.cookies.set("auth_token", result.token!, {
      httpOnly: true,
      path: "/",
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 día
    });

    console.log(`✅ Login exitoso para usuario: ${username}`);

    return response;
  } catch (error) {
    console.error("❌ Error en endpoint de login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
