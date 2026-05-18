import { AuditoriaService } from '../services/auditoria.service';
import {
  ModuloAuditoria,
  OperacionAuditoria,
} from '../../../common/enums';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

/**
 * Helper que simplifica el registro de auditoría en otros services.
 *
 * Ejemplo de uso desde FallasService:
 *
 *   await registrarAuditoria(this.auditoriaService, {
 *     modulo: ModuloAuditoria.FALLAS,
 *     entidad: 'FallaRiel',
 *     entidadId: String(fallaCreada.id),
 *     operacion: OperacionAuditoria.CREATE,
 *     user,
 *     detalle: { progresiva: dto.progresiva, via: dto.via },
 *   });
 */
export interface RegistrarAuditoriaParams {
  modulo: ModuloAuditoria;
  entidad: string;
  entidadId: string | null;
  operacion: OperacionAuditoria;
  user: AuthenticatedUser;
  registrosAfectados?: number;
  detalle?: Record<string, any>;
}

export async function registrarAuditoria(
  auditoriaService: AuditoriaService,
  params: RegistrarAuditoriaParams,
): Promise<void> {
  await auditoriaService.registrar({
    modulo: params.modulo,
    entidad: params.entidad,
    entidadId: params.entidadId,
    operacion: params.operacion,
    usuarioId: params.user.id,
    usuarioNombre: params.user.nombre,
    registrosAfectados: params.registrosAfectados ?? null,
    detalle: params.detalle ?? null,
  });
}