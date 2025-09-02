"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Users, Edit, Trash2, Eye } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface Role {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
  userCount?: number;
}

interface RoleTableProps {
  roles: Role[];
  onEditPermissions: (role: Role) => void;
  onRoleUpdated: () => void;
  onEditRole?: (role: Role) => void;
}

export function RoleTable({ roles, onEditPermissions, onRoleUpdated, onEditRole }: RoleTableProps) {
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteRole = async () => {
    if (!deleteRole) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/roles/${deleteRole.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        onRoleUpdated();
        setDeleteRole(null);
      } else {
        console.error('Error eliminando rol');
      }
    } catch (error) {
      console.error('Error eliminando rol:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Activo
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Inactivo
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Usuarios</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  {role.name}
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                {role.description || 'Sin descripción'}
              </TableCell>
              <TableCell>
                {getStatusBadge(role.status)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{role.userCount || 0}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                {formatDate(role.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditPermissions(role)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Permisos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditRole?.(role)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Editar
                  </Button>
                  {role.name !== 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteRole(role)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de confirmación para eliminar */}
      <ConfirmDialog
        open={!!deleteRole}
        onOpenChange={(open) => { if (!open) setDeleteRole(null) }}
        title="Eliminar Rol"
        description={`¿Estás seguro de que quieres eliminar el rol "${deleteRole?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteRole}
        confirmLabel="Eliminar"
      />
    </>
  );
}
