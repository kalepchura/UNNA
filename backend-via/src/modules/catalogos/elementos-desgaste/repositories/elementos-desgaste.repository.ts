import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElementoDesgaste } from '../entities/elemento-desgaste.entity';
import { FiltrarElementosDesgasteDto } from '../dto/filtrar-elementos-desgaste.dto';

@Injectable()
export class ElementosDesgasteRepository {
  constructor(
    @InjectRepository(ElementoDesgaste)
    private readonly repo: Repository<ElementoDesgaste>,
  ) {}

  async listarParaTabla(limit: number = 1000): Promise<ElementoDesgaste[]> {
    return this.repo.find({
      order: { progresiva: 'ASC' },
      take: limit,
    });
  }


  async listarParaSelector(): Promise<{ id: number; codigoElemento: number }[]> {
    return this.repo.find({
      select: ['id', 'codigoElemento'],
      order: { progresiva: 'ASC' },
    });
  }
  

  async buscarPorId(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async buscarPorCodigo(codigoElemento: number) {
    return this.repo.findOne({ where: { codigoElemento } });
  }

  async listarParaFiltro() {
    return this.repo.createQueryBuilder('e')
      .select(['e.id', 'e.codigo_elemento', 'e.progresiva'])
      .orderBy('e.progresiva', 'ASC')
      .getMany();
  }

  async crear(datos: Partial<ElementoDesgaste>) {
    return this.repo.save(this.repo.create(datos));
  }
}