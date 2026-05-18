import {
  IsArray, IsEnum, IsInt, IsOptional, Min,
} from 'class-validator';
import {
  TipoAgrupacionDesgaste,
  TipoViaFiltro,
  PuntoW,
} from '../../../../../common/enums';

export class GraficoG1ConfigDto {
  @IsOptional()
  @IsEnum(TipoAgrupacionDesgaste)
  tipoAgrupacion?: TipoAgrupacionDesgaste;

  @IsOptional()
  @IsInt()
  @Min(1)
  tramoId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  curvaHorizontalId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  curvaVerticalId?: number;

  @IsOptional()
  @IsEnum(TipoViaFiltro)
  via?: TipoViaFiltro;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  elementoCodigos?: number[];

  @IsOptional()
  @IsArray()
  @IsEnum(PuntoW, { each: true })
  puntosW?: PuntoW[];
}