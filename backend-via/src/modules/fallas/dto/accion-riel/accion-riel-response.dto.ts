import { FallaRielAccion } from '../../entities/falla-riel-accion.entity';
import { AccionRiel, EstadoFalla } from '../../../../common/enums';

/**
 * RESPONSE DTO — FallaRielAccion plana.
 *
 * Se usa en:
 *  - GET /fallas/riel/:id/acciones        → lista de acciones de una falla
 *  - POST/PATCH /fallas/riel/:id/acciones → resultado de crear/editar
 *
 * No incluye la falla padre porque ya estás en el contexto de esa falla
 * (el frontend la tiene cargada).
 */
export class AccionRielResponseDto {
  id!: number;
  fallaId!: number;

  accion!: AccionRiel;
  pt!: string | null;
  fechaEjecucion!: Date | null;
  conclusion!: EstadoFalla;
  observaciones!: string | null;

  // Auditoría visible (útil para timeline)
  creadoEn!: Date;
  actualizadoEn!: Date;
  eliminado!: boolean;

  static fromEntity(a: FallaRielAccion): AccionRielResponseDto {
    const dto = new AccionRielResponseDto();
    dto.id = a.id;
    dto.fallaId = a.fallaId;
    dto.accion = a.accion;
    dto.pt = a.pt;
    dto.fechaEjecucion = a.fechaEjecucion;
    dto.conclusion = a.conclusion;
    dto.observaciones = a.observaciones;
    dto.creadoEn = a.creadoEn;
    dto.actualizadoEn = a.actualizadoEn;
    dto.eliminado = a.eliminado;
    return dto;
  }
}