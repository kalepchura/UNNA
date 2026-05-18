export interface ValorMtbDto {
  id: number;
  anio: number;
  mtb: number | null; 
  mtbAcumulado: number;
}

export interface ValoresMtbResponse {
  escenarioId: number;
  escenarioNombre: string;
  valores: ValorMtbDto[];
  totalAnios: number;
  mtbAcumuladoTotal: number;
}

export interface CambioMtbDto {
  anio: number;
  mtb: number | null;
}

export interface GuardarValoresMtbRequest {
  cambios: CambioMtbDto[];
}

export interface GuardarValoresMtbResponse {
  cambiosProcesados: number;
  valoresCreados: number;
  valoresActualizados: number;
  valoresEliminados: number;
  fechaProceso: string;
}