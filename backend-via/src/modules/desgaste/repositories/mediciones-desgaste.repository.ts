import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { MedicionDesgaste } from '../entities/medicion-desgaste.entity';

@Injectable()
export class MedicionesDesgasteRepository {
  constructor(
    @InjectRepository(MedicionDesgaste)
    private readonly repo: Repository<MedicionDesgaste>,
  ) {}

  async listarPorElementosYAnios(
    elementoIds: number[],
    anios: number[],
    escenarioId: number,
  ): Promise<MedicionDesgaste[]> {
    if (elementoIds.length === 0 || anios.length === 0) return [];

    return this.repo.find({
      where: {
        elementoId: In(elementoIds),
        anio: In(anios),
        escenarioId,
      },
      order: { elementoId: 'ASC', anio: 'ASC', trimestre: 'ASC' },
    });
  }

  async obtenerAniosConDatos(escenarioId: number): Promise<number[]> {
    const result = await this.repo
      .createQueryBuilder('m')
      .select('DISTINCT m.anio', 'anio')
      .where('m.escenario_id = :escenarioId', { escenarioId })
      .orderBy('m.anio', 'ASC')
      .getRawMany<{ anio: number }>();

    return result.map((r) => r.anio);
  }

  async upsertEnTransaccion(
    manager: EntityManager,
    elementoId: number,
    escenarioId: number,
    anio: number,
    trimestre: number,
    valoresW: { w1?: string | null; w2?: string | null; w3r?: string | null; w3l?: string | null },
  ): Promise<{ medicion: MedicionDesgaste; creada: boolean }> {
    let medicion = await manager.findOne(MedicionDesgaste, {
      where: { elementoId, escenarioId, anio, trimestre },
    });

    if (!medicion) {
      medicion = manager.create(MedicionDesgaste, {
        elementoId,
        escenarioId,
        anio,
        trimestre,
        w1: valoresW.w1 ?? null,
        w2: valoresW.w2 ?? null,
        w3r: valoresW.w3r ?? null,
        w3l: valoresW.w3l ?? null,
      });
      const creada = await manager.save(medicion);
      return { medicion: creada, creada: true };
    }

    if (valoresW.w1 !== undefined) medicion.w1 = valoresW.w1;
    if (valoresW.w2 !== undefined) medicion.w2 = valoresW.w2;
    if (valoresW.w3r !== undefined) medicion.w3r = valoresW.w3r;
    if (valoresW.w3l !== undefined) medicion.w3l = valoresW.w3l;

    const actualizada = await manager.save(medicion);
    return { medicion: actualizada, creada: false };
  }
}