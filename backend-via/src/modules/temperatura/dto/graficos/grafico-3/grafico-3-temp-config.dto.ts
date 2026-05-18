import { IsOptional, IsArray, IsInt, IsDateString } from 'class-validator';

export class GraficoG3TempConfigDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tramoIds?: number[];

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}