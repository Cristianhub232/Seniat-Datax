"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Download, Search, AlertCircle, CheckCircle, DollarSign, Building, FileText } from "lucide-react";
import { toast } from "sonner";

interface PagoEjecutado {
  id: string;
  rif: string;
  apellidoContribuyente: string;
  montoTotalPago: number;
  tipoDocumentoPago: string;
  fechaRecaudacionPago: string;
  numeroDocumentoPago: string;
  bancoPago: string;
  periodoPago: string;
  nombreDependencia: string;
  descripcionTipoContribuyente: string;
  idContribuyente: string | null;
  nombreBanco: string;
  descripcionFormulario: string;
  rifValido: boolean;
}

interface PagosStats {
  total: number;
  montoTotal: number;
  rifValidos: number;
  rifInvalidos: number;
  pagosHoy: number;
  pagosMes: number;
  totalCartera: number;
  rifSinPagos: number;
}

export default function PagosEjecutadosPage() {
  const [pagos, setPagos] = useState<PagoEjecutado[]>([]);
  const [stats, setStats] = useState<PagosStats>({
    total: 0,
    montoTotal: 0,
    rifValidos: 0,
    rifInvalidos: 0,
    pagosHoy: 0,
    pagosMes: 0,
    totalCartera: 0,
    rifSinPagos: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Función para obtener fechas de los últimos 7 días
  const getLast7Days = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      fechaInicio: formatDate(sevenDaysAgo),
      fechaFin: formatDate(today)
    };
  };

  // Filtros con fechas por defecto de los últimos 7 días
  const defaultDates = getLast7Days();
  const [fechaInicio, setFechaInicio] = useState(defaultDates.fechaInicio);
  const [fechaFin, setFechaFin] = useState(defaultDates.fechaFin);
  const [filtroRif, setFiltroRif] = useState("");
  const [filtroBanco, setFiltroBanco] = useState("TODOS");
  const [filtroDependencia, setFiltroDependencia] = useState("TODAS");
  const [filtroRifValido, setFiltroRifValido] = useState("TODOS");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // Cargar datos automáticamente al montar el componente
    if (fechaInicio && fechaFin) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    if (!fechaInicio || !fechaFin) {
      console.log("Fechas no disponibles aún, esperando...");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("fechaInicio", fechaInicio);
      params.append("fechaFin", fechaFin);
      if (filtroRif) params.append("rif", filtroRif.toUpperCase());
      if (filtroBanco !== "TODOS") params.append("banco", filtroBanco);
      if (filtroDependencia !== "TODAS") params.append("dependencia", filtroDependencia);
      if (filtroRifValido !== "TODOS") params.append("rifValido", filtroRifValido);

      const url = `/api/admin/pagos-ejecutados${params.toString() ? `?${params.toString()}` : ''}`;
      
      const [pagosRes, statsRes] = await Promise.all([
        fetch(url).then((r) => r.json()),
        fetch(`/api/admin/pagos-ejecutados/stats?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`).then((r) => r.json()),
      ]);

      setPagos(Array.isArray(pagosRes) ? pagosRes : []);
      setStats(statsRes || {
        total: 0,
        montoTotal: 0,
        rifValidos: 0,
        rifInvalidos: 0,
        pagosHoy: 0,
        pagosMes: 0,
        totalCartera: 0,
        rifSinPagos: 0
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error("Error cargando datos");
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarFiltros = () => {
    const defaultDates = getLast7Days();
    setFechaInicio(defaultDates.fechaInicio);
    setFechaFin(defaultDates.fechaFin);
    setFiltroRif("");
    setFiltroBanco("TODOS");
    setFiltroDependencia("TODAS");
    setFiltroRifValido("TODOS");
  };

  const handleDownloadClick = () => {
    if (pagos.length === 0) {
      toast.error("No hay datos para descargar");
      return;
    }
    setShowDownloadModal(true);
  };

  const descargarExcel = async () => {
    setShowDownloadModal(false);
    setIsDownloading(true);
    
    try {
      const params = new URLSearchParams();
      params.append("fechaInicio", fechaInicio);
      params.append("fechaFin", fechaFin);
      if (filtroRif) params.append("rif", filtroRif.toUpperCase());
      if (filtroBanco !== "TODOS") params.append("banco", filtroBanco);
      if (filtroDependencia !== "TODAS") params.append("dependencia", filtroDependencia);
      if (filtroRifValido !== "TODOS") params.append("rifValido", filtroRifValido);

      const response = await fetch(`/api/admin/pagos-ejecutados/download-excel?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pagos-ejecutados-${fechaInicio}-${fechaFin}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Archivo Excel descargado exitosamente");
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error("Error al descargar el archivo");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(amount);
  };

  const getRifValidoBadge = (rifValido: boolean) => {
    return rifValido ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        Válido
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        <AlertCircle className="w-3 h-3 mr-1" />
        Inválido
      </Badge>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagos Ejecutados</h1>
          <p className="text-muted-foreground">
            Consulta y gestión de pagos ejecutados por contribuyentes
          </p>
        </div>
        <Button 
          onClick={handleDownloadClick} 
          disabled={pagos.length === 0 || isLoading || isDownloading}
          className={pagos.length > 0 && !isDownloading ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generando Excel...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              {pagos.length > 0 ? `Descargar Excel (${pagos.length} registros)` : "Descargar Excel"}
            </>
          )}
        </Button>
      </div>

      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Pagos</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.total?.toLocaleString() || '0'}</p>
                <p className="text-xs text-blue-700">
                  Monto: {formatCurrency(stats?.montoTotal || 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">RIF Válidos</p>
                <p className="text-2xl font-bold text-green-900">{stats?.rifValidos?.toLocaleString() || '0'}</p>
                <p className="text-xs text-green-700">
                  {stats?.total > 0 ? `${((stats?.rifValidos || 0) / stats.total * 100).toFixed(1)}% del total` : '0%'}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">RIF Inválidos</p>
                <p className="text-2xl font-bold text-red-900">{stats?.rifInvalidos?.toLocaleString() || '0'}</p>
                <p className="text-xs text-red-700">
                  {stats?.total > 0 ? `${((stats?.rifInvalidos || 0) / stats.total * 100).toFixed(1)}% del total` : '0%'}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Pagos Hoy</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.pagosHoy?.toLocaleString() || '0'}</p>
                <p className="text-xs text-purple-700">
                  {stats?.pagosMes?.toLocaleString() || '0'} este mes
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">RIFs Sin Pagos</p>
                <p className="text-2xl font-bold text-orange-900">{stats?.rifSinPagos?.toLocaleString() || '0'}</p>
                <p className="text-xs text-orange-700">
                  de {stats?.totalCartera?.toLocaleString() || '0'} en cartera
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold text-blue-900">Filtros de Búsqueda</h1>
        </CardHeader>
        <CardContent>
          {/* Filtros de búsqueda */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Criterios de Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha-inicio" className="text-sm font-medium">
                  Fecha Inicio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha-inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-fin" className="text-sm font-medium">
                  Fecha Fin <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha-fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtro-rif">RIF del Contribuyente</Label>
                <Input
                  id="filtro-rif"
                  value={filtroRif}
                  onChange={(e) => setFiltroRif(e.target.value.toUpperCase())}
                  placeholder="Ej: J000202002"
                  onKeyPress={(e) => e.key === 'Enter' && fetchData()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtro-rif-valido">Estado RIF</Label>
                <Select value={filtroRifValido} onValueChange={setFiltroRifValido}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos</SelectItem>
                    <SelectItem value="VALIDO">Válidos</SelectItem>
                    <SelectItem value="INVALIDO">Inválidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-end space-x-2 mt-4">
              <Button onClick={fetchData} disabled={!fechaInicio || !fechaFin} className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Buscar Pagos
              </Button>
              <Button onClick={limpiarFiltros} variant="outline">
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de resultados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold text-blue-900">Resultados de Pagos Ejecutados</h1>
        </CardHeader>
        <CardContent>
          {!isHydrated || isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando pagos...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Información de resultados */}
              <div className="mb-4 text-sm text-gray-600">
                {pagos.length > 0 ? (
                  <span>Mostrando {pagos.length} pago{pagos.length !== 1 ? 's' : ''}</span>
                ) : !isLoading && (
                  <span>No se encontraron pagos para el rango de fechas seleccionado</span>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RIF</TableHead>
                    <TableHead>Contribuyente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha Pago</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Dependencia</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Estado RIF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        {!fechaInicio || !fechaFin 
                          ? "Seleccione un rango de fechas para buscar pagos"
                          : "No hay pagos para mostrar"
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagos.map((pago) => (
                      <TableRow key={pago.id}>
                        <TableCell className="font-mono">{pago.rif}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pago.apellidoContribuyente || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{pago.descripcionTipoContribuyente}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(pago.montoTotalPago)}
                        </TableCell>
                        <TableCell>{formatDate(pago.fechaRecaudacionPago)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pago.nombreBanco || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{pago.numeroDocumentoPago}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pago.descripcionFormulario}</div>
                            <div className="text-sm text-gray-500">{pago.tipoDocumentoPago}</div>
                          </div>
                        </TableCell>
                        <TableCell>{pago.nombreDependencia || 'N/A'}</TableCell>
                        <TableCell>{pago.periodoPago}</TableCell>
                        <TableCell>{getRifValidoBadge(pago.rifValido)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación para descarga */}
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Descarga</DialogTitle>
            <DialogDescription>
              ¿Desea descargar los datos de pagos ejecutados?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Detalles de la descarga:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Registros:</strong> {pagos.length} pagos</li>
                <li>• <strong>Período:</strong> {formatDate(fechaInicio)} - {formatDate(fechaFin)}</li>
                <li>• <strong>Formato:</strong> Archivo Excel (.xlsx)</li>
                <li>• <strong>Filtros aplicados:</strong> 
                  {filtroRif && ` RIF: ${filtroRif},`}
                  {filtroBanco !== "TODOS" && ` Banco: ${filtroBanco},`}
                  {filtroDependencia !== "TODAS" && ` Dependencia: ${filtroDependencia},`}
                  {filtroRifValido !== "TODOS" && ` Estado RIF: ${filtroRifValido}`}
                  {!filtroRif && filtroBanco === "TODOS" && filtroDependencia === "TODAS" && filtroRifValido === "TODOS" && " Ninguno"}
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDownloadModal(false)}
              disabled={isDownloading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={descargarExcel} 
              className="bg-green-600 hover:bg-green-700"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando Excel...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Excel
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 