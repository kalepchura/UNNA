/**
 * ============================================================
 * TIPOS DE ACCIÓN DE RIEL (Historial)
 * ============================================================
 * Tipos TypeScript del historial de intervenciones sobre una
 * FallaRiel.
 *
 * Espejo de los DTOs del backend en:
 *   backend/src/modules/fallas/dto/accion-riel/
 *
 * Cada falla puede tener N acciones a lo largo del tiempo
 * (esmerilado → reemplazo → recarga, etc.). La más reciente
 * define el "estado actual" desnormalizado en la falla padre.
 *
 * IMPORTANTE: los gráficos NO usan estos tipos. Solo la vista
 * de detalle (timeline) y los formularios de gestión.
 * ============================================================
 */

import type { AccionRiel, EstadoFalla } from '@/lib/types/enums/fallas.enum';

// ============================================================
// 1. RESPONSE — Acción que devuelve el backend
// ============================================================

export interface AccionRielResponse {
  id: number;
  fallaId: number;

  /** Tipo de intervención (Esmerilado, Reemplazo, etc.). */
  accion: AccionRiel;

  /** Código PT (orden de trabajo). Opcional. */
  pt: string | null;

  /** Fecha de ejecución en ISO. Puede ser null al programar sin fecha. */
  fechaEjecucion: string | null;

  /** Estado/conclusión de la acción. */
  conclusion: EstadoFalla;

  /** Observaciones libres del técnico. */
  observaciones: string | null;

  // ----- Auditoría visible -----
  creadoEn: string;
  actualizadoEn: string;
  eliminado: boolean;
}

// ============================================================
// 2. CREAR — Datos para crear una nueva acción
// ============================================================

/**
 * Datos para crear una acción sobre una falla riel.
 *
 * El fallaId NO se envía en el body, viaja en la URL:
 *   POST /fallas/riel/:fallaId/acciones
 *
 * accion y conclusion son obligatorios. pt y fechaEjecucion
 * pueden venir null si aún no se asignó el código o no hay
 * fecha definitiva.
 */
export interface CrearAccionRielDto {
  accion: AccionRiel;
  pt?: string;
  /** Fecha en formato YYYY-MM-DD. */
  fechaEjecucion?: string;
  conclusion: EstadoFalla;
  observaciones?: string;
}

// ============================================================
// 3. ACTUALIZAR — Datos para actualizar una acción existente
// ============================================================

/**
 * Datos para actualizar una acción.
 * TODOS los campos son opcionales.
 *
 * Casos típicos:
 *  - Cambiar conclusion=PROGRAMADO → RESUELTO cuando se ejecutó
 *  - Asignar el PT cuando se conozca
 *  - Corregir fechaEjecucion si se postergó
 *  - Agregar observaciones de cierre
 *
 * NOTA: el fallaId NO se puede cambiar (las acciones están
 * atadas a su falla padre).
 */
export type ActualizarAccionRielDto = Partial<CrearAccionRielDto>;