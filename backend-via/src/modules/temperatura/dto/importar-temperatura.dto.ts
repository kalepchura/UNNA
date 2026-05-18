import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * REQUEST DTO de la importación.
 *
 * Junto con esto va el archivo en multipart (campo "archivo").
 * El archivo se valida aparte con ParseFilePipe en el controller.
 */
export class ImportarTemperaturaDto {
  /**
   * Progresiva del sensor en metros.
   * Llega como string en multipart, @Type(() => Number) lo convierte.
   */
  @Type(() => Number)
  @IsInt({ message: 'La progresiva debe ser un número entero' })
  @Min(0, { message: 'La progresiva no puede ser negativa' })
  progresiva!: number;

  /** Observación opcional del especialista. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comentarioEspecialista?: string;
}