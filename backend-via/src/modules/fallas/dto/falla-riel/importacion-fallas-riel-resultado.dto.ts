// ============================================================
// importacion-fallas-riel-resultado.dto.ts
// ============================================================
// DTO de respuesta tras procesar un archivo de importación.
// ============================================================

export class ImportacionFallasRielResultadoDto {
  /** Total de filas encontradas en el archivo (sin contar encabezado). */
  totalFilas!: number;

  /** Fallas de detección creadas exitosamente. */
  deteccionesCreadas!: number;

  /** Acciones creadas exitosamente. */
  accionesCreadas!: number;

  /** Filas que fallaron (errores de validación o procesamiento). */
  errores!: number;

  /** Detalle de los primeros 50 errores (fila, columna, mensaje). */
  detalleErrores!: { fila: number; columna?: string; mensaje: string }[];
}