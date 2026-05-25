import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temperatura } from '../../temperatura/entities/temperatura.entity';
import { MedicionDesgaste } from '../../desgaste/entities/medicion-desgaste.entity';
import { FallaRiel } from '../../fallas/entities/falla-riel.entity';

@Injectable()
export class MapaCalorRepository {
  constructor(
    @InjectRepository(Temperatura)
    private readonly tempRepo: Repository<Temperatura>,
    @InjectRepository(MedicionDesgaste)
    private readonly medRepo: Repository<MedicionDesgaste>,
    @InjectRepository(FallaRiel)
    private readonly fallasRepo: Repository<FallaRiel>,
  ) {}

  // ----------------------------------------------------------
  // CAPA TEMPERATURA
  // ----------------------------------------------------------

  async agregarPorTramo(
    fechaDesde: string,
    fechaHasta: string,
    agregacion: 'AVG' | 'MAX',
  ): Promise<Array<{ tramoId: number; valor: number; cantidadMediciones: number }>> {
    const fnSql = agregacion === 'MAX' ? 'MAX' : 'AVG';
    const sql = `
      SELECT
        imp.tramo_id                  AS "tramoId",
        ${fnSql}(t.temperatura)::float8 AS "valor",
        COUNT(t.id)::int              AS "cantidadMediciones"
      FROM temperaturas t
      JOIN temperatura_importaciones imp ON imp.id = t.importacion_id
      WHERE imp.eliminado = false
        AND t.fecha BETWEEN $1 AND $2
      GROUP BY imp.tramo_id
    `;
    return this.tempRepo.query(sql, [fechaDesde, fechaHasta]);
  }

  // ----------------------------------------------------------
  // CAPA DESGASTE - MODO GENERAL
  // ----------------------------------------------------------

  async ultimaMedicionPorElemento(
    puntoW: 'w1' | 'w2' | 'w3r' | 'w3l',
    fechaCorte: string,
  ): Promise<Array<{ elementoId: number; valor: number; anio: number; trimestre: number }>> {
    if (!['w1', 'w2', 'w3r', 'w3l'].includes(puntoW)) return [];

    const sql = `
      WITH mediciones_validas AS (
        SELECT
          m.elemento_id,
          m.anio,
          m.trimestre,
          m.${puntoW}::float8 AS valor
        FROM mediciones_desgaste m
        WHERE m.${puntoW} IS NOT NULL
          AND (
            (
              make_date(m.anio, m.trimestre * 3, 1)
              + INTERVAL '1 month'
              - INTERVAL '1 day'
            )::date
          ) <= $1::date
      ),
      ranked AS (
        SELECT
          elemento_id,
          anio,
          trimestre,
          valor,
          ROW_NUMBER() OVER (
            PARTITION BY elemento_id
            ORDER BY anio DESC, trimestre DESC
          ) AS rn
        FROM mediciones_validas
      )
      SELECT
        elemento_id AS "elementoId",
        valor       AS "valor",
        anio        AS "anio",
        trimestre   AS "trimestre"
      FROM ranked
      WHERE rn = 1
    `;

    return this.medRepo.query(sql, [fechaCorte]);
  }

  // ----------------------------------------------------------
  // CAPA FALLAS
  // ----------------------------------------------------------

  async contarFallasPorTramo(
    fechaDesde: string,
    fechaHasta: string,
  ): Promise<Array<{ tramoId: number; cantidad: number }>> {
    const sql = `
      WITH fallas_riel AS (
        SELECT
          tr.id AS tramo_id,
          COUNT(fr.id) AS total
        FROM fallas_riel fr
        JOIN tramos tr
          ON fr.progresiva BETWEEN tr.progresiva_inicio AND tr.progresiva_fin
        WHERE fr.eliminado = false
          AND fr.fecha BETWEEN $1 AND $2
        GROUP BY tr.id
      ),
      fallas_sold AS (
        SELECT
          tr.id AS tramo_id,
          COUNT(fs.id) AS total
        FROM fallas_soldadura_inox fs
        JOIN cambiavias cv ON cv.id = fs.cambiavia_id
        JOIN tramos tr
          ON cv.progresiva BETWEEN tr.progresiva_inicio AND tr.progresiva_fin
        WHERE fs.eliminado = false
          AND fs.fecha_deteccion BETWEEN $1 AND $2
        GROUP BY tr.id
      ),
      union_total AS (
        SELECT tramo_id, total FROM fallas_riel
        UNION ALL
        SELECT tramo_id, total FROM fallas_sold
      )
      SELECT
        tramo_id        AS "tramoId",
        SUM(total)::int AS "cantidad"
      FROM union_total
      GROUP BY tramo_id
    `;
    return this.fallasRepo.query(sql, [fechaDesde, fechaHasta]);
  }

  async contarFallasPorCambiavia(
    fechaDesde: string,
    fechaHasta: string,
  ): Promise<Array<{ cambiaviaId: number; cantidad: number }>> {
    const sql = `
      SELECT
        fs.cambiavia_id AS "cambiaviaId",
        COUNT(fs.id)::int AS "cantidad"
      FROM fallas_soldadura_inox fs
      WHERE fs.eliminado = false
        AND fs.fecha_deteccion BETWEEN $1 AND $2
      GROUP BY fs.cambiavia_id
    `;
    return this.fallasRepo.query(sql, [fechaDesde, fechaHasta]);
  }

  async contarFallasPorCurvaHorizontal(
    fechaDesde: string,
    fechaHasta: string,
  ): Promise<Array<{ curvaId: number; cantidad: number }>> {
    const sql = `
      WITH fallas_riel AS (
        SELECT
          ch.id AS curva_id,
          COUNT(fr.id) AS total
        FROM fallas_riel fr
        JOIN curvas_horizontales ch
          ON fr.progresiva BETWEEN ch.inicio_m AND ch.fin_m
        WHERE fr.eliminado = false
          AND fr.fecha BETWEEN $1 AND $2
        GROUP BY ch.id
      ),
      fallas_sold AS (
        SELECT
          ch.id AS curva_id,
          COUNT(fs.id) AS total
        FROM fallas_soldadura_inox fs
        JOIN cambiavias cv ON cv.id = fs.cambiavia_id
        JOIN curvas_horizontales ch
          ON cv.progresiva BETWEEN ch.inicio_m AND ch.fin_m
        WHERE fs.eliminado = false
          AND fs.fecha_deteccion BETWEEN $1 AND $2
        GROUP BY ch.id
      ),
      union_total AS (
        SELECT curva_id, total FROM fallas_riel
        UNION ALL
        SELECT curva_id, total FROM fallas_sold
      )
      SELECT
        curva_id        AS "curvaId",
        SUM(total)::int AS "cantidad"
      FROM union_total
      GROUP BY curva_id
    `;
    return this.fallasRepo.query(sql, [fechaDesde, fechaHasta]);
  }

  async contarFallasPorCurvaVertical(
    fechaDesde: string,
    fechaHasta: string,
  ): Promise<Array<{ curvaId: number; cantidad: number }>> {
    const sql = `
      WITH fallas_riel AS (
        SELECT
          cv.id AS curva_id,
          COUNT(fr.id) AS total
        FROM fallas_riel fr
        JOIN curvas_verticales cv
          ON fr.progresiva BETWEEN cv.inicio_m AND cv.fin_m
        WHERE fr.eliminado = false
          AND fr.fecha BETWEEN $1 AND $2
        GROUP BY cv.id
      ),
      fallas_sold AS (
        SELECT
          cv.id AS curva_id,
          COUNT(fs.id) AS total
        FROM fallas_soldadura_inox fs
        JOIN cambiavias ca ON ca.id = fs.cambiavia_id
        JOIN curvas_verticales cv
          ON ca.progresiva BETWEEN cv.inicio_m AND cv.fin_m
        WHERE fs.eliminado = false
          AND fs.fecha_deteccion BETWEEN $1 AND $2
        GROUP BY cv.id
      ),
      union_total AS (
        SELECT curva_id, total FROM fallas_riel
        UNION ALL
        SELECT curva_id, total FROM fallas_sold
      )
      SELECT
        curva_id        AS "curvaId",
        SUM(total)::int AS "cantidad"
      FROM union_total
      GROUP BY curva_id
    `;
    return this.fallasRepo.query(sql, [fechaDesde, fechaHasta]);
  }
}