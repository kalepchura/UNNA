import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GraficoG1TempConfigDto } from './grafico-1-temp-config.dto';

export class GraficoG1TempRequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GraficoG1TempConfigDto)
  config?: GraficoG1TempConfigDto;
}