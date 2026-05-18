
import { IsOptional, IsEnum, IsDateString, IsArray, IsInt } from 'class-validator';
import {
  TipoFallaFiltro,
  TipoViaFiltro,
  CategoriaG2,
} from '../../../../../common/enums';

export class Grafico2ConfigDto {
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
  @IsEnum(CategoriaG2)
  categoria?: CategoriaG2;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tramoIds?: number[];
}