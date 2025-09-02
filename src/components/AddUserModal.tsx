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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Usuario creado");
        onOpenChange(false);
        onSuccess();
        setForm({ username: "", email: "", password: "", role: roles[0]?.name ?? "" });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Agregar Usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Rol</Label>
            <Select
              value={form.role}
              onValueChange={(value) => setForm((prev) => ({ ...prev, role: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rol" />
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
