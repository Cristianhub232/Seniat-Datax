"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Save, X } from "lucide-react";

interface AddRoleModalProps {
  open: boolean;
  onClose: () => void;
  onRoleCreated: () => void;
}

export function AddRoleModal({ open, onClose, onRoleCreated }: AddRoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del rol es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'La descripción no puede exceder 200 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Limpiar formulario
        setFormData({
          name: '',
          description: '',
          status: 'active'
        });
        setErrors({});
        onRoleCreated();
      } else {
        const errorData = await response.json();
        if (errorData.error) {
          setErrors({ general: errorData.error });
        }
      }
    } catch (error) {
      console.error('Error creando rol:', error);
      setErrors({ general: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        status: 'active'
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-gray-900">Crear Nuevo Rol</span>
              <div className="text-sm font-normal text-gray-500 mt-1">
                Define un nuevo rol para el sistema
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* Nombre del Rol */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Nombre del Rol *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: supervisor, analista, etc."
              className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            />
            {errors.name && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                {errors.name}
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe las responsabilidades y permisos de este rol..."
              rows={4}
              className={`transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                errors.description 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            />
            {errors.description && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                {errors.description}
              </div>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Descripción opcional del rol y sus responsabilidades</span>
              <span className={`font-medium ${formData.description.length > 180 ? 'text-orange-600' : 'text-gray-500'}`}>
                {formData.description.length}/200
              </span>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-3">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Estado del Rol
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 border-gray-300 hover:border-gray-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active" className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Activo
                </SelectItem>
                <SelectItem value="inactive" className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                  Inactivo
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-xs text-blue-700">
                  <span className="font-medium">Nota:</span> Los roles inactivos no se pueden asignar a usuarios nuevos y se ocultan en la mayoría de las listas del sistema.
                </div>
              </div>
            </div>
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-red-800">Error al crear rol</p>
                  <p className="text-sm text-red-600 mt-1">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Creando...' : 'Crear Rol'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
