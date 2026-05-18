export interface FiltrosEscenarios {
  nombre?: string;
  page?: number;
  limit?: number;
}

export interface EscenarioResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  esReal: boolean;
  creadoPor: string;
  creadoEn: string;
  actualizadoEn: string;
  eliminado: boolean;
}

export interface CrearEscenarioDto {
  nombre: string;
  descripcion?: string | null;
}

export interface ActualizarEscenarioDto {
  nombre?: string;
  descripcion?: string | null;
}