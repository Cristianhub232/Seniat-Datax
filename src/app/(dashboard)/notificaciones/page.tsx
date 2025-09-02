'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconBell, IconPlus, IconSearch, IconFilter, IconRefresh, IconInfoCircle, IconAlertTriangle, IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Notification, NotificationFilters, NotificationStats } from '@/types/notification';
import { toast } from 'sonner';
import { useUserData } from '@/context/UserContext';
import AddNotificationModal from '@/components/AddNotificationModal';
import EditNotificationModal from '@/components/EditNotificationModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useUserData();
  
  // Verificar si el usuario es admin (por role_id)
  const isAdmin = user?.role_id === '9e70462a-b908-4dd6-9ec8-819f82547d21';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-VE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <IconInfoCircle className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <IconAlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <IconCircleX className="h-4 w-4 text-red-500" />;
      case 'success':
        return <IconCircleCheck className="h-4 w-4 text-green-500" />;
      default:
        return <IconInfoCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchNotifications = async (page = 1, newFilters?: NotificationFilters) => {
    setLoading(true);
    try {
      const currentFilters = newFilters || filters;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(currentFilters.type && { type: currentFilters.type }),
        ...(currentFilters.priority && { priority: currentFilters.priority }),
        ...(currentFilters.is_active !== undefined && { is_active: currentFilters.is_active.toString() }),
        ...(currentFilters.search && { search: currentFilters.search })
      });

      const response = await fetch(`/api/notifications?${params}`);
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data);
        setStats(result.stats);
        setPagination(result.pagination);
      } else {
        console.error('Error en la respuesta:', result.error);
        toast.error('Error cargando notificaciones');
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      toast.error('Error al obtener notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchNotifications(newPage);
  };

  const handleFilterChange = (newFilters: Partial<NotificationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchNotifications(1, updatedFilters);
  };

  const handleSearch = () => {
    handleFilterChange({ search: searchTerm });
  };

  const handleAddNotification = async (notificationData: any) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Notificación creada exitosamente');
        setShowAddModal(false);
        fetchNotifications(pagination.page);
      } else {
        toast.error(result.error || 'Error creando notificación');
      }
    } catch (error) {
      console.error('Error creando notificación:', error);
      toast.error('Error creando notificación');
    }
  };

  const handleEditNotification = async (id: string, notificationData: any) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Notificación actualizada exitosamente');
        setShowEditModal(false);
        setSelectedNotification(null);
        fetchNotifications(pagination.page);
      } else {
        toast.error(result.error || 'Error actualizando notificación');
      }
    } catch (error) {
      console.error('Error actualizando notificación:', error);
      toast.error('Error actualizando notificación');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Notificación eliminada exitosamente');
        setShowDeleteDialog(false);
        setDeleteId(null);
        fetchNotifications(pagination.page);
      } else {
        toast.error(result.error || 'Error eliminando notificación');
      }
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      toast.error('Error eliminando notificación');
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const openEditModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading && notifications.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notificaciones</h1>
        <p className="text-gray-600">Gestiona las notificaciones del sistema Data Fiscal</p>
      </div>

      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats?.total || 0}
                </p>
              </div>
              <IconBell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Activas</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats?.active || 0}
                </p>
              </div>
              <IconCircleCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Expiradas</p>
                <p className="text-2xl font-bold text-red-900">
                  {stats?.expired || 0}
                </p>
              </div>
              <IconCircleX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Alta Prioridad</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats?.by_priority?.high || 0}
                </p>
              </div>
              <IconAlertTriangle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo</label>
              <Select value={filters.type || 'all'} onValueChange={(value) => handleFilterChange({ type: value === 'all' ? undefined : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="info">Información</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Prioridad</label>
              <Select value={filters.priority || 'all'} onValueChange={(value) => handleFilterChange({ priority: value === 'all' ? undefined : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Estado</label>
              <Select value={filters.is_active?.toString() || 'all'} onValueChange={(value) => handleFilterChange({ is_active: value === 'all' ? undefined : value === 'true' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="true">Activas</SelectItem>
                  <SelectItem value="false">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Buscar</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <IconSearch className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchNotifications(pagination.page)} variant="outline" size="sm">
            <IconRefresh className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {isAdmin && (
          <Button onClick={() => setShowAddModal(true)}>
            <IconPlus className="h-4 w-4 mr-2" />
            Nueva Notificación
          </Button>
        )}
      </div>

      {/* Lista de Notificaciones */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`${!notification.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getTypeIcon(notification.type)}
                    <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type.toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityColor(notification.priority)}>
                      {notification.priority.toUpperCase()}
                    </Badge>
                    {!notification.is_active && (
                      <Badge variant="outline" className="text-gray-500">
                        INACTIVA
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{notification.message}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Creado por: {notification.creator?.nombre} {notification.creator?.apellido}</span>
                    <span>Creado: {formatDate(notification.created_at)}</span>
                    {notification.expires_at && (
                      <span>Expira: {formatDate(notification.expires_at)}</span>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => openEditModal(notification)}
                      variant="outline"
                      size="sm"
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => confirmDelete(notification.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {notifications.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <IconBell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron notificaciones</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
            >
              Anterior
            </Button>
            
            <span className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            
            <Button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              variant="outline"
              size="sm"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modales */}
      {showAddModal && (
        <AddNotificationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddNotification}
        />
      )}

      {showEditModal && selectedNotification && (
        <EditNotificationModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedNotification(null);
          }}
          notification={selectedNotification}
          onSubmit={handleEditNotification}
        />
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteId(null);
        }}
        onConfirm={() => deleteId && handleDeleteNotification(deleteId)}
        title="Eliminar Notificación"
        description="¿Estás seguro de que quieres eliminar esta notificación? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
      />
    </div>
  );
} 