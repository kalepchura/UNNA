import { IsArray, IsOptional, IsInt, Min } from 'class-validator';

export class GraficoG2ConfigDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  escenarioIds?: number[];
}