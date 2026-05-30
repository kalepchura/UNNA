export interface ImportacionFallasRielResultadoDto {
  totalFilas: number;
  deteccionesCreadas: number;
  accionesCreadas: number;
  errores: number;
  detalleErrores: { fila: number; columna?: string; mensaje: string }[];
}
 