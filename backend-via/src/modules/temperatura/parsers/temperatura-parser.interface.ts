import { Temperatura } from '../entities/temperatura.entity';

/**
 * ============================================================
 * Resultado del parseo de un archivo de temperatura.
 * ============================================================
 * Equivalente a `ResultadoImportacion` de tu código Java.
 *
 * El service de importación toma este resultado y:
 *  1. Persiste `validos` en la tabla `temperaturas`
 *  2. Cuenta `errores.length` como registros_invalidos
 *  3. `totalFilas` se guarda como total_registros
 * ============================================================
 */
export interface ResultadoParseoTemperatura {
  /**
   * Filas que pasaron todas las validaciones.
   * Se construyen con `importacion` ya asignada (FK).
   * NO tienen `id` (se genera al persistir).
   */
  validos: Array<Partial<Temperatura>>;

  /**
   * Mensajes de error de filas que fallaron.
   * Formato: "Fila N: <razón>".
   */
  errores: string[];

  /**
   * Total de filas DETECTADAS (después de saltar líneas vacías
   * y encabezados). Es válidos.length + errores.length.
   */
  totalFilas: number;
}

/**
 * ============================================================
 * Interfaz que TODO parser de temperatura debe implementar.
 * ============================================================
 * Strategy Pattern: el `TemperaturaImportacionService` recibe
 * la implementación correcta según la extensión del archivo
 * (CSV / Excel / XML), sin saber los detalles internos de cada
 * parseo.
 *
 * Equivalente a `TemperaturaParser` de tu código Java.
 * ============================================================
 */
export interface TemperaturaParser {
  /**
   * Procesa el contenido del archivo y devuelve filas válidas
   * + errores.
   *
   * @param buffer        Contenido del archivo en bytes (Buffer de Node).
   * @param importacionId ID de la cabecera (para asignar a cada Temperatura).
   *
   * Lanza Error si el archivo no se puede procesar de forma
   * estructural (ej: encabezados ausentes en CSV). Para errores
   * de fila individual, se acumulan en `errores` sin lanzar.
   */
  parsear(
    buffer: Buffer,
    importacionId: number,
  ): Promise<ResultadoParseoTemperatura>;
}