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

  /**
   * Lista todas las mediciones de un conjunto de elementos
   * y un conjunto de años. Para construir la grilla.
   */
  async listarPorElementosYAnios(
    elementoIds: number[],
    anios: number[],
  ): Promise<MedicionDesgaste[]> {
    if (elementoIds.length === 0 || anios.length === 0) return [];

    return this.repo.find({
      where: {
        elementoId: In(elementoIds),
        anio: In(anios),
      },
      order: {
        elementoId: 'ASC',
        anio: 'ASC',
        trimestre: 'ASC',
      },
    });
  }

  /**
   * Busca años distintos con datos en la BD. Útil para el default
   * de la grilla cuando no se especifican años.
   */
  async obtenerAniosConDatos(): Promise<number[]> {
    const result = await this.repo
      .createQueryBuilder('m')
      .select('DISTINCT m.anio', 'anio')
      .orderBy('m.anio', 'ASC')
      .getRawMany<{ anio: number }>();

    return result.map((r) => r.anio);
  }

  /**
   * Buscar UNA medición específica por (elemento, año, trimestre)
   * dentro de una transacción.
   */
  async buscarEnTransaccion(
    manager: EntityManager,
    elementoId: number,
    anio: number,
    trimestre: number,
  ): Promise<MedicionDesgaste | null> {
    return manager.findOne(MedicionDesgaste, {
      where: { elementoId, anio, trimestre },
    });
  }

  /**
   * UPSERT manual de una fila de mediciones.
   *
   * Recibe `manager` para que se ejecute dentro de la transacción
   * del service.
   *
   * Devuelve un flag `creada` para saber si fue insert o update
   * (útil para los contadores del response).
   */
  async upsertEnTransaccion(
    manager: EntityManager,
    elementoId: number,
    anio: number,
    trimestre: number,
    valoresW: { w1?: string | null; w2?: string | null; w3r?: string | null; w3l?: string | null },
  ): Promise<{ medicion: MedicionDesgaste; creada: boolean }> {
    let medicion = await manager.findOne(MedicionDesgaste, {
      where: { elementoId, anio, trimestre },
    });

    if (!medicion) {
      // Insert
      medicion = manager.create(MedicionDesgaste, {
        elementoId,
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

    // Update: solo aplicar los campos que vienen en valoresW
    if (valoresW.w1 !== undefined) medicion.w1 = valoresW.w1;
    if (valoresW.w2 !== undefined) medicion.w2 = valoresW.w2;
    if (valoresW.w3r !== undefined) medicion.w3r = valoresW.w3r;
    if (valoresW.w3l !== undefined) medicion.w3l = valoresW.w3l;

    const actualizada = await manager.save(medicion);
    return { medicion: actualizada, creada: false };
  }
}