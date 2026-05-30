// backend/src/modules/fallas/dto/graficos/grafico-3/grafico-3-config.dto.ts

import {
  IsEnum, IsOptional, IsBoolean, IsDateString, IsArray, IsInt, ArrayNotEmpty,
} from 'class-validator';
import { TipoFallaFiltro } from '../../../../../common/enums';
import {
  NivelAnalisis, TipoViaFiltroFallas,
} from '../../../enums/fallas-graficos.enums';

/**
 * ============================================================
 * G3 — Fallas por velocidad (barras)
 * ============================================================
 * Eje X: velocidades del catálogo (ascendente).
 * Eje Y: cantidad.
 *
 * Total único repartido por velocidad. La regla "un nivel a la
 * vez" garantiza que no haya duplicación.
 *
 * SIN avanzados.
 * ============================================================
 */
export class Grafico3ConfigDto {
  // ── Temporal ───────────────────────────────────────────
  @IsDateString()
  fechaDesde!: string;

  @IsDateString()
  fechaHasta!: string;

  // ── Filtros principales ────────────────────────────────
  @IsEnum(TipoViaFiltroFallas)
  tipoVia!: TipoViaFiltroFallas;

  @IsEnum(NivelAnalisis)
  nivel!: NivelAnalisis;

  @IsOptional()
  @IsEnum(TipoFallaFiltro)
  tipoFalla?: TipoFallaFiltro;

  @IsArray() @ArrayNotEmpty()
  @IsInt({ each: true })
  elementoIds!: number[];

  /**
   * Si true → 2 series apiladas: "Riel" y "Soldadura".
   * Si false (o no viene) → 1 sola serie "Total".
   *
   * Solo tiene efecto cuando tipoFalla = AMBAS o no se envía.
   * Si tipoFalla = RIEL/SOLDADURA, se ignora (no hay nada que apilar).
   */
  @IsOptional()
  @IsBoolean()
  apilarPorTipo?: boolean;
}