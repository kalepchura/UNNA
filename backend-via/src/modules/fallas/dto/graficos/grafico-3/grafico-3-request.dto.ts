// backend/src/modules/fallas/dto/graficos/grafico-3/grafico-3-request.dto.ts

import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Grafico3ConfigDto } from './grafico-3-config.dto';

export class Grafico3RequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => Grafico3ConfigDto)
  config?: Grafico3ConfigDto;
}