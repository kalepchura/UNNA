/**
 * Una fila del listado: año + MTB anual + MTB acumulado.
 * El MTB acumulado se calcula en el service.
 */
export class ValorMtbDto {
  /** ID del registro mtb_escenario (útil para el frontend si lo necesita). */
  id!: number;
  anio!: number;
  mtb!: number;
  mtbAcumulado!: number;
}

export class ValoresMtbResponseDto {
  escenarioId!: number;
  escenarioNombre!: string;

  /**
   * Valores ordenados por año ASC.
   * El cálculo de mtbAcumulado se hace en este orden.
   */
  valores!: ValorMtbDto[];

  /** Para mostrar en UI. */
  totalAnios!: number;

  /**
   * Suma total = MTB acumulado del último año.
   * Atajo útil para mostrar "MTB total: X".
   */
  mtbAcumuladoTotal!: number;
}