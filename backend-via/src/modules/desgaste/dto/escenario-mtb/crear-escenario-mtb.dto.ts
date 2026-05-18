import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * REQUEST DTO para crear un escenario MTB.
 *
 * NOTA: el escenario REAL se siembra al inicio del proyecto.
 * Aquí los usuarios crean SOLO escenarios de proyección.
 */
export class CrearEscenarioMtbDto {
  /**
   * Nombre único del escenario.
   * Trim automático para evitar duplicados por espacios.
   *
   * Ej: "Escenario 1 - INCR 13.108%"
   */
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? null : value,
  )
  descripcion?: string | null;
}