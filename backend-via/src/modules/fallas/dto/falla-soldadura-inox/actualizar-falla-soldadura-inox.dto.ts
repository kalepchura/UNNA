import { PartialType } from '@nestjs/mapped-types';
import { CrearFallaSoldaduraInoxDto } from './crear-falla-soldadura-inox.dto';

/**
 * REQUEST DTO — Actualizar FallaSoldaduraInox.
 * Todos los campos opcionales. Si cambia cambiaviaCodigoBd,
 * el contexto geográfico se actualiza automáticamente (vía FK).
 */
export class ActualizarFallaSoldaduraInoxDto extends PartialType(
  CrearFallaSoldaduraInoxDto,
) {}