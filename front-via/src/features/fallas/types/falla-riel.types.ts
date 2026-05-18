/**
 * ============================================================
 * TIPOS DE FALLA RIEL
 * ============================================================
 * Tipos TypeScript del dominio "Falla en el riel".
 *
 * Espejo de los DTOs del backend en:
 *   backend/src/modules/fallas/dto/falla-riel/
 *
 * Patrón "3 tipos por entidad":
 *   1. FallaRiel              → lo que recibimos del backend (response)
 *   2. CrearFallaRielDto      → lo que enviamos al crear
 *   3. ActualizarFallaRielDto → lo que enviamos al actualizar
 *   4. FiltrosFallaRiel       → lo que enviamos al listar
 * ============================================================
 */

import type { TipoVia, LadoRiel } from '@/lib/types/common';

// ============================================================
// 1. RESPONSE — Falla riel que devuelve el backend
// ============================================================

/**
 * Falla detectada en el riel, tal como la devuelve el backend.
 *
 * Incluye datos directos (los que ingresa el usuario), datos
 * calculados automáticamente (tramo, curvas, velocidad) y
 * datos de archivos adjuntos.
 *
 * IMPORTANTE: las fechas vienen como string ISO (no Date),
 * porque viajan por JSON. Si necesitas un Date, conviértelo
 * con `new Date(falla.fecha)`.
 */
export interface FallaRiel {
  id: number;

  // ----- Datos directos del usuario -----
  progresiva: number;
  via: TipoVia;
  fecha: string;
  carril: LadoRiel;
  causa: string | null;
  origen: string | null;

  // ----- Datos calculados por el backend -----
  velocidadKmh: number | null;

  tramoId: number;
  tramoCodigo: string;
  tramoNombre: string;

  curvaHorizontalId: number | null;
  curvaHorizontalNombre: string | null;

  curvaVerticalId: number | null;
  curvaVerticalNombre: string | null;

  // ----- Archivos adjuntos (máx 1 interno + 1 externo) -----
  nombreInformeInterno: string | null;
  urlInformeInterno: string | null;   // ruta del storage (no URL pública)
  nombreInformeExterno: string | null;
  urlInformeExterno: string | null;

  // ----- Auditoría visible -----
  creadoEn: string;
  actualizadoEn: string;
  eliminado: boolean;
}

// ============================================================
// 2. CREAR — Lo que el frontend envía para crear una falla
// ============================================================

/**
 * Datos requeridos para crear una falla de riel.
 *
 * El usuario SOLO envía los datos directos. El backend
 * calcula automáticamente tramo, curvas y velocidad a partir
 * de (progresiva, via). Por eso esos campos NO se incluyen aquí.
 *
 * Los archivos se suben en endpoints separados después de crear.
 */
export interface CrearFallaRielDto {
  /** Progresiva en metros desde el origen. */
  progresiva: number;
  /** Vía (PAR/IMPAR/TERCERA/CERO). */
  via: TipoVia;
  /** Fecha de detección en formato YYYY-MM-DD. */
  fecha: string;
  /** Lado del riel afectado. */
  carril: LadoRiel;
  /** Causa libre. Opcional. Máx 2000 caracteres. */
  causa?: string;
  /** Origen o antecedente. Opcional. Máx 2000 caracteres. */
  origen?: string;
}

// ============================================================
// 3. ACTUALIZAR — Lo que el frontend envía para actualizar
// ============================================================

/**
 * Datos para actualizar una falla de riel.
 * TODOS los campos son opcionales (puedes cambiar solo uno).
 *
 * Si cambias `progresiva` o `via`, el backend recalcula
 * automáticamente tramo, curvas y velocidad.
 */
export type ActualizarFallaRielDto = Partial<CrearFallaRielDto>;

// ============================================================
// 4. FILTROS — Lo que el frontend envía al listar
// ============================================================

/**
 * Filtros para listar fallas de riel.
 *
 * IMPORTANTE: los filtros geográficos viajan como IDs (no códigos).
 * El frontend ya tiene los catálogos cargados con sus IDs y solo
 * envía los IDs de los seleccionados. Más rápido y consistente
 * con los gráficos.
 */
export interface FiltrosFallaRiel {
  /** IDs de tramos seleccionados en el dropdown. */
  tramoIds?: number[];
  /** IDs de curvas horizontales seleccionadas. */
  curvaHorizontalIds?: number[];
  /** IDs de curvas verticales seleccionadas. */
  curvaVerticalIds?: number[];

  via?: TipoVia;
  carril?: LadoRiel;

  /** Rango de fechas (formato YYYY-MM-DD). */
  fechaDesde?: string;
  fechaHasta?: string;

  /** Paginación. Defaults: page=1, limit=20. */
  page?: number;
  limit?: number;
}