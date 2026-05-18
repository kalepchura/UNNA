import { PartialType } from '@nestjs/mapped-types';
import { CrearFallaRielDto } from './crear-falla-riel.dto';

/**
 * REQUEST DTO — Actualizar FallaRiel.
 * Todos los campos son opcionales (PartialType).
 *
 * Si se actualiza progresiva o via, el backend recalcula
 * tramo/curvas/velocidad automáticamente.
 */
export class ActualizarFallaRielDto extends PartialType(CrearFallaRielDto) {}