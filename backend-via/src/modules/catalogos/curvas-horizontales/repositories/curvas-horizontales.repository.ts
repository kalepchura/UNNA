import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurvaHorizontal } from '../entities/curva-horizontal.entity';
import { FiltrarCurvasHorizontalesDto } from '../dto/filtrar-curvas-horizontales.dto';
import { TipoVia } from '../../../../common/enums';

@Injectable()
export class CurvasHorizontalesRepository {
  constructor(
    @InjectRepository(CurvaHorizontal)
    private readonly repo: Repository<CurvaHorizontal>,
  ) {}

  async listarParaTabla(limit: number = 1000): Promise<CurvaHorizontal[]> {
    return this.repo.find({
      order: { inicioM: 'ASC' },
      take: limit,
    });
  }

  async listarParaSelector(): Promise<{ id: number; nombre: string; via: string }[]> {
    return this.repo.find({
      select: ['id', 'nombre', 'via'],
      order: { inicioM: 'ASC' },
    });
  }

  async buscarPorId(id: number): Promise<CurvaHorizontal | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Busca la curva horizontal que contiene una progresiva en una vía dada.
   * Lo usarán Fallas y Desgaste para georreferenciar.
   */
  async buscarPorProgresivaYVia(progresiva: number, via: string): Promise<CurvaHorizontal | null> {
    return this.repo.createQueryBuilder('c')
      .where('c.via = :v', { v: via })
      .andWhere('c.inicio_m <= :p', { p: progresiva })
      .andWhere('c.fin_m >= :p', { p: progresiva })
      .getOne();
  }

  async listarParaFiltro() {
    return this.repo.createQueryBuilder('c')
      .select(['c.id', 'c.nombre', 'c.via'])
      .orderBy('c.inicio_m', 'ASC')
      .getMany();
  }

  async crear(datos: Partial<CurvaHorizontal>): Promise<CurvaHorizontal> {
    return this.repo.save(this.repo.create(datos));
  }
}