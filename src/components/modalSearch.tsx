"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICON_MAP } from "@/lib/iconMap";
import { NEXT_PUBLIC_API_URL } from "@/config/appConfig";

interface dataResponse {
  rif: string;
  taxpayer_type: string;
  is_special: boolean;
  qualifies_for_special: boolean;
  qualification_message: string;
  basic_info?: {
    razon_social: string;
  };
  registration_date: string;
}

export function ModalSearch() {
  const [rif, setRif] = useState("");
  const [dataResponse, setDataResponse] = useState<dataResponse | null>(null);
  const IconComponent = ICON_MAP["IconUserSearch"] ?? ICON_MAP["IconHelp"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/taxpayer/${rif}`, {
        method: "GET",
        headers: {
          apikey: process.env.NEXT_PUBLIC_API_KEY!,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setDataResponse(data);
      } else {
        const error = await res.json();
        toast.error(error.message || "No se pudo verificar el RIF.");
      }
    } catch {
      toast.error("Error de conexión con el servidor.");
    }
  };

  const handleReset = () => {
    setDataResponse(null);
    setRif("");
  };

  return (
    <Dialog onOpenChange={(open) => !open && handleReset()}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="size-10 group-data-[collapsible=icon]:opacity-0 cursor-pointer"
          variant="outline"
        >
          {IconComponent && <IconComponent size={22} />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Consulta</DialogTitle>
            <DialogDescription>
              Ingresa el RIF del usuario para comprobar si está clasificado como
              Contribuyente Especial.
            </DialogDescription>
          </DialogHeader>

          {!dataResponse ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="rifConsulta">RIF</Label>
                <Input
                  id="rifConsulta"
                  name="rif"
                  placeholder="J-00000000-0"
                  value={rif}
                  onChange={(e) => setRif(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-md border p-4 text-sm bg-muted space-y-2">
              <p>
                <strong>RIF:</strong> {dataResponse.rif}
              </p>
              <p>
                <strong>Tipo:</strong> {dataResponse.taxpayer_type}
              </p>
              <p>
                <strong>Tipo de contribuyente:</strong>{" "}
                <span
                  className={
                    dataResponse.is_special
                      ? "text-red-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {dataResponse.is_special ? "Especial" : "Ordinario"}
                </span>
              </p>
                            <p>
                <strong>¿Califica como especial?:</strong>{" "}
                <span
                  className={
                    dataResponse.qualifies_for_special
                      ? "text-red-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {dataResponse.qualifies_for_special ? "Sí" : "No"}
                </span>
              </p>
              <p>
                <strong>Razón Social:</strong>{" "}
                {dataResponse.basic_info?.razon_social || "-"}
              </p>
              <p>
                <strong>Mensaje:</strong>{" "}
                {dataResponse.qualification_message || "Sin mensaje"}
              </p>
              <p>
                <strong>Fecha de Registro:</strong>{" "}
                {dataResponse.registration_date
                  ? new Date(
                      dataResponse.registration_date
                    ).toLocaleDateString()
                  : "-"}
              </p>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleReset}
                  className="w-full"
                >
                  Consultar otro RIF
                </Button>
              </div>
            </div>
          )}

          {!dataResponse && (
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Aceptar</Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
