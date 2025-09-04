"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Users, Eye, EyeOff, Settings, Lock, Unlock } from "lucide-react";
import { AddRoleModal } from "@/components/AddRoleModal";
import { EditRoleModal } from "@/components/EditRoleModal";
import { RoleTable } from "@/components/RoleTable";
import { PermissionsModal } from "@/components/PermissionsModal";
import { usePermissions } from "@/hooks/usePermissions";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Role {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
  userCount?: number;
  permissions?: string[];
}

interface Menu {
  id: string;
  key: string;
  label: string;
  route: string;
  section: string;
  status: boolean;
}

export default function RolesPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: 'roles', action: 'read' }}>
      <RolesPageContent />
    </ProtectedRoute>
  );
}

function RolesPageContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { canRead, canCreate, canUpdate, canDelete, canManage, isAdmin } = usePermissions();

  // Cargar roles
  const loadRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles?all=true', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error cargando roles:', error);
    }
  };

  // Menús: evitar fetch redundante aquí; se obtienen vía barra lateral/contexto
  const loadMenus = async () => { setMenus([] as any); };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([loadRoles()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRoleCreated = () => {
    setShowAddModal(false);
    loadRoles();
  };

  const handleRoleUpdated = () => {
    setShowPermissionsModal(false);
    setSelectedRole(null);
    loadRoles();
  };

  const handleEditPermissions = (role: Role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  // Si no tiene permisos de lectura, mostrar mensaje de acceso denegado
  if (!canRead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-900">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a la gestión de roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Contacta a un administrador para solicitar los permisos necesarios.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles</h1>
          <p className="text-gray-600 mt-2">
            Administra los roles del sistema y sus permisos asociados
          </p>
        </div>
        
        {canCreate && (
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Rol
          </Button>
        )}
      </div>

      {/* Estadísticas de roles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total de Roles</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{roles.length}</div>
            <p className="text-xs text-blue-700">
              Roles configurados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Roles Activos</CardTitle>
            <Unlock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {roles.filter(role => role.status === 'active').length}
            </div>
            <p className="text-xs text-green-700">
              Roles en uso actualmente
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Usuarios Asignados</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {roles.reduce((total, role) => total + (role.userCount || 0), 0)}
            </div>
            <p className="text-xs text-purple-700">
              Total de usuarios con roles
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Permisos Totales</CardTitle>
            <Settings className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {roles.reduce((total, role) => total + (role.permissions?.length || 0), 0)}
            </div>
            <p className="text-xs text-orange-700">
              Permisos asignados en total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de roles */}
      <Card>
        <CardHeader>
          <CardTitle>Roles del Sistema</CardTitle>
          <CardDescription>
            Lista de todos los roles configurados y sus permisos asociados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <RoleTable 
              roles={roles}
              onEditPermissions={handleEditPermissions}
              onEditRole={handleEditRole}
              onRoleUpdated={handleRoleUpdated}
              canEdit={typeof canUpdate === 'boolean' ? canUpdate : isAdmin}
              canDelete={typeof canDelete === 'boolean' ? canDelete : isAdmin}
            />
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      {canCreate && (
        <AddRoleModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onRoleCreated={handleRoleCreated}
        />
      )}

      {canUpdate && selectedRole && (
        <EditRoleModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onRoleUpdated={handleRoleUpdated}
          role={selectedRole}
        />
      )}

      {/* Modal de permisos - solo para roles que se pueden editar */}
      {selectedRole && (canUpdate || isAdmin) && (
        <PermissionsModal
          open={showPermissionsModal}
          onClose={() => {
            setShowPermissionsModal(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
          onPermissionsUpdated={handleRoleUpdated}
        />
      )}
    </div>
  );
} 