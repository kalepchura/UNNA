import { IsOptional, IsEnum, IsBoolean, IsDateString, IsArray, IsInt } from 'class-validator';
import {
  TipoFallaFiltro,
  TipoViaFiltro,
} from '../../../../../common/enums';

export class Grafico3ConfigDto {
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsEnum(TipoFallaFiltro)
  tipoFalla?: TipoFallaFiltro;

  @IsOptional()
  @IsEnum(TipoViaFiltro)
  tipoVia?: TipoViaFiltro;

  @IsOptional()
  @IsBoolean()
  apilarPorTipo?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tramoIds?: number[];
}