/**
 * Resultado de la operación de guardado masivo.
 */
export class GuardarCambiosResponseDto {
  /** Cantidad total de celdas modificadas. */
  celdasModificadas!: number;

  /** Cantidad de filas (elemento+año+trimestre) afectadas. */
  filasAfectadas!: number;

  /** Cantidad de filas que se crearon nuevas (UPSERT con insert). */
  filasCreadas!: number;

  /** Cantidad de filas que se actualizaron (UPSERT con update). */
  filasActualizadas!: number;

  fechaProceso!: Date;
}