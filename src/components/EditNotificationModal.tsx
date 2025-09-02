'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { IconBell, IconX, IconEdit } from '@tabler/icons-react';
import { Notification } from '@/types/notification';

interface EditNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
  onSubmit: (id: string, data: any) => void;
}

export default function EditNotificationModal({ isOpen, onClose, notification, onSubmit }: EditNotificationModalProps) {
  const [formData, setFormData] = useState({
    title: notification.title,
    message: notification.message,
    type: notification.type,
    priority: notification.priority,
    is_active: notification.is_active,
    expires_at: notification.expires_at ? notification.expires_at.slice(0, 16) : ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (notification) {
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        is_active: notification.is_active,
        expires_at: notification.expires_at ? notification.expires_at.slice(0, 16) : ''
      });
    }
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(notification.id, formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconEdit className="h-5 w-5" />
            Editar Notificación
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ingrese el título de la notificación"
              maxLength={255}
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Ingrese el mensaje de la notificación"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Información</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridad *</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Notificación Activa</Label>
          </div>

          <div>
            <Label htmlFor="expires_at">Fecha de Expiración (Opcional)</Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">
              Si no se especifica, la notificación no expirará automáticamente
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              <IconX className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.title || !formData.message}>
              {loading ? 'Actualizando...' : 'Actualizar Notificación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 