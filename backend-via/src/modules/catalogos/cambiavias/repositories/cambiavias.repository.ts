import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cambiavia } from '../entities/cambiavia.entity';
import { FiltrarCambiaviasDto } from '../dto/filtrar-cambiavias.dto';

@Injectable()
export class CambiaviasRepository {
  constructor(
    @InjectRepository(Cambiavia)
    private readonly repo: Repository<Cambiavia>,
  ) {}

  // ✅ Para la TABLA (todos los campos, sin filtros backend)
  async listarParaTabla(limit: number = 1000): Promise<Cambiavia[]> {
    return this.repo.find({
      order: { progresiva: 'ASC' },
      take: limit,
    });
  }

   // ✅ Para el SELECTOR (solo id y codigoBd)
  async listarParaSelector(): Promise<{ id: number; codigoBd: string }[]> {
    return this.repo.find({
      select: ['id', 'codigoBd'],
      order: { progresiva: 'ASC' },
    });
  }

  async buscarPorId(id: number): Promise<Cambiavia | null> {
    return this.repo.findOne({ where: { id } });
  }

  async buscarPorCodigoBd(codigoBd: string) {
    return this.repo.findOne({ where: { codigoBd } });
  }

  async listarParaFiltro() {
    return this.repo.createQueryBuilder('c')
      .select(['c.id', 'c.codigo_bd', 'c.descripcion'])
      .orderBy('c.progresiva', 'ASC')
      .getMany();
  }

  async crear(datos: Partial<Cambiavia>) {
    return this.repo.save(this.repo.create(datos));
  }
}