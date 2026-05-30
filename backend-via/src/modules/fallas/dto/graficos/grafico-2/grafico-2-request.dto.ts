// backend/src/modules/fallas/dto/graficos/grafico-2/grafico-2-request.dto.ts

import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Grafico2ConfigDto } from './grafico-2-config.dto';

export class Grafico2RequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => Grafico2ConfigDto)
  config?: Grafico2ConfigDto;
}