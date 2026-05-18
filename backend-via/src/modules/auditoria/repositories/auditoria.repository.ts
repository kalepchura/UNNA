import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaLog } from '../entities/auditoria-log.entity';
import { FiltrarAuditoriaDto } from '../dto/filtrar-auditoria.dto';

@Injectable()
export class AuditoriaRepository {
  constructor(
    @InjectRepository(AuditoriaLog)
    private readonly repo: Repository<AuditoriaLog>,
  ) {}

  /** Inserta un nuevo registro en el log. No retorna nada útil. */
  async insertar(datos: Partial<AuditoriaLog>): Promise<void> {
    await this.repo.save(this.repo.create(datos));
  }

  /**
   * Lista entradas del log con filtros y paginación.
   * Devuelve [registros, total].
   */
  async listar(
    filtros: FiltrarAuditoriaDto,
    fechaDesdeDefault: Date,
    fechaHastaDefault: Date,
  ): Promise<[AuditoriaLog[], number]> {
    const {
      modulo, operacion, usuarioId,
      fechaDesde, fechaHasta, detalleTexto,
      page = 1, limit = 50,
    } = filtros;

    const q = this.repo.createQueryBuilder('a');

    // Rango de fechas con defaults
    const desde = fechaDesde ? new Date(fechaDesde) : fechaDesdeDefault;
    const hasta = fechaHasta ? new Date(fechaHasta) : fechaHastaDefault;
    // Para que "hasta" incluya el día completo, llevamos al final del día
    hasta.setHours(23, 59, 59, 999);

    q.andWhere('a.fecha BETWEEN :desde AND :hasta', { desde, hasta });

    if (modulo) q.andWhere('a.modulo = :m', { m: modulo });
    if (operacion && operacion.length > 0) {
      q.andWhere('a.operacion IN (:...ops)', { ops: operacion });
    }
    if (usuarioId) q.andWhere('a.usuario_id = :u', { u: usuarioId });

    // Búsqueda dentro del JSONB `detalle`.
    // ::text castea el JSONB a texto y luego hacemos ILIKE.
    if (detalleTexto) {
      q.andWhere('a.detalle::text ILIKE :dt', { dt: `%${detalleTexto}%` });
    }

    q.orderBy('a.fecha', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return q.getManyAndCount();
  }
}