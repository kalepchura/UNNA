import { IsOptional, IsInt, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Filtros para paginar las filas individuales de una importación.
 * Se usa en GET /temperatura/importaciones/:id/registros.
 */
export class FiltrarTemperaturasDto {
  /** Filtro por rango de fechas dentro de la importación. */
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  /** Solo registros con temperatura ≥ este valor. */
  @IsOptional()
  @Type(() => Number)
  temperaturaMin?: number;

  /** Solo registros con temperatura ≤ este valor. */
  @IsOptional()
  @Type(() => Number)
  temperaturaMax?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  /**
   * Default 100 filas por página. Una importación puede tener miles,
   * así que paginamos generoso pero acotado.
   */
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500)
  limit?: number = 100;
}