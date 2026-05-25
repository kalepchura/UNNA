export interface CargarGrillaFiltros {
  escenarioId?: number;
  anios?: number[];
  tramoIds?: number[];
}

export interface FilaGrillaDto {
  elementoId: number;
  codigoElemento: number;
  progresiva: number;
  via: string;
  tramoCodigo: string;
  tramoNombre: string;

  mediciones: Record<
    number,
    Record<
      number,
      {
        w1: number | null;
        w2: number | null;
        w3r: number | null;
        w3l: number | null;
      }
    >
  >;
}

export interface GrillaResponse {
  anios: number[];
  filas: FilaGrillaDto[];
  totalElementos: number;
}

export interface CeldaModificadaDto {
  elementoId: number;
  anio: number;
  trimestre: number;
  punto: 'W1' | 'W2' | 'W3R' | 'W3L';
  valor: number | null;
}

export interface GuardarCambiosRequest {
  escenarioId: number;
  cambios: CeldaModificadaDto[];
}

export interface GuardarCambiosResponse {
  celdasModificadas: number;
  filasAfectadas: number;
  filasCreadas: number;
  filasActualizadas: number;
  fechaProceso: string;
}