export interface PlanillaSinConcepto {
  id: number;
  rif_contribuyente: string;
  num_planilla: string;
  monto_total_trans: number;
  codigo_forma: number;
  nombre_forma: string;
  planilla_id: number;
  fecha_trans?: string;
}

export interface FormaAgrupada {
  codigo_forma: number;
  nombre_forma: string;
  cantidad_planillas: string | number;
  monto_total: number;
  planillas?: PlanillaSinConcepto[];
}

export interface CodigoPresupuestario {
  id: number;
  codigo_presupuestario: string;
  designacion_presupuestario: string;
}

export interface VinculacionForma {
  codigo_forma: number;
  nombre_forma: string;
  codigo_presupuestario_id: number;
  codigo_presupuestario: string;
  designacion_presupuestario: string;
}

export interface ResultadoCreacion {
  planillas_procesadas: number;
  conceptos_creados: number;
  planillas_validadas: number;
  errores: string[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  pagination?: PaginationInfo;
} 