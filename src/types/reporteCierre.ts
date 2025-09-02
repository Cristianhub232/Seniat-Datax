export interface Concepto2024 {
  id: number;
  codigo_presupuestario: string;
  concepto: string;
  monto: number;
  fecha_registro: string;
  tipo_operacion?: string;
  mes?: number;
  anio?: number;
  estado?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ReporteCierre {
  id: string;
  titulo: string;
  codigo_presupuestario: string;
  fecha_generacion: Date;
  total_monto: number;
  cantidad_conceptos: number;
  periodo_inicio: string;
  periodo_fin: string;
  estado: 'PENDIENTE' | 'GENERADO' | 'ERROR';
  url_pdf?: string;
}

export interface CreateReporteRequest {
  codigo_presupuestario: string;
  periodo_inicio: string;
  periodo_fin: string;
  titulo?: string;
}

export interface ReporteResumen {
  codigo_presupuestario: string;
  designacion_presupuestario: string;
  total_monto: number;
  cantidad_conceptos: number;
  promedio_monto: number;
  monto_maximo: number;
  monto_minimo: number;
}

export interface FiltrosReporte {
  codigo_presupuestario?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_operacion?: string;
  monto_minimo?: number;
  monto_maximo?: number;
}

export interface EstadisticasReporte {
  total_conceptos: number;
  total_monto: number;
  promedio_monto: number;
  conceptos_por_mes: Array<{
    mes: number;
    cantidad: number;
    monto_total: number;
  }>;
  top_codigos_presupuestarios: Array<{
    codigo: string;
    total_monto: number;
    cantidad: number;
  }>;
} 