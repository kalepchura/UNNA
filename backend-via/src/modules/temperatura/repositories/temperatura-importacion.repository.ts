import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TemperaturaImportacion } from '../entities/temperatura-importacion.entity';

@Injectable()
export class TemperaturaImportacionRepository {
  constructor(
    @InjectRepository(TemperaturaImportacion)
    private readonly repo: Repository<TemperaturaImportacion>,
  ) {}

  async crearEnTransaccion(
    manager: EntityManager,
    datos: Partial<TemperaturaImportacion>,
  ): Promise<TemperaturaImportacion> {
    const entity = manager.create(TemperaturaImportacion, datos);
    return manager.save(entity);
  }

  async actualizarTotalesEnTransaccion(
    manager: EntityManager,
    importacionId: number,
    totales: {
      totalRegistros: number;
      registrosValidos: number;
      registrosInvalidos: number;
    },
  ): Promise<void> {
    await manager.update(TemperaturaImportacion, importacionId, totales);
  }

  async buscarPorIdConTramo(id: number): Promise<TemperaturaImportacion | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['tramo'],
    });
  }

  async listar(filtros: {
    tramoIds?: number[];
    tipoArchivo?: string;
    fechaSubidaDesde?: string;
    fechaSubidaHasta?: string;
    creadoPorId?: string;
    nombreArchivo?: string;
    registrosValidosMin?: number;
    soloEliminados?: boolean;
    page?: number;
    limit?: number;
  }): Promise<[TemperaturaImportacion[], number]> {
    const {
      tramoIds, tipoArchivo, fechaSubidaDesde, fechaSubidaHasta,
      creadoPorId, nombreArchivo, registrosValidosMin,
      soloEliminados = false,
      page = 1, limit = 20,
    } = filtros;

    const q = this.repo
      .createQueryBuilder('imp')
      .leftJoinAndSelect('imp.tramo', 'tramo');

    // ✅ Usar nombre de propiedad TypeScript, no snake_case de columna
    q.andWhere('imp.eliminado = :el', { el: soloEliminados });

    if (tramoIds?.length)
      q.andWhere('imp.tramoId IN (:...t)', { t: tramoIds });

    if (tipoArchivo)
      q.andWhere('imp.tipoArchivo = :ta', { ta: tipoArchivo });

    if (fechaSubidaDesde)
      q.andWhere('imp.fechaSubida >= :fd', { fd: fechaSubidaDesde });

    if (fechaSubidaHasta) {
      const fechaFin = new Date(fechaSubidaHasta);
      fechaFin.setDate(fechaFin.getDate() + 1);
      q.andWhere('imp.fechaSubida < :fh', { fh: fechaFin });
    }

    if (creadoPorId)
      q.andWhere('imp.creadoPor = :cp', { cp: creadoPorId });

    if (nombreArchivo)
      q.andWhere('imp.nombreArchivo ILIKE :n', { n: `%${nombreArchivo}%` });

    if (registrosValidosMin !== undefined)
      q.andWhere('imp.registrosValidos >= :rvm', { rvm: registrosValidosMin });

    q.orderBy('imp.fechaSubida', 'DESC')
      .addOrderBy('imp.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return q.getManyAndCount();
  }

  async buscarPorId(
    id: number,
    incluirEliminadas = false,
  ): Promise<TemperaturaImportacion | null> {
    const q = this.repo
      .createQueryBuilder('imp')
      .leftJoinAndSelect('imp.tramo', 'tramo')
      .where('imp.id = :id', { id });

    if (!incluirEliminadas) {
      q.andWhere('imp.eliminado = false');
    }

    return q.getOne();
  }

  async actualizar(
    importacion: TemperaturaImportacion,
    cambios: Partial<TemperaturaImportacion>,
  ): Promise<TemperaturaImportacion> {
    Object.assign(importacion, cambios);
    return this.repo.save(importacion);
  }

  async contarEliminadas(): Promise<number> {
    return this.repo.count({ where: { eliminado: true } });
  }
}