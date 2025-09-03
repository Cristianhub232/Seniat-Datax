import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwtUtils";
import { authSequelize } from "@/lib/db";

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

    // Token válido - buscar permisos del rol
    let permissions: string[] = [];
    try {
      const [users] = await authSequelize.query(`
        SELECT u.ROLE_ID, r.NAME as ROLE_NAME
        FROM CGBRITO.USERS u
        JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
        WHERE u.ID = :userId AND u.STATUS = 'active'
      `, { replacements: { userId: decoded.id }, type: 'SELECT' });

      const userRow: any = Array.isArray(users) ? (users.length > 0 ? users[0] : null) : users;
      if (userRow && userRow.ROLE_ID != null) {
        const permsResult = await authSequelize.query(`
          SELECT p.NAME
          FROM CGBRITO.PERMISSIONS p
          JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
          WHERE rp.ROLE_ID = :roleId
        `, { replacements: { roleId: userRow.ROLE_ID }, type: 'SELECT' });

        const rows = Array.isArray(permsResult) ? permsResult : [permsResult];
        permissions = rows
          .map((r: any) => (Array.isArray(r) ? r : r))
          .flat()
          .filter((p: any) => p && (p.NAME || p.name))
          .map((p: any) => p.NAME || p.name);
      }
    } catch (err: any) {
      console.log('[GET /api/auth/me] No se pudieron obtener permisos:', err?.message);
      permissions = [];
    }

    // Devolver información del usuario
    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.id,
        role: decoded.role,
        permissions,
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