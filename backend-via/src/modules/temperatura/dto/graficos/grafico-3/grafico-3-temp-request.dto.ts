import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GraficoG3TempConfigDto } from './grafico-3-temp-config.dto';

export class GraficoG3TempRequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GraficoG3TempConfigDto)
  config?: GraficoG3TempConfigDto;
}