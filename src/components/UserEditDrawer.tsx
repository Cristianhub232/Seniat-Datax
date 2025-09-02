"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Role } from "@/types/role";

interface User {
  id: string;
  username: string;
  email: string;
  role_id: string;
  status: boolean;
  role: Role;
}

interface UserEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: User) => void;
}

export default function UserEditDrawer({ open, onOpenChange, user, onSave }: UserEditDrawerProps) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  useEffect(() => {
    if (user) {
      setForm({ username: user.username, email: user.email, password: "" });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const payload: Record<string, string> = {
      username: form.username,
      email: form.email,
    };
    if (form.password) {
      payload.password = form.password;
    }
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        onSave({ ...user, username: form.username, email: form.email });
        toast.success("Usuario actualizado");
        onOpenChange(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Error actualizando usuario");
      }
    } catch {
      toast.error("Error actualizando usuario");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Editar Usuario</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input id="username" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
          </div>
          <SheetFooter>
            <Button type="submit">Guardar</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
