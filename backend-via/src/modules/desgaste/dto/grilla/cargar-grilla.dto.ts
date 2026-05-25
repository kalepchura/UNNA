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
  @IsInt()
  @Min(1)
  escenarioId!: number;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(ANIO_MINIMO, { each: true })
  @Max(2100, { each: true })
  anios?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  tramoIds?: number[];
}