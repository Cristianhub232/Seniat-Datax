"use client";

import React, { useEffect, useState } from "react";
import {
  Table, TableHeader, TableRow, TableCell, TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SkeletonTable } from "@/components/skeletons/tables/Table";
import { useUserData } from "@/context/UserContext";
import UserEditDrawer from "@/components/UserEditDrawer";
import ConfirmDialog from "@/components/ConfirmDialog";
import AddUserModal from "@/components/AddUserModal";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Role } from "@/types/role";

interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role_id: string;
  status: boolean;
  role: Role;
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminUsersPageContent />
    </ProtectedRoute>
  );
}

function AdminUsersPageContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);

  
  // Filtros de búsqueda
  const [filtroUsername, setFiltroUsername] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  
  const { user } = useUserData();
  const currentUserId = user?.id;

  const fetchData = async (username?: string, email?: string) => {
    try {
      setIsLoading(true);
      
      // Construir URL con parámetros de búsqueda
      const params = new URLSearchParams();
      if (username) params.append('username', username);
      if (email) params.append('email', email);
      
      const url = `/api/admin/users${params.toString() ? `?${params.toString()}` : ''}`;
      
      const [uRes, rRes] = await Promise.all([
        fetch(url).then((r) => r.json()),
        fetch("/api/admin/roles?all=true").then((r) => r.json()),
      ]);

      const usersData: User[] = Array.isArray(uRes)
        ? uRes
        : Array.isArray((uRes as any).users)
          ? (uRes as any).users
          : [];

      const rolesData: Role[] = Array.isArray(rRes.roles) ? rRes.roles : [];

      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando usuarios o roles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    fetchData(filtroUsername, filtroEmail);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroUsername("");
    setFiltroEmail("");
    fetchData();
  };

  const toggleStatus = async (id: string, status: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status } : u))
        );
        toast.success(status ? "Usuario activado" : "Usuario desactivado");
      }
    } catch {
      toast.error("Error actualizando estado del usuario");
    }
  };

  const changeRole = async (id: string, newRoleName: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRoleName }),
      });
      if (!res.ok) throw new Error((await res.json()).error);

      const newRoleObj = roles.find((r) => r.name === newRoleName);
      if (!newRoleObj) throw new Error("Rol no encontrado en frontend");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, role: newRoleObj, role_id: newRoleObj.id } : u
        )
      );
      toast.success("Rol actualizado");
    } catch (err: any) {
      toast.error(err.message || "Error actualizando rol");
    }
  };

  const handleEditSave = (updated: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
    );
  };

  const handleRoleUpdate = (updated: Role) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
    );
  };

  const handleRoleDelete = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/hard-delete`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast.success("Usuario eliminado");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "No se pudo eliminar el usuario");
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      toast.error("Error eliminando usuario");
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteUser(deleteId);
    }
    setOpenDelete(false);
    setDeleteId(null);
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Calcular estadísticas
  const totalUsuarios = users.length;
  const usuariosActivos = users.filter(user => user.status).length;
  const usuariosInactivos = totalUsuarios - usuariosActivos;
  const porcentajeActivos = totalUsuarios > 0 ? Math.round((usuariosActivos / totalUsuarios) * 100) : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema y asigna roles de acceso
          </p>
        </div>
        <Button onClick={() => setOpenAddUser(true)} className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Usuario
        </Button>
      </div>

      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-blue-900">{totalUsuarios}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-green-900">{usuariosActivos}</p>
                <p className="text-xs text-green-600">{porcentajeActivos}% del total</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Usuarios Inactivos</p>
                <p className="text-2xl font-bold text-yellow-900">{usuariosInactivos}</p>
                <p className="text-xs text-yellow-600">{totalUsuarios > 0 ? Math.round((usuariosInactivos / totalUsuarios) * 100) : 0}% del total</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Roles Únicos</p>
                <p className="text-2xl font-bold text-purple-900">{roles.length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold text-blue-900">Usuarios del Sistema</h1>
        </CardHeader>
        <CardContent>
          {/* Filtros de búsqueda */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filtro-username">Buscar por Username</Label>
                <Input
                  id="filtro-username"
                  value={filtroUsername}
                  onChange={(e) => setFiltroUsername(e.target.value)}
                  placeholder="Nombre de usuario..."
                  onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtro-email">Buscar por Email</Label>
                <Input
                  id="filtro-email"
                  value={filtroEmail}
                  onChange={(e) => setFiltroEmail(e.target.value)}
                  placeholder="Email del usuario..."
                  onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                />
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={aplicarFiltros} className="flex-1">
                  Buscar
                </Button>
                <Button onClick={limpiarFiltros} variant="outline">
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <SkeletonTable />
          ) : (
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="users">Usuarios</TabsTrigger>
              </TabsList>
              <TabsContent value="users">
                {/* Información de resultados */}
                <div className="mb-4 text-sm text-gray-600">
                  {users.length > 0 ? (
                    <span>Mostrando {users.length} usuario{users.length !== 1 ? 's' : ''}</span>
                  ) : !isLoading && (
                    <span>No se encontraron usuarios</span>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Nombre Completo</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Activo</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user.first_name || user.last_name || 'N/A'
                          }
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role.name}
                            onValueChange={(newRoleName) =>
                              changeRole(user.id, newRoleName)
                            }
                            disabled={user.id === currentUserId}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {roles.map((r) => (
                                  <SelectItem key={r.id} value={r.name}>
                                    {r.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={user.status}
                            onCheckedChange={(checked) =>
                              toggleStatus(user.id, !!checked)
                            }
                            disabled={user.id === currentUserId}
                          />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">Acciones</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onSelect={() => { setEditUser(user); setOpenEdit(true); }}>
                                Editar
                              </DropdownMenuItem>
                              {user.id !== currentUserId && (
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => confirmDelete(user.id)}
                                >
                                  Eliminar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

            </Tabs>
          )}
        </CardContent>
      </Card>
      <UserEditDrawer
        open={openEdit}
        onOpenChange={setOpenEdit}
        user={editUser}
        onSave={handleEditSave}
      />
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar usuario"
        description="¿Seguro que deseas eliminar este usuario?"
        confirmLabel="Eliminar"
      />
      <AddUserModal
        open={openAddUser}
        onOpenChange={setOpenAddUser}
        roles={roles}
        onSuccess={() => fetchData(filtroUsername, filtroEmail)}
      />

    </div>
  );
}
