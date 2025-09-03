import { useMemo, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface Permission {
  resource: string;
  action: string;
}

export function usePermissions() {
  const { isAuthenticated, user, isLoading } = useAuth();

  const hasPermission = useCallback((requiredPermission: Permission): boolean => {
    console.log('🔐 usePermissions - hasPermission llamado con:', {
      requiredPermission,
      isAuthenticated,
      user: user ? { role: user.role, permissions: user.permissions?.length } : null
    });
    
    if (!isAuthenticated || !user || isLoading) {
      console.log('   ❌ No autenticado, sin usuario o cargando');
      return false;
    }
    
    // ADMIN tiene todos los permisos
    if (user.role === 'ADMIN') {
      console.log('   ✅ Usuario es ADMIN, permitiendo acceso');
      return true;
    }
    
    // Verificar si el usuario tiene el permiso específico
    // Los permisos vienen del contexto de autenticación, no del UserData
    // Por ahora, implementar lógica básica basada en el rol
    if (user.role === 'Ejecutivo') {
      // Ejecutivo solo tiene permisos limitados
      const allowedPermissions = [
        'dashboard.access',
        'dashboard.metrics',
        'ejecutivos.read',
        'ejecutivos.update',
        'tickets.manage',
        'cartera.manage',
        'pagos.manage',
        'reports.access'
      ];
      
      const permissionString = `${requiredPermission.resource}.${requiredPermission.action}`;
      return allowedPermissions.includes(permissionString);
    }
    
    return false;
  }, [isAuthenticated, user, isLoading]);

  const hasAnyPermission = useCallback((requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const canAccess = useCallback((resource: string, action: string): boolean => {
    return hasPermission({ resource, action });
  }, [hasPermission]);

  const canManage = useCallback((resource: string): boolean => {
    return hasPermission({ resource, action: 'manage' });
  }, [hasPermission]);

  const canRead = useCallback((resource: string): boolean => {
    return hasPermission({ resource, action: 'read' });
  }, [hasPermission]);

  const canCreate = useCallback((resource: string): boolean => {
    return hasPermission({ resource, action: 'create' });
  }, [hasPermission]);

  const canUpdate = useCallback((resource: string): boolean => {
    return hasPermission({ resource, action: 'update' });
  }, [hasPermission]);

  const canDelete = useCallback((resource: string): boolean => {
    return hasPermission({ resource, action: 'delete' });
  }, [hasPermission]);

  return {
    permissions: [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    canManage,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    isAdmin: user?.role === 'ADMIN',
    userRole: user?.role,
    isLoading
  };
}

// Hook para verificar permisos específicos del módulo
export function useModulePermissions(moduleName: string) {
  const { canRead, canCreate, canUpdate, canDelete, canManage } = usePermissions();
  
  return {
    canRead: canRead(moduleName),
    canCreate: canCreate(moduleName),
    canUpdate: canUpdate(moduleName),
    canDelete: canDelete(moduleName),
    canManage: canManage(moduleName),
    hasFullAccess: canManage(moduleName),
    hasReadAccess: canRead(moduleName),
    hasWriteAccess: canCreate(moduleName) || canUpdate(moduleName),
    hasDeleteAccess: canDelete(moduleName)
  };
}
