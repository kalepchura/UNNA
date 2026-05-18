import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoVia, LadoRiel } from '../../../../common/enums';

/**
 * REQUEST DTO — Filtros para listar FallaRiel.
 *
 * 🎯 El frontend envía IDs directamente desde sus selectores
 * (dropdowns ya cargados con los catálogos). No se hace
 * traducción de strings en el backend.
 *
 * Esto da:
 *  - Performance: cero queries extras de resolución
 *  - Consistencia: mismo patrón que los gráficos
 *  - Seguridad: imposible filtrar por IDs que no existen
 */
export class FiltrarFallasRielDto {
  /**
   * IDs de tramos seleccionados en el dropdown del frontend.
   * Ej: [1, 2, 5]
   */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  tramoIds?: number[];

  /**
   * IDs de curvas horizontales seleccionadas.
   */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  curvaHorizontalIds?: number[];

  /**
   * IDs de curvas verticales seleccionadas.
   */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  curvaVerticalIds?: number[];

  @IsOptional()
  @IsEnum(TipoVia)
  via?: TipoVia;

  @IsOptional()
  @IsEnum(LadoRiel)
  carril?: LadoRiel;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  // Paginación
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}