/**
 * ============================================================
 * TIPOS DE FALLA RIEL
 * ============================================================
 * Tipos TypeScript del dominio "Falla en el riel".
 *
 * Espejo de los DTOs del backend en:
 *   backend/src/modules/fallas/dto/falla-riel/
 *
 * Patrón "4 tipos por entidad":
 *   1. FallaRiel              → lo que recibimos del backend (response)
 *   2. CrearFallaRielDto      → lo que enviamos al crear
 *   3. ActualizarFallaRielDto → lo que enviamos al actualizar
 *   4. FiltrosFallaRiel       → lo que enviamos al listar
 * ============================================================
 */

import type { TipoVia, LadoRiel } from '@/lib/types/common';
import type {
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  AltaBaja,
  EstadoFalla,
  AccionRiel,
} from '@/lib/types/enums/fallas.enum';
import type { AccionRielResponse } from './accion-riel.types';

// ============================================================
// 1. RESPONSE — Falla riel que devuelve el backend
// ============================================================

/**
 * Falla detectada en el riel, tal como la devuelve el backend.
 *
 * Incluye:
 *  - Datos directos (los que ingresa el usuario)
 *  - Caracterización del defecto (FASE 2: enums opcionales)
 *  - Medidas del defecto (FASE 2: numéricos opcionales)
 *  - Estado desnormalizado (FASE 2: refleja la última acción)
 *  - Datos calculados automáticamente (tramo, curvas, velocidad)
 *  - Datos de archivos adjuntos
 *  - Acciones (opcional, solo viene en endpoint de detalle)
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

  // ----- FASE 2 — Caracterización del defecto -----
  // Estos campos SIEMPRE vienen con valor (default SIN_DEFINIR o NO_APLICA)
  tipoDefecto: TipoDefectoRiel;
  elementoAfectado: ElementoAfectadoRiel;
  zonaAfectada: ZonaAfectadaRiel;
  perfil: PerfilFallaRiel;
  altaBaja: AltaBaja;

  // ----- FASE 2 — Medidas del defecto (nullable: pueden no haberse medido) -----
  progresivaFinal: number | null;
  largo: number | null;
  ancho: number | null;
  profundidad: number | null;
  numeroFoto: number | null;
  tipoOnda: string | null;

  // ----- FASE 2 — Estado desnormalizado (refleja la última acción) -----
  estadoActual: EstadoFalla;
  accionActual: AccionRiel | null;
  ptActual: string | null;
  fechaEjecucionActual: string | null;

  // ----- Datos calculados por el backend (geografía) -----
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

  // ----- FASE 2 — Timeline de acciones (solo viene en GET /:id) -----
  // En el listado este campo NO viene (queda undefined).
  // En el detalle viene con el historial completo de acciones activas
  // ordenado cronológicamente ascendente.
  acciones?: AccionRielResponse[];
}

// ============================================================
// 2. CREAR — Lo que el frontend envía para crear una falla
// ============================================================

/**
 * Datos para crear una falla de riel.
 *
 * Obligatorios: progresiva, via, fecha, carril.
 * El backend calcula tramo, curvas y velocidad desde (progresiva, via).
 *
 * Los campos descriptivos de FASE 2 son TODOS opcionales. Si no
 * vienen, el backend aplica los defaults (SIN_DEFINIR, NO_APLICA).
 * Esto permite que el inspector registre fallas con datos parciales
 * en campo y complete después.
 *
 * Los archivos se suben en endpoints separados después de crear.
 * Los 4 campos de "estado actual" NO se envían: el backend siempre
 * los inicializa en NO_ATENDIDO con nulls.
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

  // ----- FASE 2 — Caracterización (opcionales, default SIN_DEFINIR) -----
  tipoDefecto?: TipoDefectoRiel;
  elementoAfectado?: ElementoAfectadoRiel;
  zonaAfectada?: ZonaAfectadaRiel;
  perfil?: PerfilFallaRiel;
  altaBaja?: AltaBaja;

  // ----- FASE 2 — Medidas (opcionales numéricas) -----
  progresivaFinal?: number;
  largo?: number;
  ancho?: number;
  profundidad?: number;
  numeroFoto?: number;
  tipoOnda?: string;
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
 *
 * Los 4 campos de "estado actual" no se aceptan aquí: se
 * modifican exclusivamente creando/editando acciones (otro
 * endpoint).
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
 * envía los IDs de los seleccionados.
 *
 * Nota: el backend de momento NO acepta filtros por enum nuevo
 * en el listado (eso fue decisión de F-1: gráficos sí, listado no).
 * Si en el futuro se quieren agregar, agregar aquí Y en el backend.
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