import { ModuloAuditoria, OperacionAuditoria } from '../../../common/enums';

/**
 * DTO interno: lo construyen los services de otros módulos
 * para registrar una operación en auditoría.
 *
 * NO se valida con class-validator porque no llega por HTTP,
 * lo construye el código del backend.
 */
export class RegistrarAuditoriaDto {
  modulo!: ModuloAuditoria;
  entidad!: string;
  entidadId!: string | null;
  operacion!: OperacionAuditoria;
  usuarioId!: string;
  usuarioNombre!: string;
  registrosAfectados?: number | null;
  detalle?: Record<string, any> | null;
}