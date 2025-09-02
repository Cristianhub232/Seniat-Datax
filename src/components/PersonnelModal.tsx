'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconUsers, IconX, IconLoader, IconUser, IconMail, IconPhone, IconMapPin } from '@tabler/icons-react';

interface Ejecutivo {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  region: string;
  status: number;
  created_at: string;
}

interface PersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'ejecutivos' | 'administradores' | 'cartera';
}

export default function PersonnelModal({ isOpen, onClose, title, type }: PersonnelModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, type]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let endpoint = '';
      switch (type) {
        case 'ejecutivos':
          endpoint = '/api/admin/ejecutivos';
          break;
        case 'administradores':
          endpoint = '/api/admin/users';
          break;
        case 'cartera':
          endpoint = '/api/admin/cartera-contribuyentes';
          break;
      }
      
      const response = await fetch(endpoint, {
        credentials: 'include', // Incluir cookies de autenticación
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('No tienes permisos para ver estos datos');
        } else {
          setError('Error al cargar los datos');
        }
        return;
      }
      
      const result = await response.json();
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(result)) {
        setData(result);
      } else if (result.success && result.data) {
        setData(result.data);
      } else if (result.data) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEjecutivos = () => (
    <div className="space-y-4">
      {data.map((ejecutivo: any) => (
        <div key={ejecutivo.ID || ejecutivo.id} className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <IconUser className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {ejecutivo.NOMBRE && ejecutivo.APELLIDO 
                    ? `${ejecutivo.NOMBRE} ${ejecutivo.APELLIDO}` 
                    : ejecutivo.nombre || 'Sin nombre'
                  }
                </h4>
                <Badge className={`text-xs ${(ejecutivo.STATUS || ejecutivo.status) === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {(ejecutivo.STATUS || ejecutivo.status) === 1 ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <IconMail className="w-4 h-4" />
              <span>{ejecutivo.EMAIL || ejecutivo.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <IconPhone className="w-4 h-4" />
              <span>{ejecutivo.TELEFONO || ejecutivo.telefono || 'No disponible'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <IconMapPin className="w-4 h-4" />
              <span>{ejecutivo.REGION || ejecutivo.region || 'No disponible'}</span>
            </div>
            <div className="text-gray-500 text-xs">
              Registrado: {new Date(ejecutivo.CREATED_AT || ejecutivo.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAdministradores = () => {
    // Filtrar solo administradores (role_id = 1)
    const administradores = data.filter((admin: any) => admin.role_id === 1);
    
    if (administradores.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <IconUsers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay administradores registrados</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {administradores.map((admin: any) => (
          <div key={admin.id} className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <IconUser className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {admin.first_name && admin.last_name 
                      ? `${admin.first_name} ${admin.last_name}` 
                      : admin.username || 'Sin nombre'
                    }
                  </h4>
                  <Badge className="bg-purple-100 text-purple-800">
                    {admin.role?.name || 'Administrador'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <IconMail className="w-4 h-4" />
                <span>{admin.email}</span>
              </div>
              <div className="text-gray-500 text-xs">
                Registrado: {new Date(admin.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCartera = () => (
    <div className="space-y-4">
      {data.map((contribuyente: any) => (
        <div key={contribuyente.ID || contribuyente.id} className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <IconUser className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {contribuyente.RAZON_SOCIAL || contribuyente.razon_social || contribuyente.NOMBRE || contribuyente.nombre || 'Sin nombre'}
                </h4>
                <Badge className="bg-green-100 text-green-800">Contribuyente</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">RIF:</span>
              <span>{contribuyente.RIF || contribuyente.rif}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <IconMapPin className="w-4 h-4" />
              <span>{contribuyente.REGION || contribuyente.region || 'N/A'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <IconLoader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando datos...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <IconX className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <IconUsers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay datos disponibles</p>
          </div>
        </div>
      );
    }

    switch (type) {
      case 'ejecutivos':
        return renderEjecutivos();
      case 'administradores':
        return renderAdministradores();
      case 'cartera':
        return renderCartera();
      default:
        return <p>Datos no disponibles en esta versión</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUsers className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
} 