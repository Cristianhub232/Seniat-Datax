"use client";

import React, { useEffect, useState } from "react";
import {
  Table, TableHeader, TableRow, TableCell, TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { SkeletonTable } from "@/components/skeletons/tables/Table";
import { IconTrash, IconAlertTriangle, IconTrashX } from "@tabler/icons-react";
import type { CarteraContribuyente, CarteraContribuyenteStats, CarteraContribuyenteFormData } from "@/types/carteraContribuyente";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function CarteraContribuyentesPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: 'cartera', action: 'read' }}>
      <CarteraContribuyentesPageContent />
    </ProtectedRoute>
  );
}

function CarteraContribuyentesPageContent() {
  const [contribuyentes, setContribuyentes] = useState<CarteraContribuyente[]>([]);
  const [stats, setStats] = useState<CarteraContribuyenteStats>({
    total: 0,
    naturales: 0,
    juridicos: 0,
    gobierno: 0,
    consejosComunales: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openCSVDialog, setOpenCSVDialog] = useState(false);
  const [formData, setFormData] = useState<CarteraContribuyenteFormData>({ rif: '' });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvResults, setCsvResults] = useState<any>(null);
  const [filtroRif, setFiltroRif] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [contribuyenteToDelete, setContribuyenteToDelete] = useState<CarteraContribuyente | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [addingContribuyente, setAddingContribuyente] = useState(false);
  const [selectedContribuyentes, setSelectedContribuyentes] = useState<Set<string>>(new Set());
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const fetchData = async (rif?: string, tipo?: string, page: number = 1) => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (rif) params.append('rif', rif);
      if (tipo && tipo !== 'TODOS') params.append('tipo', tipo);
      params.append('page', page.toString());
      params.append('limit', '100');
      
      const url = `/api/admin/cartera-contribuyentes${params.toString() ? `?${params.toString()}` : ''}`;
      
      const [contribuyentesRes, statsRes] = await Promise.all([
        fetch(url).then((r) => r.json()),
        fetch("/api/admin/cartera-contribuyentes/stats").then((r) => r.json()),
      ]);

      // Manejar la nueva estructura de respuesta con paginación
      if (contribuyentesRes.data && contribuyentesRes.pagination) {
        setContribuyentes(contribuyentesRes.data);
        setCurrentPage(contribuyentesRes.pagination.currentPage);
        setTotalPages(contribuyentesRes.pagination.totalPages);
        setTotalRecords(contribuyentesRes.pagination.totalRecords);
        setHasNextPage(contribuyentesRes.pagination.hasNextPage);
        setHasPrevPage(contribuyentesRes.pagination.hasPrevPage);
      } else {
        // Fallback para compatibilidad con respuesta anterior
        setContribuyentes(Array.isArray(contribuyentesRes) ? contribuyentesRes : []);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalRecords(contribuyentesRes.length || 0);
        setHasNextPage(false);
        setHasPrevPage(false);
      }
      
      setStats(statsRes);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error("Error cargando datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsHydrated(true);
    fetchData();
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(filtroRif, filtroTipo, newPage);
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleAddContribuyente = async () => {
    if (!formData.rif.trim()) {
      toast.error("Por favor ingresa un RIF");
      return;
    }

    setAddingContribuyente(true);

    try {
      const response = await fetch("/api/admin/cartera-contribuyentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rif: formData.rif.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Contribuyente agregado exitosamente");
        setFormData({ rif: '' });
        setOpenAddDialog(false);
        fetchData(filtroRif, filtroTipo, 1); // Volver a la primera página
      } else {
        toast.error(data.error || "Error agregando contribuyente");
      }
    } catch (error) {
      toast.error("Error agregando contribuyente");
    } finally {
      setAddingContribuyente(false);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }

    setCsvUploading(true);

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("El archivo CSV debe tener al menos una fila de datos");
        return;
      }

      // Verificar que la primera línea sea el header correcto
      if (!lines[0].includes('RIF_CONTRIBUYENTE')) {
        toast.error("El archivo CSV debe tener el header 'RIF_CONTRIBUYENTE'");
        return;
      }

      // Extraer RIFs (saltar la primera línea que es el header)
      const rifs = lines.slice(1).map(line => line.trim()).filter(line => line);

      const response = await fetch("/api/admin/cartera-contribuyentes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rifs }),
      });

      const data = await response.json();

      if (response.ok) {
        setCsvResults(data);
        toast.success(`${data.success} contribuyentes agregados exitosamente`);
        if (data.errors.length > 0) {
          toast.warning(`${data.errors.length} RIFs tuvieron errores`);
        }
        setCsvFile(null);
        setOpenCSVDialog(false);
        fetchData(filtroRif, filtroTipo, 1); // Volver a la primera página
      } else {
        toast.error(data.error || "Error procesando CSV");
      }
    } catch (error) {
      toast.error("Error procesando archivo CSV");
    } finally {
      setCsvUploading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (contribuyente: CarteraContribuyente) => {
    setContribuyenteToDelete(contribuyente);
    setDeleteDialog(true);
  };

  // Handle delete execution
  const handleDeleteConfirm = async () => {
    if (!contribuyenteToDelete) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/cartera-contribuyentes/${contribuyenteToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Contribuyente ${contribuyenteToDelete.rif} eliminado exitosamente`);
        fetchData(filtroRif, filtroTipo, 1); // Volver a la primera página
        setDeleteDialog(false);
        setContribuyenteToDelete(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error eliminando contribuyente");
      }
    } catch (error) {
      toast.error("Error de conexión al eliminar contribuyente");
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteDialog(false);
    setContribuyenteToDelete(null);
  };

  // Funciones para eliminación masiva
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContribuyentes(new Set(contribuyentes.map(c => c.id.toString())));
    } else {
      setSelectedContribuyentes(new Set());
    }
  };

  const handleSelectContribuyente = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedContribuyentes);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedContribuyentes(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedContribuyentes.size === 0) {
      toast.error("No hay contribuyentes seleccionados");
      return;
    }

    setBulkDeleting(true);
    try {
      const response = await fetch("/api/admin/cartera-contribuyentes/bulk-delete", {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ids: Array.from(selectedContribuyentes)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.eliminados} contribuyentes eliminados exitosamente`);
        if (data.sinPermiso > 0) {
          toast.warning(`${data.sinPermiso} contribuyentes no pudieron ser eliminados por falta de permisos`);
        }
        setSelectedContribuyentes(new Set());
        setBulkDeleteDialog(false);
        fetchData(filtroRif, filtroTipo, 1); // Volver a la primera página
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error en eliminación masiva");
      }
    } catch (error) {
      toast.error("Error de conexión en eliminación masiva");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDownloadSample = () => {
    window.open("/api/admin/cartera-contribuyentes/download-sample", "_blank");
  };

  const aplicarFiltros = () => {
    setCurrentPage(1); // Resetear a la primera página al aplicar filtros
    fetchData(filtroRif, filtroTipo, 1);
  };

  const limpiarFiltros = () => {
    setFiltroRif("");
    setFiltroTipo("TODOS");
    setCurrentPage(1); // Resetear a la primera página al limpiar filtros
    fetchData("", "TODOS", 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'NATURAL': return 'Natural';
      case 'JURIDICO': return 'Jurídico';
      case 'GOBIERNO': return 'Gobierno';
      case 'CONSEJO_COMUNAL': return 'Consejo Comunal';
      default: return tipo;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartera de Contribuyentes</h1>
          <p className="text-muted-foreground">
            Gestiona la cartera de contribuyentes del sistema
          </p>
        </div>
        <div className="flex gap-2">
          {/* Debug info - solo visible en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mr-2">
              Seleccionados: {selectedContribuyentes.size} | Total: {contribuyentes.length}
            </div>
          )}
                      <Button
              onClick={() => setBulkDeleteDialog(true)}
              variant="destructive"
              className={`flex items-center gap-2 transition-all duration-200 ${
                selectedContribuyentes.size > 0 
                  ? 'bg-red-600 hover:bg-red-700 hover:shadow-lg transform hover:scale-105' 
                  : 'bg-gray-400 cursor-not-allowed opacity-50'
              }`}
              disabled={selectedContribuyentes.size === 0}
            >
              <IconTrashX size={16} />
              Eliminar Seleccionados ({selectedContribuyentes.size})
            </Button>
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 relative bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar RIF
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium animate-pulse">
                  Nuevo
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white shadow-2xl border-0 rounded-xl">
              <DialogHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <DialogTitle className="text-xl font-semibold text-gray-900">Agregar Contribuyente</DialogTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Ingresa el RIF del contribuyente que deseas agregar a tu cartera
                </p>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Campo de entrada RIF */}
                <div className="space-y-3">
                  <Label htmlFor="rif" className="text-sm font-medium text-gray-700">
                    Número de RIF
                  </Label>
                  <div className="relative">
                    <Input
                      id="rif"
                      value={formData.rif}
                      onChange={(e) => setFormData({ ...formData, rif: e.target.value.toUpperCase() })}
                      placeholder="Ej: V123456789"
                      maxLength={10}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-lg font-mono"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Información de formato */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-2">Formato requerido:</p>
                        <div className="space-y-1 text-xs">
                          <p>• <span className="font-mono font-semibold">J</span> + 9 dígitos = Jurídico</p>
                          <p>• <span className="font-mono font-semibold">V</span> + 9 dígitos = Natural</p>
                          <p>• <span className="font-mono font-semibold">E</span> + 9 dígitos = Natural</p>
                          <p>• <span className="font-mono font-semibold">P</span> + 9 dígitos = Natural</p>
                          <p>• <span className="font-mono font-semibold">G</span> + 9 dígitos = Gobierno</p>
                          <p>• <span className="font-mono font-semibold">C</span> + 9 dígitos = Consejo Comunal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleAddContribuyente} 
                    disabled={addingContribuyente}
                    className={`flex-1 transition-all duration-300 ${
                      addingContribuyente 
                        ? 'bg-green-500 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {addingContribuyente ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Agregar Contribuyente
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setOpenAddDialog(false)}
                    className="px-6 hover:bg-gray-50 transition-all duration-200"
                    disabled={addingContribuyente}
                  >
                    Cancelar
                  </Button>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Información importante:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• El RIF debe tener exactamente 10 caracteres</li>
                        <li>• No se permiten RIFs duplicados en el sistema</li>
                        <li>• Los usuarios Ejecutivo tienen límite de 1000 contribuyentes</li>
                        <li>• El sistema validará automáticamente el formato</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openCSVDialog} onOpenChange={setOpenCSVDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Cargar CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white shadow-2xl border-0 rounded-xl">
              <DialogHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <DialogTitle className="text-xl font-semibold text-gray-900">Cargar Contribuyentes desde CSV</DialogTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Sube un archivo CSV con los RIFs de los contribuyentes que deseas agregar
                </p>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Área de carga de archivo */}
                <div className="relative">
                  <Label htmlFor="csv-file" className="text-sm font-medium text-gray-700 mb-2 block">
                    Seleccionar Archivo CSV
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                    <div className="space-y-2">
                      <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <label htmlFor="csv-file" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Subir archivo CSV</span>
                          <input
                            id="csv-file"
                            name="csv-file"
                            type="file"
                            accept=".csv"
                            className="sr-only"
                            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta aquí</p>
                      </div>
                      {csvFile && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-green-800">{csvFile.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    El archivo debe tener una columna llamada "RIF_CONTRIBUYENTE"
                  </p>
                </div>

                {/* Botón de descarga de ejemplo */}
                <div className="text-center">
                  <Button 
                    onClick={handleDownloadSample} 
                    variant="outline" 
                    className="w-full bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-900 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar CSV de Ejemplo
                  </Button>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleCSVUpload} 
                    disabled={!csvFile || csvUploading}
                    className={`flex-1 transition-all duration-300 ${
                      csvUploading 
                        ? 'bg-blue-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {csvUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Cargar Contribuyentes
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setOpenCSVDialog(false)}
                    className="px-6 hover:bg-gray-50 transition-all duration-200"
                    disabled={csvUploading}
                  >
                    Cancelar
                  </Button>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Requisitos del archivo:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Formato CSV con encabezado "RIF_CONTRIBUYENTE"</li>
                        <li>• Un RIF por línea (máximo 1000 para usuarios Ejecutivo)</li>
                        <li>• RIFs válidos: J, V, E, P, G, C + 9 dígitos</li>
                        <li>• No se permiten RIFs duplicados</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Contribuyentes</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Naturales (V, E)</p>
                <p className="text-2xl font-bold text-green-900">{stats.naturales}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Jurídicos (J)</p>
                <p className="text-2xl font-bold text-purple-900">{stats.juridicos}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Gobierno (G)</p>
                <p className="text-2xl font-bold text-orange-900">{stats.gobierno}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Consejos Comunales (C)</p>
                <p className="text-2xl font-bold text-red-900">{stats.consejosComunales}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold text-blue-900">Contribuyentes Registrados</h1>
        </CardHeader>
        <CardContent>
          {/* Filtros de búsqueda */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filtro-rif">Buscar por RIF</Label>
                <Input
                  id="filtro-rif"
                  value={filtroRif}
                  onChange={(e) => setFiltroRif(e.target.value.toUpperCase())}
                  placeholder="RIF del contribuyente..."
                  onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtro-tipo">Filtrar por Tipo</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos los tipos</SelectItem>
                    <SelectItem value="NATURAL">Natural</SelectItem>
                    <SelectItem value="JURIDICO">Jurídico</SelectItem>
                    <SelectItem value="GOBIERNO">Gobierno</SelectItem>
                    <SelectItem value="CONSEJO_COMUNAL">Consejo Comunal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={aplicarFiltros} className="flex-1">
                  Buscar
                </Button>
                <Button onClick={limpiarFiltros} variant="outline">
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {!isHydrated || isLoading ? (
            <SkeletonTable />
          ) : (
            <>
              {/* Información de resultados */}
              <div className="mb-4 text-sm text-gray-600">
                {contribuyentes.length > 0 ? (
                  <span>Página {currentPage} de {totalPages} - {totalRecords} contribuyentes total</span>
                ) : !isLoading && (
                  <span>No se encontraron contribuyentes</span>
                )}
              </div>
              


              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell className="w-12">
                      <Checkbox
                        checked={contribuyentes.length > 0 && selectedContribuyentes.size === contribuyentes.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Seleccionar todos"
                      />
                    </TableCell>
                    <TableCell>RIF</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Registrado por</TableCell>
                    <TableCell>Fecha de Registro</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contribuyentes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No hay contribuyentes para mostrar
                      </TableCell>
                    </TableRow>
                  ) : (
                    contribuyentes.map((contribuyente) => (
                      <TableRow key={contribuyente.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContribuyentes.has(contribuyente.id.toString())}
                            onCheckedChange={(checked) => handleSelectContribuyente(contribuyente.id.toString(), checked as boolean)}
                            aria-label={`Seleccionar ${contribuyente.rif}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono">{contribuyente.rif}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            contribuyente.tipoContribuyente === 'NATURAL' ? 'bg-green-100 text-green-800' :
                            contribuyente.tipoContribuyente === 'JURIDICO' ? 'bg-purple-100 text-purple-800' :
                            contribuyente.tipoContribuyente === 'GOBIERNO' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getTipoLabel(contribuyente.tipoContribuyente)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {contribuyente.usuario ? 
                            `${contribuyente.usuario.firstName} ${contribuyente.usuario.lastName}` : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>{formatDate(contribuyente.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(contribuyente)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <IconTrash size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}

          {/* Controles de Paginación */}
          {(() => {
            console.log('🔍 DEBUG PAGINACIÓN:', {
              isLoading,
              totalRecords,
              totalPages,
              currentPage,
              contribuyentesLength: contribuyentes.length,
              condition: !isLoading && totalRecords > 0
            });
            return !isLoading && totalRecords > 0;
          })() && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Mostrando {contribuyentes.length > 0 ? ((currentPage - 1) * 100) + 1 : 0} - {Math.min(currentPage * 100, totalRecords)} de {totalRecords} contribuyentes
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={!hasPrevPage}
                  className="px-3 py-1"
                >
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {/* Primera página */}
                  {currentPage > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      className="w-8 h-8 p-0"
                    >
                      1
                    </Button>
                  )}
                  
                  {/* Puntos suspensivos al inicio */}
                  {currentPage > 3 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  
                  {/* Páginas alrededor de la actual */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Puntos suspensivos al final */}
                  {currentPage < totalPages - 2 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  
                  {/* Última página */}
                  {currentPage < totalPages && totalPages > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  className="px-3 py-1"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-red-50 border-2 border-red-200 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-red-600 to-pink-600 -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-white text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <IconAlertTriangle className="w-5 h-5 text-white" />
              </div>
              Confirmar Eliminación
            </DialogTitle>
            <p className="text-red-100 text-sm mt-1">
              Esta acción no se puede deshacer
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Información del contribuyente a eliminar */}
            {contribuyenteToDelete && (
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <IconAlertTriangle className="w-3 h-3 text-red-600" />
                  </div>
                  Contribuyente a Eliminar
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">RIF:</span>
                    <span className="text-sm text-gray-800 font-mono font-semibold">{contribuyenteToDelete.rif}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Tipo:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contribuyenteToDelete.tipoContribuyente === 'NATURAL' ? 'bg-green-100 text-green-800' :
                      contribuyenteToDelete.tipoContribuyente === 'JURIDICO' ? 'bg-purple-100 text-purple-800' :
                      contribuyenteToDelete.tipoContribuyente === 'GOBIERNO' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getTipoLabel(contribuyenteToDelete.tipoContribuyente)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Registrado por:</span>
                    <span className="text-sm text-gray-800 font-semibold">
                      {contribuyenteToDelete.usuario ? 
                        `${contribuyenteToDelete.usuario.firstName} ${contribuyenteToDelete.usuario.lastName}` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Fecha de registro:</span>
                    <span className="text-sm text-gray-800 font-semibold">{formatDate(contribuyenteToDelete.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Advertencia */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-800">Advertencia Importante</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Se eliminará permanentemente el contribuyente de la cartera</li>
                    <li>• Se perderán todos los datos asociados</li>
                    <li>• Esta acción no se puede deshacer</li>
                    <li>• Solo el usuario que lo registró o un administrador puede eliminarlo</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <IconTrash className="w-4 h-4 mr-2" />
                    Eliminar Contribuyente
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación Masiva */}
      <Dialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-red-50 border-2 border-red-200 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-red-600 to-pink-600 -m-6 mb-6 p-6 rounded-t-lg">
            <DialogTitle className="text-white text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <IconTrashX className="w-5 h-5 text-white" />
              </div>
              Confirmar Eliminación Masiva
            </DialogTitle>
            <p className="text-red-100 text-sm mt-1">
              Esta acción eliminará {selectedContribuyentes.size} contribuyente{selectedContribuyentes.size !== 1 ? 's' : ''} de forma permanente
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Información de la eliminación masiva */}
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <IconTrashX className="w-3 h-3 text-red-600" />
                </div>
                Contribuyentes a Eliminar
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Cantidad seleccionada:</span>
                  <span className="text-sm text-gray-800 font-semibold">{selectedContribuyentes.size} contribuyente{selectedContribuyentes.size !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Contribuyentes visibles:</span>
                  <span className="text-sm text-gray-800 font-semibold">{contribuyentes.length} contribuyente{contribuyentes.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Porcentaje seleccionado:</span>
                  <span className="text-sm text-gray-800 font-semibold">
                    {contribuyentes.length > 0 ? Math.round((selectedContribuyentes.size / contribuyentes.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Lista de contribuyentes seleccionados */}
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Contribuyentes seleccionados:</h4>
              <div className="space-y-1">
                {contribuyentes
                  .filter(c => selectedContribuyentes.has(c.id.toString()))
                  .slice(0, 10)
                  .map((contribuyente) => (
                    <div key={contribuyente.id} className="flex justify-between items-center text-sm">
                      <span className="font-mono text-gray-800">{contribuyente.rif}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contribuyente.tipoContribuyente === 'NATURAL' ? 'bg-green-100 text-green-800' :
                        contribuyente.tipoContribuyente === 'JURIDICO' ? 'bg-purple-100 text-purple-800' :
                        contribuyente.tipoContribuyente === 'GOBIERNO' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getTipoLabel(contribuyente.tipoContribuyente)}
                      </span>
                    </div>
                  ))}
                {selectedContribuyentes.size > 10 && (
                  <div className="text-xs text-gray-500 italic">
                    ... y {selectedContribuyentes.size - 10} contribuyente{selectedContribuyentes.size - 10 !== 1 ? 's' : ''} más
                  </div>
                )}
              </div>
            </div>

            {/* Advertencia */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-800">Advertencia Importante</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Se eliminarán permanentemente {selectedContribuyentes.size} contribuyente{selectedContribuyentes.size !== 1 ? 's' : ''} de la cartera</li>
                    <li>• Se perderán todos los datos asociados</li>
                    <li>• Esta acción no se puede deshacer</li>
                    <li>• Solo se eliminarán los contribuyentes que hayas creado tú mismo</li>
                    <li>• Los contribuyentes creados por otros usuarios no se eliminarán</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setBulkDeleteDialog(false)}
                disabled={bulkDeleting}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <IconTrashX className="w-4 h-4 mr-2" />
                    Eliminar {selectedContribuyentes.size} Contribuyente{selectedContribuyentes.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 