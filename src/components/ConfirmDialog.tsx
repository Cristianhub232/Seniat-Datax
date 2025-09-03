"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, X, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirmar",
  description,
  confirmLabel = "Aceptar",
  loading = false,
  type = "danger",
}: ConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-600",
          iconBg: "bg-red-100",
          title: "text-red-900",
          description: "text-red-700",
          confirmButton: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl",
          border: "border-red-200",
          bg: "bg-red-50"
        };
      case "warning":
        return {
          icon: "text-yellow-600",
          iconBg: "bg-yellow-100",
          title: "text-yellow-900",
          description: "text-yellow-700",
          confirmButton: "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg hover:shadow-xl",
          border: "border-yellow-200",
          bg: "bg-yellow-50"
        };
      default:
        return {
          icon: "text-blue-600",
          iconBg: "bg-blue-100",
          title: "text-blue-900",
          description: "text-blue-700",
          confirmButton: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl",
          border: "border-blue-200",
          bg: "bg-blue-50"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-4 text-xl font-semibold">
            <div className={`p-3 rounded-full ${styles.iconBg}`}>
              <AlertTriangle className={`h-8 w-8 ${styles.icon}`} />
            </div>
            <div className={styles.title}>
              {title}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {description && (
            <div className={`p-4 rounded-lg ${styles.bg} border ${styles.border}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${styles.icon.replace('text-', 'bg-')}`}></div>
                <DialogDescription className={`text-base leading-relaxed ${styles.description}`}>
                  {description}
                </DialogDescription>
              </div>
            </div>
          )}
          
          {/* Información adicional para eliminación de roles */}
          {type === "danger" && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">⚠️ Advertencia:</span> Esta acción eliminará permanentemente el rol y todos sus permisos asociados. 
                  Los usuarios con este rol perderán acceso a las funcionalidades correspondientes.
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <DialogClose asChild>
            <Button 
              variant="outline" 
              type="button"
              disabled={isDeleting}
              className="flex items-center gap-2 px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleConfirm}
            disabled={isDeleting}
            className={`flex items-center gap-2 px-6 py-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
