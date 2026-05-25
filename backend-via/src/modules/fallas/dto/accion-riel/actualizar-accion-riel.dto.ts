import { PartialType } from '@nestjs/mapped-types';
import { CrearAccionRielDto } from './crear-accion-riel.dto';

/**
 * REQUEST DTO — Actualizar FallaRielAccion.
 *
 * Todos los campos son opcionales (PartialType). Permite, por ejemplo:
 *  - Cambiar conclusion=PROGRAMADO → RESUELTO cuando se ejecutó
 *  - Asignar el PT cuando se conozca
 *  - Corregir la fechaEjecucion si se postergó
 *  - Agregar observaciones de cierre
 *
 * Nota: el fallaId NO se puede cambiar (las acciones están atadas a su falla).
 */
export class ActualizarAccionRielDto extends PartialType(CrearAccionRielDto) {}