
import { IsEnum, IsInt, IsOptional, Min, Max, IsArray } from 'class-validator';
import {
  GranularidadTemporal,
  TipoFallaFiltro,
  TipoViaFiltro,
} from '../../../../../common/enums';

export class Grafico1ConfigDto {
  @IsOptional()
  @IsEnum(GranularidadTemporal)
  granularidad?: GranularidadTemporal;

  @IsOptional()
  @IsInt()
  @Min(2012)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsInt()
  @Min(2012)
  @Max(2100)
  anioInicio?: number;

  @IsOptional()
  @IsInt()
  @Min(2012)
  @Max(2100)
  anioFin?: number;

  @IsOptional()
  @IsEnum(TipoFallaFiltro)
  tipoFalla?: TipoFallaFiltro;

  @IsOptional()
  @IsEnum(TipoViaFiltro)
  tipoVia?: TipoViaFiltro;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tramoIds?: number[];
}