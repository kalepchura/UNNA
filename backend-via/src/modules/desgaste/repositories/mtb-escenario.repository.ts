import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { MtbEscenario } from '../entities/mtb-escenario.entity';

@Injectable()
export class MtbEscenarioRepository {
  constructor(
    @InjectRepository(MtbEscenario)
    private readonly repo: Repository<MtbEscenario>,
  ) {}

  /**
   * Lista TODOS los valores de un escenario, ordenados por año ASC.
   * Necesario para calcular MTB acumulado correctamente.
   */
  async listarPorEscenario(escenarioId: number): Promise<MtbEscenario[]> {
    return this.repo.find({
      where: { escenarioId },
      order: { anio: 'ASC' },
    });
  }

  /**
   * UPSERT por (escenarioId, anio) dentro de una transacción.
   * Devuelve flag para saber si fue create o update.
   */
  async upsertEnTransaccion(
    manager: EntityManager,
    escenarioId: number,
    anio: number,
    mtb: string,
  ): Promise<{ creado: boolean }> {
    const existente = await manager.findOne(MtbEscenario, {
      where: { escenarioId, anio },
    });

    if (!existente) {
      const nuevo = manager.create(MtbEscenario, { escenarioId, anio, mtb });
      await manager.save(nuevo);
      return { creado: true };
    }

    existente.mtb = mtb;
    await manager.save(existente);
    return { creado: false };
  }

  /**
   * Borrar un valor por (escenarioId, anio) dentro de transacción.
   * Devuelve true si efectivamente borró (false si no existía).
   */
  async eliminarPorAnioEnTransaccion(
    manager: EntityManager,
    escenarioId: number,
    anio: number,
  ): Promise<boolean> {
    const result = await manager.delete(MtbEscenario, { escenarioId, anio });
    return (result.affected ?? 0) > 0;
  }
}