import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GraficoG1ConfigDto } from './grafico-g1-config.dto';

export class GraficoG1RequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GraficoG1ConfigDto)
  config?: GraficoG1ConfigDto;
}