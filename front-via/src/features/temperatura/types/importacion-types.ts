export interface FiltrosImportaciones {
  tramoIds?: number[];
  tipoArchivo?: 'CSV' | 'EXCEL' | 'XML';
  fechaSubidaDesde?: string;
  fechaSubidaHasta?: string;
  creadoPorId?: string;
  nombreArchivo?: string;
  registrosValidosMin?: number;
  page?: number;
  limit?: number;
}

export interface ImportacionResponse {
  id: number;
  nombreArchivo: string;
  tipoArchivo: 'CSV' | 'EXCEL' | 'XML';
  progresiva: number;
  tramoId: number;
  tramoCodigo: string;
  tramoNombre: string;
  comentarioEspecialista: string | null;
  fechaSubida: string;
  totalRegistros: number;
  registrosValidos: number;
  registrosInvalidos: number;
  creadoPor: string;
  creadoEn: string;
  actualizadoEn: string;
  eliminado: boolean;
}

export interface FiltrosRegistros {
  fechaDesde?: string;
  fechaHasta?: string;
  temperaturaMin?: number;
  temperaturaMax?: number;
  page?: number;
  limit?: number;
}

export interface TemperaturaRegistroResponse {
  id: string;
  fecha: string;
  hora: string;
  temperatura: number;
  importacionId: number;
  creadoEn: string;
}

export interface ImportarTemperaturaDto {
  progresiva: number;
  comentarioEspecialista?: string;
}

export interface ImportacionResultado {
  importacionId: number;
  nombreArchivo: string;
  tipoArchivo: string;
  progresiva: number;
  tramoId: number;
  tramoCodigo: string;
  tramoNombre: string;
  totalRegistros: number;
  registrosValidos: number;
  registrosInvalidos: number;
  primerosErrores: string[];
  fechaSubida: string;
}