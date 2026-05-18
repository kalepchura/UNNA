import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GraficoG2ConfigDto } from './grafico-g2-config.dto';

export class GraficoG2RequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GraficoG2ConfigDto)
  config?: GraficoG2ConfigDto;
}