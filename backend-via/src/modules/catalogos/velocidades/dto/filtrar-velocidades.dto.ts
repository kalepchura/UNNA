import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltrarVelocidadesDto {
  /** Filtra rangos cuya velocidad sea exactamente este valor. */
  @IsOptional() @Type(() => Number) @IsInt()
  velocidadKmh?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20;
}