import { PartialType } from '@nestjs/mapped-types';
import { CrearEscenarioMtbDto } from './crear-escenario-mtb.dto';

/**
 * REQUEST DTO para actualizar.
 * Todos los campos opcionales.
 */
export class ActualizarEscenarioMtbDto extends PartialType(CrearEscenarioMtbDto) {}