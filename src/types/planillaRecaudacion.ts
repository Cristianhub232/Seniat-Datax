export interface PlanillaRecaudacion {
  rif_contribuyente: string;
  cod_seg_planilla: string;
  fecha_trans: string;
  num_planilla: string;
  monto_total_trans: number;
  monto_concepto: number | null;
  codigo_presupuestario: string | null;
  designacion_presupuestario: string | null;
  nombre_forma: string | null;
  codigo_forma: string | null;
  codigo_banco: string | null;
  nombre_banco: string | null;
}

export interface PlanillaRecaudacionFilters {
  rif_contribuyente?: string;
  cod_seg_planilla?: string;
  nombre_banco?: string;
  codigo_banco?: string;
  nombre_forma?: string;
  codigo_forma?: string;
  codigo_presupuestario?: string;
  designacion_presupuestario?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_minimo?: string;
  monto_maximo?: string;
}

export interface PlanillaRecaudacionStats {
  total_planillas: number;
  monto_total: number;
  bancos_unicos: number;
  contribuyentes_unicos: number;
  formas_unicas: number;
  promedio_monto: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} 