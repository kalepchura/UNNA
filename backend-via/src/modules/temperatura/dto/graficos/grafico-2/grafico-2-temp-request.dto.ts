import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GraficoG2TempConfigDto } from './grafico-2-temp-config.dto';

export class GraficoG2TempRequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GraficoG2TempConfigDto)
  config?: GraficoG2TempConfigDto;
}