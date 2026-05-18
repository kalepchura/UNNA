import { Injectable, Logger } from '@nestjs/common';
import { AuditoriaRepository } from '../repositories/auditoria.repository';
import { RegistrarAuditoriaDto } from '../dto/registrar-auditoria.dto';
import { FiltrarAuditoriaDto } from '../dto/filtrar-auditoria.dto';
import { AuditoriaResponseDto } from '../dto/auditoria-response.dto';

/**
 * ============================================================
 * AuditoriaService
 * ============================================================
 * Servicio compartido que cualquier módulo del sistema usa para
 * registrar operaciones.
 *
 * EXPORTADO globalmente (ver auditoria.module.ts → @Global)
 * para que cualquier service lo inyecte sin tener que importar
 * el módulo completo.
 * ============================================================
 */
@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(private readonly auditoriaRepo: AuditoriaRepository) {}

  // ----------------------------------------------------------
  // ESCRITURA (la usan otros módulos)
  // ----------------------------------------------------------

  /**
   * Inserta un registro en el log.
   *
   * IMPORTANTE: nunca debe lanzar excepción al consumidor.
   * Si la auditoría falla por algún motivo (ej: BD lenta),
   * NO queremos que reviente la operación principal del usuario.
   * Por eso atrapamos cualquier error y solo lo logueamos.
   */
  async registrar(dto: RegistrarAuditoriaDto): Promise<void> {
    try {
      await this.auditoriaRepo.insertar({
        modulo: dto.modulo,
        entidad: dto.entidad,
        entidadId: dto.entidadId,
        operacion: dto.operacion,
        usuarioId: dto.usuarioId,
        usuarioNombre: dto.usuarioNombre,
        registrosAfectados: dto.registrosAfectados ?? null,
        detalle: dto.detalle ?? null,
      });
    } catch (err) {
      // No relanzamos. Solo registramos en consola.
      this.logger.error(
        `Error al registrar auditoría: ${err instanceof Error ? err.message : err}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  // ----------------------------------------------------------
  // LECTURA (la usa el ADMIN desde la página de Auditoría)
  // ----------------------------------------------------------

  /**
   * Lista el log de auditoría con filtros y paginación.
   *
   * Si el cliente no manda fechaDesde/fechaHasta, default = últimos 30 días.
   */
  async listar(filtros: FiltrarAuditoriaDto) {
    // Calcular defaults de rango
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const [logs, total] = await this.auditoriaRepo.listar(
      filtros,
      hace30Dias,
      hoy,
    );

    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 50;

    return {
      data: logs.map((l) => AuditoriaResponseDto.fromEntity(l)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}