import {
  IsOptional,
  IsArray,
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { TipoValorTemperatura } from '../../../../../common/enums';

/**
 * Configuración del Gráfico G2 — Comparación entre tramos.
 *  - tramoIds: multi-select. undefined → default [2,3,5] / [] → todos / [...] → esos
 *  - fechaDesde / fechaHasta: rango libre
 *  - tipoValores: MIN / AVG / MAX
 */
export class GraficoG2TempConfigDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tramoIds?: number[];

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}