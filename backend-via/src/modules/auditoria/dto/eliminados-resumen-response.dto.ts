/**
 * Conteo de registros soft-deleted por entidad.
 * Lo consume la página de Auditoría → pestaña "Registros eliminados"
 * para mostrar badges con el número de eliminados de cada entidad.
 */
export class EntidadEliminadosDto {
  /** Identificador lógico (ej: 'fallas-riel'). Usado por el frontend para enrutar. */
  codigo!: string;

  /** Nombre legible (ej: 'Fallas en Riel'). Para mostrar en UI. */
  nombre!: string;

  /** Módulo al que pertenece (FALLAS, TEMPERATURA, DESGASTE). */
  modulo!: string;

  /** Cantidad de registros eliminados. */
  total!: number;
}

/**
 * Resumen de TODOS los eliminados del sistema, agrupados por entidad.
 */
export class EliminadosResumenResponseDto {
  entidades!: EntidadEliminadosDto[];

  /** Suma total. Útil para el badge global. */
  totalGeneral!: number;

  calculadoEn!: Date;
}