import {
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TipoVia,
  UbicacionFalla,
  AccionFalla,
} from '../../../../common/enums';

/**
 * REQUEST DTO — Filtros para listar FallaSoldaduraInox.
 *
 * 🎯 El frontend envía IDs directamente desde sus selectores
 * (dropdowns ya cargados con los catálogos). No se hace
 * traducción de códigos en el backend.
 *
 * Esto da:
 *  - Performance: cero queries extras de resolución
 *  - Consistencia: mismo patrón que falla riel y gráficos
 *  - Seguridad: imposible filtrar por IDs que no existen
 *
 * Los filtros geográficos (tramoIds, via) se aplican vía JOIN
 * con la tabla cambiavias, ya que FallaSoldaduraInox no tiene
 * estos campos propios.
 */
export class FiltrarFallasSoldaduraInoxDto {
  /**
   * IDs de cambiavías seleccionados en el dropdown del frontend.
   * Ej: [1, 5, 12]
   */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  cambiaviaIds?: number[];

  /**
   * IDs de tramos seleccionados.
   * Se aplica vía JOIN: cambiavia.tramo_id IN (...).
   */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  tramoIds?: number[];

  /** Vía (PAR/IMPAR/...) — se aplica sobre cambiavía. */
  @IsOptional()
  @IsEnum(TipoVia)
  via?: TipoVia;

  @IsOptional()
  @IsEnum(UbicacionFalla)
  ubicacionFalla?: UbicacionFalla;

  /** Multi-select de acciones. */
  @IsOptional()
  @IsArray()
  @IsEnum(AccionFalla, { each: true })
  acciones?: AccionFalla[];

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