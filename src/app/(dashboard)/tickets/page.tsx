"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconPlus, IconFilter, IconSearch, IconRefresh, IconChartBar } from '@tabler/icons-react';
import { ClipboardList, AlertTriangle, Clock, CheckCircle2, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useModulePermissions } from '@/hooks/usePermissions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Ticket {
  id: number;
  asunto: string;
  concepto: string;
  estado: 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  fecha_creacion: string;
  fecha_limite?: string;
  fecha_completado?: string;
  ejecutivo_id?: string | null;
  creado_por: string;
  observaciones?: string;
  creador: {
    username: string;
    nombre: string;
  };
  ejecutivo?: {
    username: string;
    nombre: string;
  } | null;
}

interface TicketStats {
  generales: {
    total: number;
    pendientes: number;
    en_proceso: number;
    completados: number;
    cancelados: number;
    vencidos: number;
  };
  prioridades: {
    critica: number;
    alta: number;
    media: number;
    baja: number;
  };
  semana: {
    total: number;
    completados: number;
    vencidos: number;
  };
}

const estados = ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'];
const prioridades = ['Baja', 'Media', 'Alta', 'Crítica'];

export default function TicketsPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: 'tickets', action: 'read' }}>
      <TicketsPageContent />
    </ProtectedRoute>
  );
}

function TicketsPageContent() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState({
    estado: 'todos',
    prioridad: 'todos',
    ejecutivo: 'todos',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    asunto: '',
    concepto: '',
    estado: 'Pendiente' as const,
    prioridad: 'Media' as const,
    fecha_limite: '',
    ejecutivo_id: 'sin-asignar',
    observaciones: ''
  });
  const [ejecutivos, setEjecutivos] = useState<any[]>([]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ asunto?: string; concepto?: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { canDelete, canManage } = useModulePermissions('tickets');
  const [viewEditOpen, setViewEditOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editTicket, setEditTicket] = useState<{ asunto: string; concepto: string; prioridad: Ticket['prioridad']; estado: Ticket['estado']; fecha_limite: string; observaciones: string; ejecutivo_id: string | null } | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverEstado, setDragOverEstado] = useState<string | null>(null);

  // Cargar tickets y estadísticas
  useEffect(() => {
    loadTickets();
    loadStats();
    loadEjecutivos();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...tickets];

    if (filters.estado && filters.estado !== 'todos') {
      filtered = filtered.filter(t => t.estado === filters.estado);
    }

    if (filters.prioridad && filters.prioridad !== 'todos') {
      filtered = filtered.filter(t => t.prioridad === filters.prioridad);
    }

    if (filters.ejecutivo && filters.ejecutivo !== 'todos') {
      filtered = filtered.filter(t => (t.ejecutivo_id ?? 'sin-asignar') === filters.ejecutivo);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.asunto.toLowerCase().includes(searchLower) ||
        t.concepto.toLowerCase().includes(searchLower) ||
        t.creador.nombre.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, filters]);

  const loadTickets = async () => {
    try {
      const response = await fetch('/api/admin/tickets', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data.data || []);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los tickets",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/tickets/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const loadEjecutivos = async () => {
    try {
      const response = await fetch('/api/admin/ejecutivos', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEjecutivos(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando ejecutivos:', error);
    }
  };

  const createTicket = async () => {
    const nextErrors: { asunto?: string; concepto?: string } = {};
    if (!newTicket.asunto?.trim()) nextErrors.asunto = 'El asunto es obligatorio.';
    if (!newTicket.concepto?.trim()) nextErrors.concepto = 'El concepto es obligatorio.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newTicket,
          ejecutivo_id: newTicket.ejecutivo_id && newTicket.ejecutivo_id !== 'sin-asignar' ? newTicket.ejecutivo_id : null,
          fecha_limite: newTicket.fecha_limite ? new Date(newTicket.fecha_limite).toISOString() : null
        })
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Ticket creado exitosamente"
        });
        setShowCreateModal(false);
        setNewTicket({
          asunto: '',
          concepto: '',
          estado: 'Pendiente',
          prioridad: 'Media',
          fecha_limite: '',
          ejecutivo_id: 'sin-asignar',
          observaciones: ''
        });
        setErrors({});
        await Promise.all([loadTickets(), loadStats()]);
        router.refresh();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Error al crear ticket",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creando ticket:', error);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTicketStatus = async (ticketId: number, newEstado: string) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ estado: newEstado })
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Estado del ticket actualizado"
        });
        loadTickets();
        loadStats();
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar estado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error actualizando ticket:', error);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      });
    }
  };

  const deleteTicket = async (ticketId: number) => {
    try {
      setDeleting(true);
      // Refresco optimista: remover de la UI inmediatamente
      const previousTickets = tickets;
      setTickets((curr) => curr.filter((t) => t.id !== ticketId));
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        toast({ title: 'Éxito', description: 'Ticket eliminado satisfactoriamente' });
        setDeleteTarget(null);
        // Refrescar datos en segundo plano para asegurar consistencia
        Promise.all([loadTickets(), loadStats()]).catch(() => {});
      } else {
        const err = await response.json().catch(() => ({} as any));
        toast({ title: 'Error', description: (err as any).error || 'No se pudo eliminar', variant: 'destructive' });
        // Revertir optimismo en caso de error
        setTickets(previousTickets);
      }
    } catch (error) {
      console.error('Error eliminando ticket:', error);
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' });
      // Revertir optimismo en caso de error
      loadTickets();
    } finally {
      setDeleting(false);
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Crítica': return 'bg-red-100 text-red-800 border-red-200';
      case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCardAccentByPriority = (prioridad: string) => {
    switch (prioridad) {
      case 'Crítica': return 'border-red-200 bg-red-50/40 hover:bg-red-50';
      case 'Alta': return 'border-orange-200 bg-orange-50/40 hover:bg-orange-50';
      case 'Media': return 'border-yellow-200 bg-yellow-50/40 hover:bg-yellow-50';
      case 'Baja': return 'border-green-200 bg-green-50/40 hover:bg-green-50';
      default: return 'border-gray-200 bg-white hover:bg-gray-50';
    }
  };

  const openViewEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditTicket({
      asunto: ticket.asunto,
      concepto: ticket.concepto,
      prioridad: ticket.prioridad,
      estado: ticket.estado,
      fecha_limite: ticket.fecha_limite ? new Date(ticket.fecha_limite).toISOString().slice(0,16) : '',
      observaciones: ticket.observaciones || '',
      ejecutivo_id: ticket.ejecutivo_id || null
    });
    setViewEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedTicket || !editTicket) return;
    try {
      const response = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          asunto: editTicket.asunto,
          concepto: editTicket.concepto,
          prioridad: editTicket.prioridad,
          estado: editTicket.estado,
          fecha_limite: editTicket.fecha_limite ? new Date(editTicket.fecha_limite).toISOString() : null,
          observaciones: editTicket.observaciones || null,
          ejecutivo_id: editTicket.ejecutivo_id || null
        })
      });
      if (response.ok) {
        toast({ title: 'Guardado', description: 'Ticket actualizado' });
        setViewEditOpen(false);
        setSelectedTicket(null);
        await Promise.all([loadTickets(), loadStats()]);
        router.refresh();
      } else {
        const err = await response.json().catch(() => ({} as any));
        toast({ title: 'Error', description: (err as any).error || 'No se pudo guardar', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error guardando ticket:', error);
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'En Proceso': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tickets</h1>
          <p className="text-gray-600 mt-1">Sistema de seguimiento y gestión de tareas del equipo</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Nuevo Ticket
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              loadTickets();
              loadStats();
            }}
          >
            <IconRefresh className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total de Tickets</CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.generales.total}</div>
              <p className="text-xs text-blue-700">{stats.semana.total} esta semana</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Pendientes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats.generales.pendientes}</div>
              <p className="text-xs text-orange-700">{stats.generales.vencidos} vencidos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.generales.en_proceso}</div>
              <p className="text-xs text-purple-700">{stats.prioridades.critica} críticos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Completados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.generales.completados}</div>
              <p className="text-xs text-green-700">{stats.semana.completados} esta semana</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Asunto, concepto o creador..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={filters.estado}
                onValueChange={(value) => setFilters({ ...filters, estado: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {estados.map(estado => (
                    <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select
                value={filters.prioridad}
                onValueChange={(value) => setFilters({ ...filters, prioridad: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las prioridades</SelectItem>
                  {prioridades.map(prioridad => (
                    <SelectItem key={prioridad} value={prioridad}>{prioridad}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="ejecutivo">Ejecutivo</Label>
              <Select
                value={filters.ejecutivo}
                onValueChange={(value) => setFilters({ ...filters, ejecutivo: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos los ejecutivos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los ejecutivos</SelectItem>
                  {ejecutivos.map(ej => (
                    <SelectItem key={ej.id} value={ej.id.toString()}>
                      {ej.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tablero Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {estados.map(estado => {
          const ticketsEstado = filteredTickets.filter(t => t.estado === estado);
          
          return (
            <div
              key={estado}
              className={`space-y-4 rounded-lg transition-colors ${dragOverEstado === estado ? 'bg-blue-50/60' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverEstado(estado); }}
              onDragLeave={() => setDragOverEstado(null)}
              onDrop={async (e) => {
                e.preventDefault();
                const idStr = e.dataTransfer.getData('text/ticket-id');
                const fromEstado = e.dataTransfer.getData('text/from-estado');
                const ticketId = parseInt(idStr);
                setDragOverEstado(null);
                if (!idStr || Number.isNaN(ticketId)) return;
                if (fromEstado === estado) return;
                await updateTicketStatus(ticketId, estado);
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">{estado}</h3>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {ticketsEstado.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {ticketsEstado.map(ticket => (
                  <Card
                    key={ticket.id}
                    className={`hover:shadow-md transition-shadow border ${getCardAccentByPriority(ticket.prioridad)} ${draggingId === ticket.id ? 'opacity-70' : ''}`}
                    draggable
                    onDragStart={(e) => {
                      setDraggingId(ticket.id);
                      e.dataTransfer.setData('text/ticket-id', String(ticket.id));
                      e.dataTransfer.setData('text/from-estado', ticket.estado);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDraggingId(null)}
                  >
                    <CardContent className="p-4" onClick={() => openViewEdit(ticket)}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-gray-900 line-clamp-2 flex-1">
                            {ticket.asunto}
                          </h4>
                          {(canManage || canDelete) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-gray-600 hover:text-gray-900"
                                  onClick={(e) => { e.stopPropagation(); }}
                                  onMouseDown={(e) => { e.stopPropagation(); }}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                                {estado !== 'En Proceso' && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateTicketStatus(ticket.id, 'En Proceso'); }}>Marcar como En Proceso</DropdownMenuItem>
                                )}
                                {estado !== 'Completado' && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateTicketStatus(ticket.id, 'Completado'); }}>Marcar como Completado</DropdownMenuItem>
                                )}
                                {estado !== 'Cancelado' && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateTicketStatus(ticket.id, 'Cancelado'); }}>Marcar como Cancelado</DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(ticket); }}>
                                  <Trash2 className="h-4 w-4" />
                                  Eliminar ticket
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <div>
                          <Badge className={getPriorityColor(ticket.prioridad)}>
                            {ticket.prioridad}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {ticket.concepto}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Creado por: {ticket.creador.nombre}</span>
                          {ticket.fecha_limite && (
                            <span className={new Date(ticket.fecha_limite) < new Date() ? 'text-red-600 font-medium' : ''}>
                              {new Date(ticket.fecha_limite).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        {ticket.ejecutivo && (
                          <div className="text-xs text-gray-500">
                            Asignado a: {ticket.ejecutivo.nombre}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs text-gray-500">ID: {ticket.id}</div>
                          <div className="text-xs text-gray-500">Estado: {ticket.estado}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {ticketsEstado.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay tickets en este estado</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Crear Ticket */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg border border-slate-200 shadow-xl bg-white rounded-xl">
          <DialogHeader className="relative border-b border-slate-200 pb-3 mb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <IconPlus className="w-4 h-4 text-white" />
              </div>
              Crear nuevo ticket
            </DialogTitle>
            <p className="text-xs text-slate-600 mt-1">Complete los campos requeridos</p>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); if (!isSubmitting) createTicket(); }} className="relative space-y-4">
            {/* Información Básica */}
            <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Información Básica</h3>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="asunto" className="text-slate-700 font-medium flex items-center gap-2">
                      Asunto <span className="text-red-500">*</span>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    </Label>
                    <Input
                      id="asunto"
                      value={newTicket.asunto}
                      onChange={(e) => setNewTicket({ ...newTicket, asunto: e.target.value })}
                      placeholder="Ej: Configuración de acceso a Metabase"
                      className={`mt-2 h-10 text-sm transition-all duration-200 ${
                        errors.asunto 
                          ? 'border border-red-300 bg-red-50 focus-visible:ring-red-300 focus-visible:border-red-400' 
                          : 'border border-slate-300 bg-white focus-visible:ring-blue-300 focus-visible:border-blue-400'
                      }`}
                    />
                    {errors.asunto && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                          <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                          </span>
                          {errors.asunto}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="concepto" className="text-slate-700 font-medium flex items-center gap-2">
                      Descripción <span className="text-red-500">*</span>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    </Label>
                    <Textarea
                      id="concepto"
                      value={newTicket.concepto}
                      onChange={(e) => setNewTicket({ ...newTicket, concepto: e.target.value })}
                      placeholder="Describe detalladamente el problema o solicitud..."
                      className={`mt-2 min-h-[100px] text-sm transition-all duration-200 ${
                        errors.concepto 
                          ? 'border border-red-300 bg-red-50 focus-visible:ring-red-300 focus-visible:border-red-400' 
                          : 'border border-slate-300 bg-white focus-visible:ring-blue-300 focus-visible:border-blue-400'
                      }`}
                      rows={4}
                    />
                    {errors.concepto && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                          <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                          </span>
                          {errors.concepto}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración del Ticket */}
            <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Configuración</h3>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estado" className="text-slate-700 font-medium">Estado</Label>
                    <Select
                      value={newTicket.estado}
                      onValueChange={(value: any) => setNewTicket({ ...newTicket, estado: value })}
                    >
                      <SelectTrigger className="mt-2 h-10 border border-slate-300 bg-white focus:ring-blue-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map(estado => (
                          <SelectItem key={estado} value={estado} className="cursor-pointer">
                            <span className={`inline-flex items-center gap-2 ${getEstadoColor(estado)} px-2 py-1 rounded-full text-xs font-medium`}>
                              {estado}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prioridad" className="text-slate-700 font-medium">Prioridad</Label>
                    <Select
                      value={newTicket.prioridad}
                      onValueChange={(value: any) => setNewTicket({ ...newTicket, prioridad: value })}
                    >
                      <SelectTrigger className="mt-2 h-10 border border-slate-300 bg-white focus:ring-blue-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {prioridades.map(prioridad => (
                          <SelectItem key={prioridad} value={prioridad} className="cursor-pointer">
                            <span className={`inline-flex items-center gap-2 ${getPriorityColor(prioridad)} px-2 py-1 rounded-full text-xs font-medium`}>
                              {prioridad}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fecha_limite" className="text-slate-700 font-medium">Fecha Límite</Label>
                    <Input
                      id="fecha_limite"
                      type="datetime-local"
                      value={newTicket.fecha_limite}
                      onChange={(e) => setNewTicket({ ...newTicket, fecha_limite: e.target.value })}
                      className="mt-2 h-10 border border-slate-300 bg-white focus-visible:ring-blue-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ejecutivo" className="text-slate-700 font-medium">Asignar a</Label>
                    <Select
                      value={newTicket.ejecutivo_id}
                      onValueChange={(value) => setNewTicket({ ...newTicket, ejecutivo_id: value })}
                    >
                      <SelectTrigger className="mt-2 h-10 border border-slate-300 bg-white focus:ring-blue-300">
                        <SelectValue placeholder="Seleccionar ejecutivo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sin-asignar" className="cursor-pointer">
                          <span className="text-slate-500 italic">Sin asignar</span>
                        </SelectItem>
                        {ejecutivos.map(ej => (
                          <SelectItem key={ej.id} value={ej.id.toString()} className="cursor-pointer">
                            <span className="font-medium">{ej.nombre}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Notas Adicionales</h3>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div>
                  <Label htmlFor="observaciones" className="text-slate-700 font-medium">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={newTicket.observaciones}
                    onChange={(e) => setNewTicket({ ...newTicket, observaciones: e.target.value })}
                    placeholder="Información adicional, contexto, o comentarios especiales..."
                    className="mt-2 min-h-[90px] border border-slate-300 bg-white focus-visible:ring-blue-300 transition-all duration-200"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="h-10 px-5 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !newTicket.asunto || !newTicket.concepto}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                    Guardando...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <IconPlus className="w-4 h-4" />
                    Crear Ticket
                  </span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={() => deleteTarget ? deleteTicket(deleteTarget.id) : Promise.resolve()}
        title="Eliminar ticket"
        description={deleteTarget ? `Vas a eliminar el ticket "${deleteTarget.asunto}". Esta acción no se puede deshacer.` : ''}
        confirmLabel={deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
        type="danger"
      />

      {/* Modal Ver/Editar Ticket */}
      <Dialog open={viewEditOpen} onOpenChange={setViewEditOpen}>
        <DialogContent className="max-w-xl border border-slate-200 shadow-xl bg-white rounded-xl">
          <DialogHeader className="relative border-b border-slate-200 pb-3 mb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900">{selectedTicket ? `Ticket #${selectedTicket.id}` : 'Ticket'}</DialogTitle>
          </DialogHeader>

          {editTicket && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_asunto">Asunto</Label>
                <Input id="edit_asunto" value={editTicket.asunto} onChange={(e) => setEditTicket({ ...(editTicket as any), asunto: e.target.value })} className="mt-2 h-10" />
              </div>
              <div>
                <Label htmlFor="edit_concepto">Descripción</Label>
                <Textarea id="edit_concepto" value={editTicket.concepto} onChange={(e) => setEditTicket({ ...(editTicket as any), concepto: e.target.value })} className="mt-2 min-h-[100px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Select value={editTicket.estado} onValueChange={(v: any) => setEditTicket({ ...(editTicket as any), estado: v })}>
                    <SelectTrigger className="mt-2 h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {estados.map(es => (<SelectItem key={es} value={es}>{es}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridad</Label>
                  <Select value={editTicket.prioridad} onValueChange={(v: any) => setEditTicket({ ...(editTicket as any), prioridad: v })}>
                    <SelectTrigger className="mt-2 h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {prioridades.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha Límite</Label>
                  <Input type="datetime-local" value={editTicket.fecha_limite} onChange={(e) => setEditTicket({ ...(editTicket as any), fecha_limite: e.target.value })} className="mt-2 h-10" />
                </div>
                <div>
                  <Label>Observaciones</Label>
                  <Textarea value={editTicket.observaciones} onChange={(e) => setEditTicket({ ...(editTicket as any), observaciones: e.target.value })} className="mt-2 min-h-[60px]" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <Button variant="outline" onClick={() => setViewEditOpen(false)} className="h-10 px-5">Cerrar</Button>
                <Button onClick={saveEdit} className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white">Guardar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
