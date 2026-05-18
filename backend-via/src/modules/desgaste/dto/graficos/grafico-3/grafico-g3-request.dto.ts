import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GraficoG3ConfigDto } from './grafico-g3-config.dto';

export class GraficoG3RequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GraficoG3ConfigDto)
  config?: GraficoG3ConfigDto;
}