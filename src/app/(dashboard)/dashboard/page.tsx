'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  IconHome, 
  IconUsers, 
  IconShield, 
  IconBuilding, 
  IconCalendar, 
  IconDownload,
  IconLoader,
  IconEye
} from '@tabler/icons-react';
import PersonnelModal from '@/components/PersonnelModal';

interface DashboardMetrics {
  ejecutivos: number;
  administradores: number;
  contribuyentes: number;
  obligacionesEstaSemana: number;
  obligacionesVencidas: number;
  obligacionesCumplidas: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    ejecutivos: 0,
    administradores: 0,
    contribuyentes: 0,
    obligacionesEstaSemana: 12,
    obligacionesVencidas: 3,
    obligacionesCumplidas: 9
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ejecutivos' | 'administradores' | 'cartera'>('ejecutivos');
  const [modalTitle, setModalTitle] = useState('');

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard/metrics');
      const result = await response.json();
      
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError('Error al cargar las métricas');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const openModal = (type: 'ejecutivos' | 'administradores' | 'cartera', title: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const obligacionesTributarias = [
    {
      id: 1,
      tipo: "IVA",
      descripcion: "Declaración y Pago IVA Mensual",
      fecha: "15 Ene 2025",
      estado: "pendiente",
      prioridad: "alta"
    },
    {
      id: 2,
      tipo: "ISLR",
      descripcion: "Retención ISLR - Sueldos y Salarios",
      fecha: "16 Ene 2025",
      estado: "pendiente",
      prioridad: "alta"
    },
    {
      id: 3,
      tipo: "IVA",
      descripcion: "Retención IVA - Servicios",
      fecha: "17 Ene 2025",
      estado: "pendiente",
      prioridad: "media"
    },
    {
      id: 4,
      tipo: "ISLR",
      descripcion: "Declaración ISLR Anual",
      fecha: "18 Ene 2025",
      estado: "pendiente",
      prioridad: "alta"
    },
    {
      id: 5,
      tipo: "IVA",
      descripcion: "Información de Compras",
      fecha: "19 Ene 2025",
      estado: "pendiente",
      prioridad: "media"
    }
  ];

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'IVA': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ISLR': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center space-y-2 flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Fiscal</h1>
          <p className="text-gray-600">Panel de control y métricas del sistema Data Fiscal</p>
        </div>
        <Button 
          onClick={fetchMetrics} 
          disabled={isLoading}
          variant="outline"
          className="ml-4"
        >
          <IconLoader className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Personal Operativo
            </CardTitle>
            <IconUsers className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <IconLoader className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700">Cargando...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-600">Error</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-900">{metrics.ejecutivos}</div>
                <p className="text-xs text-blue-700">
                  Funcionarios activos en el sistema
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => openModal('ejecutivos', 'Personal Operativo')}
                >
                  <IconEye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Administradores
            </CardTitle>
            <IconShield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <IconLoader className="h-5 w-5 animate-spin text-purple-600" />
                <span className="text-sm text-purple-700">Cargando...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-600">Error</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-900">{metrics.administradores}</div>
                <p className="text-xs text-purple-700">
                  Gestores del sistema
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => openModal('administradores', 'Administradores del Sistema')}
                >
                  <IconEye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Cartera Global
            </CardTitle>
            <IconBuilding className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <IconLoader className="h-5 w-5 animate-spin text-green-600" />
                <span className="text-sm text-green-700">Cargando...</span>
            </div>
            ) : error ? (
              <div className="text-sm text-red-600">Error</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-900">{metrics.contribuyentes.toLocaleString()}</div>
                <p className="text-xs text-green-700">
                  Contribuyentes registrados
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => openModal('cartera', 'Cartera Global de Contribuyentes')}
                >
                  <IconEye className="h-4 w-4 mr-2" />
                  Ver Todo
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Obligaciones Semana
            </CardTitle>
            <IconCalendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <IconLoader className="h-5 w-5 animate-spin text-orange-600" />
                <span className="text-sm text-orange-700">Cargando...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-600">Error</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-900">{metrics.obligacionesEstaSemana}</div>
                <p className="text-xs text-orange-700">
                  Pendientes de cumplimiento
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sección de Obligaciones Tributarias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualización de Obligaciones Tributarias */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCalendar className="h-5 w-5 text-blue-600" />
                <CardTitle>Análisis de Obligaciones Tributarias</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href="/GO-43031-18122024-Calendario-SPE-2025-extracto.pdf" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconDownload className="h-4 w-4 mr-2" />
                    Calendario PDF
                  </a>
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Resumen ejecutivo basado en el calendario oficial SENIAT 2025
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estadísticas Generales */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">📊 Estadísticas Generales</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-800">Total Obligaciones 2025</span>
                    <Badge className="bg-blue-100 text-blue-800">17</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">Obligaciones IVA</span>
                    <Badge className="bg-green-100 text-green-800">14</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-800">Obligaciones ISLR</span>
                    <Badge className="bg-purple-100 text-purple-800">3</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-orange-800">Prioridad Alta</span>
                    <Badge className="bg-orange-100 text-orange-800">15</Badge>
                  </div>
                </div>
              </div>

              {/* Tipos de Contribuyentes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">👥 Tipos de Contribuyentes</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">Todos los contribuyentes</span>
                    <Badge className="bg-gray-100 text-gray-800">12</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">Patronos</span>
                    <Badge className="bg-gray-100 text-gray-800">2</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">Personas naturales</span>
                    <Badge className="bg-gray-100 text-gray-800">1</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">Contribuyentes especiales</span>
                    <Badge className="bg-gray-100 text-gray-800">1</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">Agentes de retención</span>
                    <Badge className="bg-gray-100 text-gray-800">1</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximas Obligaciones Críticas */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">⚠️ Próximas Obligaciones Críticas</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-100 text-red-800">IVA</Badge>
                    <div>
                      <h5 className="font-medium text-red-900">Declaración y Pago IVA Mensual</h5>
                      <p className="text-sm text-red-700">Período: AGOSTO 2025 | Fecha límite: 15/09/2025</p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-200">ALTA</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-100 text-orange-800">IVA</Badge>
                    <div>
                      <h5 className="font-medium text-orange-900">Declaración y Pago IVA Mensual</h5>
                      <p className="text-sm text-orange-700">Período: SEPTIEMBRE 2025 | Fecha límite: 15/10/2025</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">ALTA</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-100 text-yellow-800">IVA</Badge>
                    <div>
                      <h5 className="font-medium text-yellow-900">Declaración y Pago IVA Mensual</h5>
                      <p className="text-sm text-yellow-700">Período: OCTUBRE 2025 | Fecha límite: 15/11/2025</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">ALTA</Badge>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">ℹ️ Información Importante</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Las obligaciones IVA son mensuales y de cumplimiento obligatorio</li>
                <li>• Las retenciones ISLR aplican principalmente a patronos</li>
                <li>• Los contribuyentes especiales tienen obligaciones adicionales</li>
                <li>• Todas las fechas están basadas en el calendario oficial SENIAT</li>
              </ul>
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Modal para mostrar datos */}
      <PersonnelModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        type={modalType}
      />

    </div>
  );
} 