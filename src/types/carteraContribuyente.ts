export interface CarteraContribuyente {
  id: string;
  rif: string;
  tipoContribuyente: 'NATURAL' | 'JURIDICO' | 'GOBIERNO' | 'CONSEJO_COMUNAL';
  usuarioId: string;
  createdAt: string;
  updatedAt: string;
  usuario?: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface CarteraContribuyenteStats {
  total: number;
  naturales: number;
  juridicos: number;
  gobierno: number;
  consejosComunales: number;
}

export interface CarteraContribuyenteFormData {
  rif: string;
}

export interface CSVUploadResponse {
  success: number;
  errors: Array<{
    rif: string;
    error: string;
  }>;
} 