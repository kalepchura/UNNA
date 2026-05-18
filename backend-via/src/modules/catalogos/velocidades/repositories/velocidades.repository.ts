import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Velocidad } from '../entities/velocidad.entity';
import { FiltrarVelocidadesDto } from '../dto/filtrar-velocidades.dto';

@Injectable()
export class VelocidadesRepository {
  constructor(
    @InjectRepository(Velocidad)
    private readonly repo: Repository<Velocidad>,
  ) {}

  async listarParaTabla(limit: number = 1000): Promise<Velocidad[]> {
    return this.repo.find({
      order: { progresivaInicio: 'ASC' },
      take: limit,
    });
  }

  async buscarPorId(id: number): Promise<Velocidad | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Devuelve la velocidad permitida en una progresiva específica.
   * Lo usará Fallas para autocompletar la velocidad de un registro.
   */
  async buscarPorProgresiva(progresiva: number): Promise<Velocidad | null> {
    return this.repo.createQueryBuilder('v')
      .where('v.progresiva_inicio <= :p', { p: progresiva })
      .andWhere('v.progresiva_fin >= :p', { p: progresiva })
      .getOne();
  }

  /**
   * Lista los valores DISTINTOS de velocidad para alimentar el dropdown
   * del Gráfico 3 del módulo Fallas (eje X = valores puntuales).
   */
  async listarValoresDistintos(): Promise<number[]> {
    const result = await this.repo.createQueryBuilder('v')
      .select('DISTINCT v.velocidad_kmh', 'velocidad')
      .orderBy('v.velocidad_kmh', 'ASC')
      .getRawMany<{ velocidad: number }>();
    return result.map((r) => Number(r.velocidad));
  }

  async crear(datos: Partial<Velocidad>) {
    return this.repo.save(this.repo.create(datos));
  }
}