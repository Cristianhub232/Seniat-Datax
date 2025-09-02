export interface FormaNoValidada {
  id: number;
  rif_contribuyente: string;
  num_planilla: string;
  monto_total_trans: number;
  codigo_forma: number;
  nombre_forma: string;
  planilla_id: number;
}

export interface FormaNoValidadaStats {
  total_formas_no_validadas: number;
  total_monto_no_validadas: number;
  total_formas_validadas: number;
  total_monto_validadas: number;
  porcentaje_no_validadas: number;
  porcentaje_monto_no_validadas: number;
}

export interface FormaNoValidadaResumen {
  codigo_forma: number;
  nombre_forma: string;
  cantidad_planillas: number;
  monto_total: number;
  porcentaje_forma: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} 