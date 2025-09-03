'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: string;
    action: string;
  };
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole,
  fallback = null 
}: ProtectedRouteProps) {
  const { hasPermission, isAdmin, userRole, isLoading } = usePermissions();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Debug logs
  console.log('🔒 ProtectedRoute - Debug:', {
    requiredPermission,
    requiredRole,
    hasPermission: requiredPermission ? hasPermission(requiredPermission) : 'N/A',
    isAdmin,
    userRole,
    isAuthenticated,
    isLoading,
    hasPermissionFn: typeof hasPermission
  });

  useEffect(() => {
    console.log('🔒 ProtectedRoute - useEffect ejecutado:', {
      requiredRole,
      userRole,
      isAdmin,
      requiredPermission,
      hasPermissionResult: requiredPermission ? hasPermission(requiredPermission) : 'N/A',
      isAuthenticated,
      isLoading
    });

    // Si está cargando, esperar
    if (isLoading) {
      console.log('⏳ ProtectedRoute - Esperando carga...');
      return;
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      console.log('🚫 ProtectedRoute - No autenticado, redirigiendo a login');
      router.push('/login');
      return;
    }

    // Si se requiere un rol específico
    if (requiredRole && userRole !== requiredRole && !isAdmin) {
      console.log(`🚫 Acceso denegado: Se requiere rol ${requiredRole}, usuario tiene ${userRole}`);
      router.push('/dashboard');
      return;
    }

    // Si se requiere un permiso específico
    if (requiredPermission && !hasPermission(requiredPermission) && !isAdmin) {
      console.log(`🚫 Acceso denegado: Se requiere permiso ${requiredPermission.resource}.${requiredPermission.action}`);
      router.push('/dashboard');
      return;
    }

    console.log('✅ ProtectedRoute - Acceso permitido');
  }, [requiredPermission, requiredRole, hasPermission, isAdmin, userRole, router, isAuthenticated, isLoading]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar mensaje de carga (será redirigido por useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  // Si se requiere un rol específico
  if (requiredRole && userRole !== requiredRole && !isAdmin) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Si se requiere un permiso específico
  if (requiredPermission && !hasPermission(requiredPermission) && !isAdmin) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
