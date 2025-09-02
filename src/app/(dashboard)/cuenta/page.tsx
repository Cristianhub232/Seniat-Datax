"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserContext";
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Save, 
  Key, 
  Eye, 
  EyeOff,
  Calendar,
  MapPin,
  Phone,
  Edit,
  Lock,
  Check,
  X
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role: {
    name: string;
  };
  status: string;
  created_at: string;
  last_login?: string;
  phone?: string;
  location?: string;
  bio?: string;
  updated_at?: string;
}

export default function AccountPage() {
  const { updateUser } = useAuth();
  const { user } = useUserData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Formulario de perfil
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    bio: ''
  });

  // Formulario de contraseña
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Cargar datos del perfil
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Intentar cargar datos desde la API directamente
        const response = await fetch('/api/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('📊 Datos cargados desde API:', userData);
          
          setProfile(userData.user);
          setFormData({
            username: userData.user.username || '',
            email: userData.user.email || '',
            first_name: userData.user.first_name || '',
            last_name: userData.user.last_name || '',
            phone: userData.user.phone || '',
            location: userData.user.location || '',
            bio: userData.user.bio || ''
          });
        } else {
          // Fallback a datos del contexto
          if (user) {
            console.log('📊 Usando datos del contexto:', user);
            setProfile(user as any);
            setFormData({
              username: user.username || '',
              email: user.email || '',
              first_name: (user as any).first_name || '',
              last_name: (user as any).last_name || '',
              phone: (user as any).phone || '',
              location: (user as any).location || '',
              bio: (user as any).bio || ''
            });
          }
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        // Fallback a datos del contexto
        if (user) {
          setProfile(user as any);
          setFormData({
            username: user.username || '',
            email: user.email || '',
            first_name: (user as any).first_name || '',
            last_name: (user as any).last_name || '',
            phone: (user as any).phone || '',
            location: (user as any).location || '',
            bio: (user as any).bio || ''
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditClick = () => {
    setShowAuthModal(true);
    setAuthPassword('');
    setAuthError('');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authPassword.trim()) {
      setAuthError('Por favor ingresa tu contraseña');
      return;
    }

    try {
      const response = await fetch('/api/account/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ password: authPassword })
      });

      if (response.ok) {
        setIsEditing(true);
        setShowAuthModal(false);
        setAuthPassword('');
        setAuthError('');
        toast.success('Autorización exitosa. Puedes editar tu perfil.');
      } else {
        const error = await response.json();
        setAuthError(error.error || 'Contraseña incorrecta');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setAuthError('Error al verificar la contraseña');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Restaurar datos originales
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: (user as any).first_name || '',
        last_name: (user as any).last_name || '',
        phone: (user as any).phone || '',
        location: (user as any).location || '',
        bio: (user as any).bio || ''
      });
    }
    toast.info('Edición cancelada. Los cambios no se guardaron.');
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ Iniciando carga de avatar...');
    const file = event.target.files?.[0];
    
    if (!file) {
      console.log('❌ No se seleccionó ningún archivo');
      return;
    }

    console.log('📁 Archivo seleccionado:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
    });

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      console.log('❌ Tipo de archivo inválido:', file.type);
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Archivo demasiado grande:', file.size);
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Enviando archivo al servidor...');
      
      const formData = new FormData();
      formData.append('avatar', file);

      console.log('🔄 FormData creado, enviando request...');
      const response = await fetch('/api/account/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      console.log('📥 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Avatar actualizado exitosamente:', data);
        toast.success('Avatar actualizado correctamente');
        
        // Actualizar el contexto de autenticación
        if (updateUser) {
          updateUser({ ...user, avatar: data.avatar_url });
        }
        
        // Actualizar el estado local del perfil
        setProfile(prev => prev ? { ...prev, avatar: data.avatar_url } : null);
        
        // Limpiar el input para permitir cargar el mismo archivo nuevamente
        event.target.value = '';
      } else {
        const error = await response.json();
        console.error('❌ Error del servidor:', error);
        toast.error(error.error || 'Error al actualizar avatar');
      }
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setLoading(false);
      console.log('🏁 Proceso de carga completado');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Solo enviar campos editables (excluir username y email)
      const editableData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio
      };

      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editableData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Perfil actualizado correctamente');
        
        // Actualizar el contexto de autenticación
        if (updateUser) {
          updateUser({ ...user, ...data.user });
        }
        
        // Actualizar el estado local del perfil
        if (data.user) {
          setProfile(prev => prev ? { ...prev, ...data.user } : null);
        }
        
        // Recargar datos frescos desde la API
        setTimeout(async () => {
          try {
            const refreshResponse = await fetch('/api/me', {
              credentials: 'include'
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              console.log('🔄 Datos refrescados:', refreshData);
              setProfile(refreshData.user);
              
              // Actualizar también el contexto
              if (updateUser) {
                updateUser(refreshData.user);
              }
            }
          } catch (error) {
            console.error('Error refrescando datos:', error);
          }
        }, 500);
        
        // Salir del modo edición
        setIsEditing(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      if (response.ok) {
        toast.success('Contraseña actualizada correctamente');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al actualizar contraseña');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error al actualizar contraseña');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!profile && !loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">No se pudo cargar la información del perfil</p>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mi Cuenta</h1>
          <p className="text-muted-foreground">
            Gestiona tu perfil, información personal y configuración de seguridad
          </p>
        </div>
      </div>

                <div className="grid gap-6 md:grid-cols-2">
            {/* Card de Visualización de Datos Básicos */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Datos Guardados en Base de Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-3">Información Personal Guardada:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Nombre:</span>
                      <span className="text-gray-900 bg-white px-2 py-1 rounded border">
                        {profile?.first_name || 'No especificado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Apellido:</span>
                      <span className="text-gray-900 bg-white px-2 py-1 rounded border">
                        {profile?.last_name || 'No especificado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Teléfono:</span>
                      <span className="text-gray-900 bg-white px-2 py-1 rounded border">
                        {profile?.phone || 'No especificado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Ubicación:</span>
                      <span className="text-gray-900 bg-white px-2 py-1 rounded border">
                        {profile?.location || 'No especificado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Biografía:</span>
                      <span className="text-gray-900 bg-white px-2 py-1 rounded border max-w-xs truncate">
                        {profile?.bio || 'No especificado'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Estado de Sincronización:</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-700">
                      Datos sincronizados con la base de datos
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Última actualización: {profile?.updated_at ? new Date(profile.updated_at).toLocaleString('es-ES') : 'No disponible'}
                  </p>
                </div>
                
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Recargar Datos
                </Button>
              </CardContent>
            </Card>

            {/* Información del Perfil */}
            <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Perfil
              </div>
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditClick}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} alt={profile.username} />
                <AvatarFallback className="text-lg">
                  {profile.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  disabled={loading}
                  onClick={() => {
                    console.log('🖼️ Botón de avatar clickeado');
                    const input = document.getElementById('avatar-upload') as HTMLInputElement;
                    if (input) {
                      input.click();
                      console.log('📁 Input file activado');
                    } else {
                      console.error('❌ Input file no encontrado');
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Cambiar Avatar
                    </>
                  )}
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    console.log('📁 Input file onChange activado');
                    handleAvatarUpload(e);
                  }}
                  className="hidden"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG o GIF. Máximo 5MB.
                </p>
                {loading && (
                  <p className="text-xs text-blue-600 animate-pulse">
                    Subiendo imagen...
                  </p>
                )}
              </div>
            </div>

            {isEditing ? (
              /* Formulario de Edición */
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                                     <div className="space-y-2">
                       <Label htmlFor="username">Nombre de Usuario</Label>
                       <Input
                         id="username"
                         value={formData.username}
                         disabled
                         className="bg-gray-100 text-gray-600 cursor-not-allowed"
                         placeholder="Nombre de usuario"
                       />
                       <p className="text-xs text-gray-500">El nombre de usuario no puede ser modificado</p>
                     </div>
     
                     <div className="space-y-2">
                       <Label htmlFor="email">Correo Electrónico</Label>
                       <Input
                         id="email"
                         type="email"
                         value={formData.email}
                         disabled
                         className="bg-gray-100 text-gray-600 cursor-not-allowed"
                         placeholder="tu@email.com"
                       />
                       <p className="text-xs text-gray-500">El correo electrónico no puede ser modificado</p>
                     </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+58 412-123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ciudad, País"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Cuéntanos un poco sobre ti..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              /* Vista de Datos Guardados */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Nombre</Label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                      {profile.first_name || 'No especificado'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Apellido</Label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                      {profile.last_name || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Nombre de Usuario</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    {profile.username}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Correo Electrónico</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    {profile.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    {profile.phone || 'No especificado'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Ubicación</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    {profile.location || 'No especificado'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Biografía</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border min-h-[60px]">
                    {profile.bio || 'No especificado'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de la Cuenta y Seguridad */}
        <div className="space-y-6">
          {/* Información de la Cuenta */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Información de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rol</span>
                <Badge variant="secondary">{profile.role.name}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado</span>
                <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                  {profile.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Miembro desde:</span>
                  <span>{formatDate(profile.created_at)}</span>
                </div>
                
                {profile.last_login && (
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Último acceso:</span>
                    <span>{formatDate(profile.last_login)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cambiar Contraseña */}
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Contraseña Actual</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.current_password}
                      onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                      placeholder="Tu contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">Nueva Contraseña</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                    placeholder="Nueva contraseña"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                    placeholder="Confirma la nueva contraseña"
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                  <Key className="h-4 w-4 mr-2" />
                  {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Autorización */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Autorización Requerida</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Para editar tu perfil, necesitamos verificar tu identidad. Por favor ingresa tu contraseña actual.
            </p>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-password">Contraseña Actual</Label>
                <Input
                  id="auth-password"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  autoFocus
                />
                {authError && (
                  <p className="text-red-600 text-sm">{authError}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Check className="h-4 w-4 mr-2" />
                  Autorizar
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAuthModal(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 