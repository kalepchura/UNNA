import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoArchivoTemperatura } from '../../../common/enums';

export class FiltrarImportacionesDto {
  /** IDs de tramo (frontend envía números directamente). */
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  tramoIds?: number[];

  @IsOptional()
  @IsEnum(TipoArchivoTemperatura)
  tipoArchivo?: TipoArchivoTemperatura;

  @IsOptional()
  @IsDateString()
  fechaSubidaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaSubidaHasta?: string;

  @IsOptional()
  @IsUUID()
  creadoPorId?: string;

  @IsOptional()
  @IsString()
  nombreArchivo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  registrosValidosMin?: number;

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