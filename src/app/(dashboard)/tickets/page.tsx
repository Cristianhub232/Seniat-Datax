"use client";

import { useState, useEffect } from 'react';
import { IconPlus, IconFilter, IconSearch, IconRefresh, IconChartBar } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: number;
  asunto: string;
  concepto: string;
  estado: 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  fecha_creacion: string;
  fecha_limite?: string;
  fecha_completado?: string;
  ejecutivo_id?: number;
  creado_por: number;
  observaciones?: string;
  creador: {
    username: string;
    nombre: string;
  };
  ejecutivo?: {
    username: string;
    nombre: string;
  };
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
      filtered = filtered.filter(t => t.ejecutivo_id === parseInt(filters.ejecutivo));
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
    try {
      const response = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newTicket,
          ejecutivo_id: newTicket.ejecutivo_id && newTicket.ejecutivo_id !== 'sin-asignar' ? parseInt(newTicket.ejecutivo_id) : null,
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
        loadTickets();
        loadStats();
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

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Crítica': return 'bg-red-100 text-red-800 border-red-200';
      case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.generales.total}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.semana.total} esta semana
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.generales.pendientes}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.generales.vencidos} vencidos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">En Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.generales.en_proceso}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.prioridades.critica} críticos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.generales.completados}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.semana.completados} esta semana
              </p>
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
            <div key={estado} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">{estado}</h3>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {ticketsEstado.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {ticketsEstado.map(ticket => (
                  <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 line-clamp-2">
                            {ticket.asunto}
                          </h4>
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
                        
                        {estado !== 'Completado' && estado !== 'Cancelado' && (
                          <div className="flex gap-2 pt-2">
                            {estados.filter(e => e !== estado).map(nextEstado => (
                              <Button
                                key={nextEstado}
                                size="sm"
                                variant="outline"
                                onClick={() => updateTicketStatus(ticket.id, nextEstado)}
                                className="text-xs h-7"
                              >
                                {nextEstado}
                              </Button>
                            ))}
                          </div>
                        )}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Ticket</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="asunto">Asunto *</Label>
              <Input
                id="asunto"
                value={newTicket.asunto}
                onChange={(e) => setNewTicket({ ...newTicket, asunto: e.target.value })}
                placeholder="Título breve del ticket"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="concepto">Concepto *</Label>
              <Textarea
                id="concepto"
                value={newTicket.concepto}
                onChange={(e) => setNewTicket({ ...newTicket, concepto: e.target.value })}
                placeholder="Descripción detallada del ticket"
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={newTicket.estado}
                  onValueChange={(value: any) => setNewTicket({ ...newTicket, estado: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map(estado => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={newTicket.prioridad}
                  onValueChange={(value: any) => setNewTicket({ ...newTicket, prioridad: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map(prioridad => (
                      <SelectItem key={prioridad} value={prioridad}>{prioridad}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_limite">Fecha Límite</Label>
                <Input
                  id="fecha_limite"
                  type="datetime-local"
                  value={newTicket.fecha_limite}
                  onChange={(e) => setNewTicket({ ...newTicket, fecha_limite: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="ejecutivo">Asignar a</Label>
                <Select
                  value={newTicket.ejecutivo_id}
                  onValueChange={(value) => setNewTicket({ ...newTicket, ejecutivo_id: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                    {ejecutivos.map(ej => (
                      <SelectItem key={ej.id} value={ej.id.toString()}>
                        {ej.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={newTicket.observaciones}
                onChange={(e) => setNewTicket({ ...newTicket, observaciones: e.target.value })}
                placeholder="Notas adicionales..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={createTicket}
                disabled={!newTicket.asunto || !newTicket.concepto}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Crear Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Container - Removido para el build */}
    </div>
  );
}
