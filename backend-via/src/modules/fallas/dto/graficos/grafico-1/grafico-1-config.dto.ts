// backend/src/modules/fallas/dto/graficos/grafico-1/grafico-1-config.dto.ts

import {
  IsEnum, IsInt, IsOptional, Min, Max, IsArray, ArrayNotEmpty,
} from 'class-validator';
import { GranularidadTemporal, TipoFallaFiltro } from '../../../../../common/enums';
import {
  NivelAnalisis, TipoViaFiltroFallas,
} from '../../../enums/fallas-graficos.enums';

/**
 * ============================================================
 * G1 — Evolución temporal (líneas)
 * ============================================================
 * Eje X: tiempo (meses o años).
 * Eje Y: cantidad de fallas.
 * Cada línea: un elemento del nivel elegido.
 *
 * SIN avanzados (los enums de caracterización no aplican a G1).
 * SIN default: si falta algo, gráfico vacío con mensaje.
 * ============================================================
 */
export class Grafico1ConfigDto {
  // ── Temporal ───────────────────────────────────────────
  @IsEnum(GranularidadTemporal)
  granularidad!: GranularidadTemporal;

  /** Año único (cuando granularidad = MENSUAL). */
  @IsOptional()
  @IsInt() @Min(2012) @Max(2100)
  anio?: number;

  /** Año inicio (cuando granularidad = ANUAL). */
  @IsOptional()
  @IsInt() @Min(2012) @Max(2100)
  anioInicio?: number;

  /** Año fin (cuando granularidad = ANUAL). */
  @IsOptional()
  @IsInt() @Min(2012) @Max(2100)
  anioFin?: number;

  // ── Filtros principales ────────────────────────────────
  @IsEnum(TipoViaFiltroFallas)
  tipoVia!: TipoViaFiltroFallas;

  @IsEnum(NivelAnalisis)
  nivel!: NivelAnalisis;

  /**
   * Tipo de falla (acotador opcional dentro del nivel).
   * Ignorado cuando nivel = CAMBIAVIA (se fuerza SOLDADURA).
   */
  @IsOptional()
  @IsEnum(TipoFallaFiltro)
  tipoFalla?: TipoFallaFiltro;

  /**
   * IDs de los elementos del NIVEL elegido.
   *  - nivel=TRAMO     → ids de tramos
   *  - nivel=CURVA_H   → ids de curvas horizontales
   *  - nivel=CURVA_V   → ids de curvas verticales
   *  - nivel=CAMBIAVIA → ids de cambiavías
   *
   * Debe tener al menos 1 elemento. Vacío = no se grafica nada.
   */
  @IsArray() @ArrayNotEmpty()
  @IsInt({ each: true })
  elementoIds!: number[];
}