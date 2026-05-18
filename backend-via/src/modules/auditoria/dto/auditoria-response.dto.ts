import { AuditoriaLog } from '../entities/auditoria-log.entity';
import {
  ModuloAuditoria,
  OperacionAuditoria,
} from '../../../common/enums';

export class AuditoriaResponseDto {
  id!: string;
  modulo!: ModuloAuditoria;
  entidad!: string;
  entidadId!: string | null;
  operacion!: OperacionAuditoria;
  usuarioId!: string;
  usuarioNombre!: string;
  registrosAfectados!: number | null;
  detalle!: Record<string, any> | null;
  fecha!: Date;

  static fromEntity(a: AuditoriaLog): AuditoriaResponseDto {
    const dto = new AuditoriaResponseDto();
    Object.assign(dto, a);
    return dto;
  }
}