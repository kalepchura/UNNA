import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurvaVertical } from '../entities/curva-vertical.entity';
import { FiltrarCurvasVerticalesDto } from '../dto/filtrar-curvas-verticales.dto';
import { TipoVia } from '../../../../common/enums';

@Injectable()
export class CurvasVerticalesRepository {
  constructor(
    @InjectRepository(CurvaVertical)
    private readonly repo: Repository<CurvaVertical>,
  ) {}

  async listarParaTabla(limit: number = 1000): Promise<CurvaVertical[]> {
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

  async buscarPorId(id: number): Promise<CurvaVertical | null> {
    return this.repo.findOne({ where: { id } });
  }

  async buscarPorProgresivaYVia(progresiva: number, via: TipoVia): Promise<CurvaVertical | null> {
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

  async crear(datos: Partial<CurvaVertical>) {
    return this.repo.save(this.repo.create(datos));
  }
}