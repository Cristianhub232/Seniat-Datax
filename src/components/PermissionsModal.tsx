"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Save, X, Loader2 } from "lucide-react";

interface Permission {
  permission_id: number;
  resource: string;
  action: string;
  permission_name?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface PermissionsModalProps {
  open: boolean;
  onClose: () => void;
  role: Role;
  onPermissionsUpdated: () => void;
}

export function PermissionsModal({ open, onClose, role, onPermissionsUpdated }: PermissionsModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar permisos disponibles y permisos actuales del rol
  useEffect(() => {
    if (open && role) {
      loadPermissions();
    }
  }, [open, role]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los permisos disponibles
      const allPermissionsResponse = await fetch('/api/admin/roles?all=true', {
        credentials: 'include'
      });
      
      if (!allPermissionsResponse.ok) {
        throw new Error('Error cargando permisos');
      }

      // Obtener permisos actuales del rol
      const rolePermissionsResponse = await fetch(`/api/admin/roles/${role.id}/permissions`, {
        credentials: 'include'
      });

      if (rolePermissionsResponse.ok) {
        const roleData = await rolePermissionsResponse.json();
        const currentPermissionIds = roleData.permissions.map((p: Permission) => p.permission_id);
        setSelectedPermissions(currentPermissionIds);
      }

      // Por ahora usar permisos estáticos basados en la auditoría
      const staticPermissions: Permission[] = [
        { permission_id: 1, resource: 'dashboard', action: 'access' },
        { permission_id: 2, resource: 'dashboard', action: 'metrics' },
        { permission_id: 3, resource: 'users', action: 'read' },
        { permission_id: 4, resource: 'users', action: 'create' },
        { permission_id: 5, resource: 'users', action: 'update' },
        { permission_id: 6, resource: 'users', action: 'delete' },
        { permission_id: 7, resource: 'users', action: 'manage' },
        { permission_id: 8, resource: 'roles', action: 'read' },
        { permission_id: 9, resource: 'roles', action: 'create' },
        { permission_id: 10, resource: 'roles', action: 'update' },
        { permission_id: 11, resource: 'roles', action: 'delete' },
        { permission_id: 12, resource: 'roles', action: 'manage' },
        { permission_id: 13, resource: 'ejecutivos', action: 'read' },
        { permission_id: 14, resource: 'ejecutivos', action: 'create' },
        { permission_id: 15, resource: 'ejecutivos', action: 'update' },
        { permission_id: 16, resource: 'ejecutivos', action: 'delete' },
        { permission_id: 17, resource: 'ejecutivos', action: 'manage' },
        { permission_id: 18, resource: 'cartera', action: 'read' },
        { permission_id: 19, resource: 'cartera', action: 'manage' },
        { permission_id: 20, resource: 'reports', action: 'access' },
        { permission_id: 21, resource: 'reports', action: 'manage' },
        { permission_id: 22, resource: 'tickets', action: 'read' },
        { permission_id: 23, resource: 'tickets', action: 'create' },
        { permission_id: 24, resource: 'tickets', action: 'update' },
        { permission_id: 25, resource: 'tickets', action: 'delete' },
        { permission_id: 26, resource: 'tickets', action: 'manage' },
        { permission_id: 27, resource: 'system', action: 'config' },
        { permission_id: 28, resource: 'system', action: 'logs' },
        { permission_id: 29, resource: 'system', action: 'backup' },
        { permission_id: 30, resource: 'audit', action: 'read' },
        { permission_id: 31, resource: 'audit', action: 'export' }
      ];

      setPermissions(staticPermissions);
      
    } catch (error) {
      console.error('Error cargando permisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/roles/${role.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          permissions: selectedPermissions.map(id => ({ permission_id: id }))
        })
      });

      if (response.ok) {
        onPermissionsUpdated();
        onClose();
      } else {
        throw new Error('Error actualizando permisos');
      }
    } catch (error) {
      console.error('Error guardando permisos:', error);
    } finally {
      setSaving(false);
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'dashboard': return '📊';
      case 'users': return '👥';
      case 'roles': return '🛡️';
      case 'ejecutivos': return '👨‍💼';
      case 'cartera': return '💰';
      case 'reports': return '📋';
      case 'tickets': return '🎫';
      case 'system': return '⚙️';
      case 'audit': return '🔍';
      default: return '📄';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-yellow-100 text-yellow-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'manage': return 'bg-purple-100 text-purple-800';
      case 'access': return 'bg-gray-100 text-gray-800';
      case 'metrics': return 'bg-indigo-100 text-indigo-800';
      case 'config': return 'bg-orange-100 text-orange-800';
      case 'logs': return 'bg-pink-100 text-pink-800';
      case 'backup': return 'bg-teal-100 text-teal-800';
      case 'export': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <div>
                <CardTitle className="text-xl">Gestionar Permisos del Rol</CardTitle>
                <CardDescription className="text-blue-100">
                  {role.name} - {role.description || 'Sin descripción'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando permisos...</span>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Permisos Disponibles</h3>
                <p className="text-sm text-gray-600">
                  Selecciona los permisos que deseas asignar al rol <strong>{role.name}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {permissions.map((permission) => (
                  <div
                    key={permission.permission_id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedPermissions.includes(permission.permission_id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePermissionToggle(permission.permission_id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedPermissions.includes(permission.permission_id)}
                        onChange={() => handlePermissionToggle(permission.permission_id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getResourceIcon(permission.resource)}</span>
                          <span className="font-medium text-sm capitalize">
                            {permission.resource}
                          </span>
                        </div>
                        <Badge className={`text-xs ${getActionColor(permission.action)}`}>
                          {permission.action}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {permission.resource}.{permission.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <strong>{selectedPermissions.length}</strong> de <strong>{permissions.length}</strong> permisos seleccionados
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Permisos
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
