import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscenarioMTB } from '../entities/escenario-mtb.entity';

@Injectable()
export class EscenariosMtbRepository {
  constructor(
    @InjectRepository(EscenarioMTB)
    private readonly repo: Repository<EscenarioMTB>,
  ) {}

  /**
   * Lista escenarios. Por default solo activos.
   * El admin puede pedir solo eliminados con `soloEliminados=true`.
   */
  async listar(filtros: {
    nombre?: string;
    soloEliminados?: boolean;
    page?: number;
    limit?: number;
  }): Promise<[EscenarioMTB[], number]> {
    const {
      nombre,
      soloEliminados = false,
      page = 1,
      limit = 20,
    } = filtros;

    const q = this.repo.createQueryBuilder('e');
    q.andWhere('e.eliminado = :el', { el: soloEliminados });

    if (nombre) {
      q.andWhere('e.nombre ILIKE :n', { n: `%${nombre}%` });
    }

    q.orderBy('e.nombre', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    return q.getManyAndCount();
  }

  async buscarPorId(id: number, incluirEliminados = false): Promise<EscenarioMTB | null> {
    const q = this.repo.createQueryBuilder('e').where('e.id = :id', { id });
    if (!incluirEliminados) q.andWhere('e.eliminado = false');
    return q.getOne();
  }

  /**
   * Busca por nombre EXACTO (sensible al case en BD por la constraint UNIQUE).
   * Útil para validar duplicados antes de crear/actualizar.
   * Incluye eliminados para evitar conflicto de UNIQUE si alguien
   * intenta crear con el mismo nombre que un eliminado.
   */
  async buscarPorNombre(nombre: string): Promise<EscenarioMTB | null> {
    return this.repo.findOne({ where: { nombre } });
  }

  async crear(datos: Partial<EscenarioMTB>): Promise<EscenarioMTB> {
    return this.repo.save(this.repo.create(datos));
  }

  async actualizar(
    escenario: EscenarioMTB,
    cambios: Partial<EscenarioMTB>,
  ): Promise<EscenarioMTB> {
    Object.assign(escenario, cambios);
    return this.repo.save(escenario);
  }

  /** Conteo de eliminados (para resumen de auditoría). */
  async contarEliminados(): Promise<number> {
    return this.repo.count({ where: { eliminado: true } });
  }
}