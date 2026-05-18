export interface FiltrarAuditoriaFiltros {
  modulo?: string;
  operacion?: string;
  usuarioId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  detalleTexto?: string;
  page?: number;
  limit?: number;
}

export interface AuditoriaLogResponse {
  id: string;
  modulo: string;
  entidad: string;
  entidadId: string | null;
  operacion: string;
  usuarioId: string;
  usuarioNombre: string;
  registrosAfectados: number | null;
  detalle: Record<string, any> | null;
  fecha: string;
}

export interface EntidadEliminados {
  codigo: string;
  nombre: string;
  modulo: string;
  total: number;
}

export interface EliminadosResumenResponse {
  entidades: EntidadEliminados[];
  totalGeneral: number;
  calculadoEn: string;
}