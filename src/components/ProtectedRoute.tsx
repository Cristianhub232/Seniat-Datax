'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

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
  const { hasPermission, isAdmin, userRole } = usePermissions();
  const router = useRouter();

  useEffect(() => {
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
  }, [requiredPermission, requiredRole, hasPermission, isAdmin, userRole, router]);

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
