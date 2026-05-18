import {
  IsInt,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UbicacionFalla, AccionFalla } from '../../../../common/enums';

/**
 * REQUEST DTO — Crear FallaSoldaduraInox.
 *
 * 🎯 El frontend envía el ID del cambiavía (no el código).
 * El cambiavía ya fue seleccionado en un dropdown que muestra
 * "CV-001 — Estación Central" pero internamente trabaja con IDs.
 *
 * El backend hace JOIN con cambiavías y resuelve automáticamente:
 *  - tramo
 *  - curvas (horizontal y vertical)
 *  - velocidad
 *  - vía, progresiva, norma, tipo
 *
 * Esto da:
 *  - Performance: cero queries extras de resolución
 *  - Consistencia: mismo patrón que falla riel
 *  - Seguridad: imposible crear fallas con cambiavías que no existen
 */
export class CrearFallaSoldaduraInoxDto {
  /** ID interno del cambiavía seleccionado en el dropdown del frontend. */
  @Type(() => Number)
  @IsInt({ message: 'El cambiavía debe ser un ID numérico' })
  @Min(1, { message: 'El ID del cambiavía debe ser mayor a 0' })
  cambiaviaId!: number;

  /** Fecha en formato YYYY-MM-DD. */
  @IsDateString({}, { message: 'La fecha debe estar en formato YYYY-MM-DD' })
  fechaDeteccion!: string;

  @IsEnum(UbicacionFalla, {
    message: `La ubicación debe ser una de: ${Object.values(UbicacionFalla).join(', ')}`,
  })
  ubicacionFalla!: UbicacionFalla;

  @IsEnum(AccionFalla, {
    message: `La acción debe ser una de: ${Object.values(AccionFalla).join(', ')}`,
  })
  accion!: AccionFalla;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  ensayo?: string;

  /** Código del ensayo (ej: PT-2024-001). Opcional. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  pt?: string;
}