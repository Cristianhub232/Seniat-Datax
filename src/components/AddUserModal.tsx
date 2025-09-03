"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Loader2, X, Save, Eye, EyeOff, Shield, Mail, User, Lock } from "lucide-react";
import type { Role } from "@/types/role";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  onSuccess: () => void;
}

export default function AddUserModal({
  open,
  onOpenChange,
  roles,
  onSuccess,
}: AddUserModalProps) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: roles[0]?.name ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (form.username.length < 3) {
      newErrors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    }
    
    if (!form.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "El email no tiene un formato válido";
    }
    
    if (!form.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (form.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    
    if (!form.role) {
      newErrors.role = "Debe seleccionar un rol";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Usuario creado exitosamente");
        onOpenChange(false);
        onSuccess();
        setForm({ username: "", email: "", password: "", role: roles[0]?.name ?? "" });
        setErrors({});
      } else {
        const err = await res.json();
        const msg = err.error || err.errors?.join(", ") || "Error creando usuario";
        toast.error(msg);
      }
    } catch {
      toast.error("Error creando usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (value: string) => {
    setForm((prev) => ({ ...prev, role: value }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-4 text-xl font-semibold">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-gray-900">
              <div className="text-2xl font-bold">Crear Nuevo Usuario</div>
              <div className="text-sm font-normal text-gray-600 mt-1">
                Agregar un nuevo usuario al sistema
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-6 space-y-6">
          {/* Username Field */}
          <div className="space-y-3">
            <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <User className="h-4 w-4 text-blue-600" />
              Nombre de Usuario
            </Label>
            <Input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.username ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese el nombre de usuario"
            />
            {errors.username && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errors.username}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Mail className="h-4 w-4 text-green-600" />
              Correo Electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={`transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              placeholder="usuario@ejemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-3">
            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <Lock className="h-4 w-4 text-purple-600" />
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                className={`pr-12 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errors.password}
              </p>
            )}
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>

          {/* Role Field */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <Shield className="h-4 w-4 text-orange-600" />
              Rol de Usuario
            </Label>
            <Select
              value={form.role}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className={`transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.role ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}>
                <SelectValue placeholder="Seleccione un rol" />
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
            {errors.role && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errors.role}
              </p>
            )}
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              El rol determina los permisos y acceso del usuario
            </p>
          </div>

          {/* Información adicional */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-blue-700">
                <span className="font-medium">💡 Información:</span> El usuario será creado con estado activo por defecto. 
                La contraseña será requerida en el primer inicio de sesión.
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <DialogClose asChild>
            <Button 
              variant="outline" 
              type="button"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando Usuario...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Crear Usuario
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
