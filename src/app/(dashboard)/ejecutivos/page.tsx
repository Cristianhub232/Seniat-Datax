"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconUserCheck, IconPlus, IconSearch, IconEdit, IconTrash, IconEye, IconAlertTriangle } from "@tabler/icons-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Ejecutivo {
  ID: string;
  CEDULA: string;
  NOMBRE: string;
  APELLIDO: string;
  EMAIL: string;
  STATUS: boolean;
  CREATED_AT: string;
  USER_ID?: string;
}

export default function EjecutivosPage() {
  return <EjecutivosPageContent />;
}

function EjecutivosPageContent() {
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEjecutivo, setEditingEjecutivo] = useState<Ejecutivo | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [ejecutivoToDelete, setEjecutivoToDelete] = useState<Ejecutivo | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    email: "",
    password: ""
  });

  // Fetch ejecutivos
  const fetchEjecutivos = async () => {
    try {
      const response = await fetch('/api/admin/ejecutivos');
      if (response.ok) {
        const data = await response.json();
        setEjecutivos(data);
      } else {
        toast.error("Error cargando ejecutivos");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEjecutivos();
  }, []);

  // Filter ejecutivos
  const filteredEjecutivos = ejecutivos.filter(ejecutivo =>
    ejecutivo.NOMBRE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ejecutivo.APELLIDO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ejecutivo.CEDULA?.includes(searchTerm) ||
    ejecutivo.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingEjecutivo 
        ? `/api/admin/ejecutivos/${editingEjecutivo.ID}`
        : '/api/admin/ejecutivos';
      
      const method = editingEjecutivo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingEjecutivo ? "Ejecutivo actualizado" : "Ejecutivo creado");
        setOpenDialog(false);
        resetForm();
        fetchEjecutivos();
      } else {
        const error = await response.json();
        toast.error(error.error || "Error en la operación");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      cedula: "",
      nombre: "",
      apellido: "",
      email: "",
      password: ""
    });
    setEditingEjecutivo(null);
  };

  // Handle edit
  const handleEdit = (ejecutivo: Ejecutivo) => {
    setEditingEjecutivo(ejecutivo);
    setFormData({
      cedula: ejecutivo.CEDULA,
      nombre: ejecutivo.NOMBRE,
      apellido: ejecutivo.APELLIDO,
      email: ejecutivo.EMAIL,
      password: ""
    });
    setOpenDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (ejecutivo: Ejecutivo) => {
    setEjecutivoToDelete(ejecutivo);
    setDeleteDialog(true);
  };

  // Handle delete execution
  const handleDeleteConfirm = async () => {
    if (!ejecutivoToDelete) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/ejecutivos/${ejecutivoToDelete.ID}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`Ejecutivo ${ejecutivoToDelete.NOMBRE} ${ejecutivoToDelete.APELLIDO} eliminado exitosamente`);
        fetchEjecutivos();
        setDeleteDialog(false);
        setEjecutivoToDelete(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error eliminando ejecutivo");
      }
    } catch (error) {
      toast.error("Error de conexión al eliminar ejecutivo");
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteDialog(false);
    setEjecutivoToDelete(null);
  };

  // Handle status toggle
  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/ejecutivos/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: !currentStatus }),
      });

      if (response.ok) {
        toast.success("Estado actualizado");
        fetchEjecutivos();
      } else {
        toast.error("Error actualizando estado");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  // Statistics
  const totalEjecutivos = ejecutivos.length;
  const ejecutivosActivos = ejecutivos.filter(e => e.STATUS).length;
  const ejecutivosInactivos = totalEjecutivos - ejecutivosActivos;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Ejecutivos</h1>
          <p className="text-muted-foreground">
            Administra los ejecutivos del sistema y sus cuentas de usuario
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="flex items-center gap-2">
              <IconPlus size={16} />
              Nuevo Ejecutivo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 -m-6 mb-6 p-6 rounded-t-lg">
              <DialogTitle className="text-white text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <IconUserCheck className="w-5 h-5 text-white" />
                </div>
                {editingEjecutivo ? "Editar Ejecutivo" : "Crear Nuevo Ejecutivo"}
              </DialogTitle>
              <p className="text-blue-100 text-sm mt-1">
                {editingEjecutivo ? "Modifica la información del ejecutivo" : "Completa los datos para crear un nuevo ejecutivo"}
              </p>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <IconUserCheck className="w-3 h-3 text-blue-600" />
                  </div>
                  Información Personal
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cedula" className="text-sm font-medium text-gray-700">
                      Cédula <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cedula"
                      value={formData.cedula}
                      onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                      placeholder="V-12345678"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="ejecutivo@seniat.gob.ve"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                      Nombre <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      placeholder="Juan"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido" className="text-sm font-medium text-gray-700">
                      Apellido <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      placeholder="Pérez"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contraseña (solo para nuevos ejecutivos) */}
              {!editingEjecutivo && (
                <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <IconUserCheck className="w-3 h-3 text-green-600" />
                    </div>
                    Credenciales de Acceso
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Contraseña Temporal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Contraseña temporal"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El ejecutivo deberá cambiar esta contraseña en su primer inicio de sesión
                    </p>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editingEjecutivo ? "Actualizar Ejecutivo" : "Crear Ejecutivo"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Ejecutivos</p>
                <p className="text-2xl font-bold text-blue-900">{totalEjecutivos}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <IconUserCheck className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Activos</p>
                <p className="text-2xl font-bold text-green-900">{ejecutivosActivos}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <IconUserCheck className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Inactivos</p>
                <p className="text-2xl font-bold text-yellow-900">{ejecutivosInactivos}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <IconUserCheck className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Con Cuenta</p>
                <p className="text-2xl font-bold text-purple-900">
                  {ejecutivos.filter(e => e.USER_ID).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <IconUserCheck className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Búsqueda y Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  type="text"
                  placeholder="Buscar ejecutivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ejecutivos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Cargando ejecutivos...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEjecutivos.map((ejecutivo) => (
                  <TableRow key={ejecutivo.ID}>
                    <TableCell className="font-medium">{ejecutivo.CEDULA}</TableCell>
                    <TableCell>{`${ejecutivo.NOMBRE} ${ejecutivo.APELLIDO}`}</TableCell>
                    <TableCell>{ejecutivo.EMAIL}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={ejecutivo.STATUS ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleStatusToggle(ejecutivo.ID, ejecutivo.STATUS)}
                      >
                        {ejecutivo.STATUS ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ejecutivo.USER_ID ? "default" : "outline"}>
                        {ejecutivo.USER_ID ? "Creada" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(ejecutivo)}
                        >
                          <IconEdit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(ejecutivo)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <IconTrash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && filteredEjecutivos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <IconUserCheck className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-lg font-medium">No se encontraron ejecutivos</p>
              <p className="text-sm">Crea el primer ejecutivo para comenzar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-red-50 border-2 border-red-200 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-red-600 to-pink-600 -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-white text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <IconAlertTriangle className="w-5 h-5 text-white" />
              </div>
              Confirmar Eliminación
            </DialogTitle>
            <p className="text-red-100 text-sm mt-1">
              Esta acción no se puede deshacer
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Información del ejecutivo a eliminar */}
            {ejecutivoToDelete && (
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <IconUserCheck className="w-3 h-3 text-red-600" />
                  </div>
                  Ejecutivo a Eliminar
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Cédula:</span>
                    <span className="text-sm text-gray-800 font-semibold">{ejecutivoToDelete.CEDULA}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Nombre:</span>
                    <span className="text-sm text-gray-800 font-semibold">{ejecutivoToDelete.NOMBRE} {ejecutivoToDelete.APELLIDO}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <span className="text-sm text-gray-800 font-semibold">{ejecutivoToDelete.EMAIL}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Estado:</span>
                    <Badge variant={ejecutivoToDelete.STATUS ? "default" : "secondary"}>
                      {ejecutivoToDelete.STATUS ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Cuenta de Usuario:</span>
                    <Badge variant={ejecutivoToDelete.USER_ID ? "default" : "outline"}>
                      {ejecutivoToDelete.USER_ID ? "Creada" : "Pendiente"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Advertencia */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-800">Advertencia Importante</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Se eliminará permanentemente el ejecutivo del sistema</li>
                    <li>• Si tiene cuenta de usuario, también será eliminada</li>
                    <li>• Se perderán todos los datos asociados</li>
                    <li>• Esta acción no se puede deshacer</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <IconTrash className="w-4 h-4 mr-2" />
                    Eliminar Ejecutivo
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 