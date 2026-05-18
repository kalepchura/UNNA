/**
 * Tipos del dominio "Falla en soldadura inox".
 * Espejo de backend/src/modules/fallas/dto/falla-soldadura-inox/
 */

import type {
  TipoVia,
  UbicacionFalla,
  AccionFalla,
  TipoCambiavia,
  NormaCambiavia,
} from '@/lib/types/common';
import type { ImagenFalla } from './imagen-falla.types';

// ============================================================
// RESPONSE — Falla soldadura que devuelve el backend
// ============================================================

/**
 * El cambiavía viene APLANADO en el response: no hay que navegar
 * falla.cambiavia.tramo.codigo, todo está al primer nivel.
 */
export interface FallaSoldaduraInox {
  id: number;

  // Datos propios
  fechaDeteccion: string;
  ubicacionFalla: UbicacionFalla;
  accion: AccionFalla;
  observacion: string | null;
  ensayo: string | null;
  pt: string | null;

  // Datos heredados del cambiavía (aplanados)
  cambiaviaId: number;
  cambiaviaCodigoBd: string;
  cambiaviaDescripcion: string | null;
  cambiaviaTipo: TipoCambiavia;
  cambiaviaNorma: NormaCambiavia;

  progresiva: number;
  via: TipoVia;
  velocidadKmh: number;

  tramoId: number;
  tramoCodigo: string;
  tramoNombre: string;

  curvaHorizontalId: number | null;
  curvaVerticalId: number | null;

  // Imágenes asociadas (opcional, se cargan por separado)
  imagenes?: ImagenFalla[];

  // Auditoría visible
  creadoEn: string;
  actualizadoEn: string;
  eliminado: boolean;
}

// ============================================================
// CREAR — Frontend envía cambiaviaId (no código)
// ============================================================

export interface CrearFallaSoldaduraDto {
  /** ID del cambiavía seleccionado en el dropdown. */
  cambiaviaId: number;
  /** Fecha en formato YYYY-MM-DD. */
  fechaDeteccion: string;
  ubicacionFalla: UbicacionFalla;
  accion: AccionFalla;
  observacion?: string;
  ensayo?: string;
  pt?: string;
}

// ============================================================
// ACTUALIZAR — Todos opcionales
// ============================================================

export type ActualizarFallaSoldaduraDto = Partial<CrearFallaSoldaduraDto>;

// ============================================================
// FILTROS — Por IDs (no códigos), consistente con riel
// ============================================================

export interface FiltrosFallaSoldadura {
  cambiaviaIds?: number[];
  tramoIds?: number[];

  via?: TipoVia;
  ubicacionFalla?: UbicacionFalla;
  /** Multi-select de acciones. */
  acciones?: AccionFalla[];

  fechaDesde?: string;
  fechaHasta?: string;

  page?: number;
  limit?: number;
}