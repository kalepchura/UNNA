import {
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ANIO_MINIMO } from '../../../../common/constants/desgaste.constants';

export class CargarGrillaDto {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(ANIO_MINIMO, { each: true })
  @Max(2100, { each: true })
  anios?: number[];

  /** IDs de tramo (frontend envía números directamente). */
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  tramoIds?: number[];
}