export class GuardarValoresMtbResponseDto {
  /** Cantidad total de cambios procesados. */
  cambiosProcesados!: number;
  valoresCreados!: number;
  valoresActualizados!: number;
  valoresEliminados!: number;
  fechaProceso!: Date;
}