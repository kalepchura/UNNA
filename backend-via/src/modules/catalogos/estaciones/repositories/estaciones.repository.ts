import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estacion } from '../entities/estacion.entity';
import { FiltrarEstacionesDto } from '../dto/filtrar-estaciones.dto';

@Injectable()
export class EstacionesRepository {
  constructor(
    @InjectRepository(Estacion)
    private readonly repo: Repository<Estacion>,
  ) {}

  async listarParaTabla(limit: number = 1000): Promise<Estacion[]> {
    return this.repo.find({
      relations: ['tramo'],  // ← Trae el tramo relacionado
      order: { orden: 'ASC' },
      take: limit,
    });
  }

  async listarParaSelector(): Promise<{ id: number; codigo: string; nombre: string }[]> {
    return this.repo.find({
      select: ['id', 'codigo', 'nombre'],
      order: { orden: 'ASC' },
    });
  }

  async buscarPorId(id: number): Promise<Estacion | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['tramo'],
    });
  }

  async buscarPorCodigo(codigo: string): Promise<Estacion | null> {
    return this.repo.findOne({ where: { codigo }, relations: ['tramo'] });
  }

  /** Lista resumida para dropdowns. */
  async listarParaFiltro() {
    return this.repo.createQueryBuilder('e')
      .select(['e.id', 'e.codigo', 'e.nombre'])
      .orderBy('e.orden', 'ASC')
      .getMany();
  }

  async crear(datos: Partial<Estacion>): Promise<Estacion> {
    return this.repo.save(this.repo.create(datos));
  }
  
  async listarTodas(): Promise<Estacion[]> {
    return this.repo.find({
      order: {
        orden: 'ASC',
      },
    });
  }
}