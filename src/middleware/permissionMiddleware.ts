import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/controllers/authController';

export interface PermissionCheck {
  resource: string;
  action: string;
}

export async function checkPermission(
  req: NextRequest,
  requiredPermission: PermissionCheck
): Promise<{ hasPermission: boolean; user?: any; error?: string }> {
  try {
    // Verificar autenticación
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return { hasPermission: false, error: "No autenticado" };
    }

    // Verificar sesión y obtener usuario
    const sessionResult = await verifySession(token);
    if ("error" in sessionResult) {
      return { hasPermission: false, error: sessionResult.error };
    }

    const user = sessionResult;
    
    // Si es ADMIN, tiene todos los permisos
    if (user.role === 'ADMIN') {
      return { hasPermission: true, user };
    }

    // Verificar permiso específico
    const hasPermission = await verifyUserPermission(user.id, requiredPermission);
    
    return { hasPermission, user };
  } catch (error) {
    console.error('Error verificando permisos:', error);
    return { hasPermission: false, error: "Error interno del servidor" };
  }
}

async function verifyUserPermission(
  userId: string,
  requiredPermission: PermissionCheck
): Promise<boolean> {
  try {
    const { authSequelize } = await import('@/lib/db');
    
    const result = await authSequelize.query(`
      SELECT COUNT(*) as has_permission
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
      JOIN CGBRITO.PERMISSIONS p ON rp.PERMISSION_ID = p.ID
      WHERE u.ID = :userId
      AND p.RESOURCE_NAME = :resource
      AND p.ACTION_NAME = :action
      AND u.STATUS = 'active'
      AND r.IS_ACTIVE = 1
      AND p.IS_ACTIVE = 1
    `, {
      replacements: { userId, resource: requiredPermission.resource, action: requiredPermission.action },
      type: 'SELECT'
    });

    // Verificar si el resultado tiene la estructura esperada
    const hasPermission = result && result[0] && result[0][0] && result[0][0].HAS_PERMISSION > 0;
    return Boolean(hasPermission);
  } catch (error) {
    console.error('Error verificando permiso específico:', error);
    return false;
  }
}

// Middleware para rutas que requieren permisos específicos
export function withPermission(requiredPermission: PermissionCheck) {
  return async function (req: NextRequest) {
    const permissionResult = await checkPermission(req, requiredPermission);
    
    if (!permissionResult.hasPermission) {
      return NextResponse.json(
        { error: "Acceso denegado. No tienes los permisos necesarios." },
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  };
}

// Middleware para rutas que requieren múltiples permisos (OR lógico)
export function withAnyPermission(requiredPermissions: PermissionCheck[]) {
  return async function (req: NextRequest) {
    for (const permission of requiredPermissions) {
      const permissionResult = await checkPermission(req, permission);
      if (permissionResult.hasPermission) {
        return NextResponse.next();
      }
    }
    
    return NextResponse.json(
      { error: "Acceso denegado. No tienes los permisos necesarios." },
      { status: 403 }
    );
  };
}

// Middleware para rutas que requieren múltiples permisos (AND lógico)
export function withAllPermissions(requiredPermissions: PermissionCheck[]) {
  return async function (req: NextRequest) {
    for (const permission of requiredPermissions) {
      const permissionResult = await checkPermission(req, permission);
      if (!permissionResult.hasPermission) {
        return NextResponse.json(
          { error: "Acceso denegado. No tienes los permisos necesarios." },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.next();
  };
}
