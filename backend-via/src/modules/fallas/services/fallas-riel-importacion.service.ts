import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';

import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { parsearExcelFallasRiel } from '../parsers/excel-fallas-riel.parser';

import { GeolocalizacionService } from '../../../common/services/geolocalizacion.service';

import { AuditoriaService } from '../../auditoria/services/auditoria.service';

import { registrarAuditoria } from '../../auditoria/helpers/auditoria.helper';

import {
  ModuloAuditoria,
  OperacionAuditoria,
  EstadoFalla,
  TipoVia,
} from '../../../common/enums';

import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

import { KpisFallasService } from './kpis-fallas.service';

import { ImportacionFallasRielResultadoDto } from '../dto/falla-riel/importacion-fallas-riel-resultado.dto';

import { FallasRielAccionService } from './fallas-riel-accion.service';

// ============================================================
// TIPOS INTERNOS
// ============================================================

interface ContextoGeograficoCache {
  tramoId: number;
  curvaHorizontalId: number | null;
  curvaVerticalId: number | null;
  velocidadKmh: number | null;
}

/**
 * ============================================================
 * FallasRielImportacionService
 * ============================================================
 * Importación masiva de:
 *
 * - FallaRiel
 * - FallaRielAccion
 *
 * desde Excel.
 *
 * ============================================================
 * FLUJO
 * ============================================================
 *
 * 1. Parsear Excel
 * 2. Precargar contexto geográfico
 * 3. Insertar detecciones masivamente
 * 4. Crear acciones reutilizando service oficial
 * 5. Invalidar SOLO KPIs cacheados
 * 6. Registrar auditoría
 * 7. Retornar resumen
 *
 * ============================================================
 * DECISIÓN ARQUITECTÓNICA
 * ============================================================
 *
 * KPIs:
 * - usan caché
 * - requieren invalidación
 *
 * Gráficos:
 * - NO usan caché
 * - SIEMPRE consultan BD realtime
 * - NO requieren invalidación
 *
 * ============================================================
 */
@Injectable()
export class FallasRielImportacionService {

  private readonly logger =
    new Logger(FallasRielImportacionService.name);

  private readonly LOTE_SIZE = 500;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly accionesService: FallasRielAccionService,

    private readonly geolocalizacion: GeolocalizacionService,

    private readonly auditoria: AuditoriaService,

    // SOLO KPIs usan caché real
    private readonly kpisService: KpisFallasService,
  ) {}

  async importar(
    buffer: Buffer,
    user: AuthenticatedUser,
  ): Promise<ImportacionFallasRielResultadoDto> {

    // ----------------------------------------------------------
    // 1. PARSEAR EXCEL
    // ----------------------------------------------------------

    const parseado =
      parsearExcelFallasRiel(buffer);

    if (
      parseado.detecciones.length === 0 &&
      parseado.errores.length > 0
    ) {
      return {
        totalFilas: parseado.totalFilas,
        deteccionesCreadas: 0,
        accionesCreadas: 0,
        errores: parseado.errores.length,
        detalleErrores:
          parseado.errores.slice(0, 50),
      };
    }

    const erroresAcumulados = [
      ...parseado.errores,
    ];

    let deteccionesCreadas = 0;

    let accionesCreadas = 0;

    // ----------------------------------------------------------
    // 2. PRECARGAR CONTEXTO GEOGRÁFICO
    // ----------------------------------------------------------

    const combinacionesUnicas =
      new Map<
        string,
        ContextoGeograficoCache | null
      >();

    for (const det of parseado.detecciones) {

      const clave =
        `${det.progresiva}|${det.via}`;

      if (!combinacionesUnicas.has(clave)) {
        combinacionesUnicas.set(clave, null);
      }
    }

    for (const [clave] of combinacionesUnicas) {

      const [progStr, via] =
        clave.split('|');

      const progresiva = Number(progStr);

      try {

        const ctx =
          await this.geolocalizacion.calcular(
            progresiva,
            via as TipoVia,
          );

        combinacionesUnicas.set(clave, {
          tramoId: ctx.tramoId,
          curvaHorizontalId:
            ctx.curvaHorizontalId,
          curvaVerticalId:
            ctx.curvaVerticalId,
          velocidadKmh: ctx.velocidadKmh,
        });

      } catch {

        combinacionesUnicas.set(clave, null);

        const filasAfectadas =
          parseado.detecciones
            .filter(
              (d) =>
                `${d.progresiva}|${d.via}` ===
                clave,
            )
            .map((d) => d.fila);

        for (const nFila of filasAfectadas) {

          erroresAcumulados.push({
            fila: nFila,

            columna: 'PROGRESIVA/VIA',

            mensaje:
              `La progresiva ${progresiva} ` +
              `(vía ${via}) no corresponde ` +
              `a ningún tramo registrado.`,
          });
        }
      }
    }

    // ----------------------------------------------------------
    // 3. FILTRAR DETECCIONES VÁLIDAS
    // ----------------------------------------------------------

    const deteccionesValidas =
      parseado.detecciones.filter((d) => {

        const clave =
          `${d.progresiva}|${d.via}`;

        return (
          combinacionesUnicas.get(clave) !== null
        );
      });

    // ----------------------------------------------------------
    // 4. INSERTAR DETECCIONES EN LOTE
    // ----------------------------------------------------------

    const mapaFallasCreadas =
      new Map<
        number,
        {
          clave: string;
          fallaId: number;
        }
      >();

    if (deteccionesValidas.length > 0) {

      try {

        await this.dataSource.transaction(
          async (manager) => {

            const entidades =
              deteccionesValidas.map((det) => {

                const clave =
                  `${det.progresiva}|${det.via}`;

                const ctx =
                  combinacionesUnicas.get(clave)!;

                return {

                  progresiva: det.progresiva,

                  via: det.via,

                  fecha: new Date(det.fecha),

                  carril: det.carril,

                  causa: det.causa ?? null,

                  origen: det.origen ?? null,

                  tipoDefecto: det.tipoDefecto,

                  elementoAfectado:
                    det.elementoAfectado,

                  zonaAfectada:
                    det.zonaAfectada,

                  perfil: det.perfil,

                  altaBaja: det.altaBaja,

                  progresivaFinal:
                    det.progresivaFinal ?? null,

                  largo: det.largo ?? null,

                  ancho: det.ancho ?? null,

                  profundidad:
                    det.profundidad ?? null,

                  numeroFoto:
                    det.numeroFoto ?? null,

                  tipoOnda:
                    det.tipoOnda ?? null,

                  estadoActual:
                    EstadoFalla.NO_ATENDIDO,

                  accionActual: null,

                  ptActual: null,

                  fechaEjecucionActual: null,

                  tramoId: ctx.tramoId,

                  curvaHorizontalId:
                    ctx.curvaHorizontalId,

                  curvaVerticalId:
                    ctx.curvaVerticalId,

                  velocidadKmh:
                    ctx.velocidadKmh,

                  creadoPor: user.id,

                  actualizadoPor: null,

                  eliminado: false,

                  eliminadoPorId: null,
                };
              });

            // INSERT masivo por lotes

            for (
              let i = 0;
              i < entidades.length;
              i += this.LOTE_SIZE
            ) {

              const lote =
                entidades.slice(
                  i,
                  i + this.LOTE_SIZE,
                );

              const insertResult =
                await manager
                  .createQueryBuilder()
                  .insert()
                  .into('fallas_riel')
                  .values(lote)
                  .returning('id')
                  .execute();

              insertResult.identifiers.forEach(
                (ident, idx) => {

                  const detIdx = i + idx;

                  const det =
                    deteccionesValidas[detIdx];

                  const clave =
                    `${det.progresiva}|${det.via}`;

                  mapaFallasCreadas.set(
                    det.fila,
                    {
                      clave,
                      fallaId: ident.id,
                    },
                  );
                },
              );
            }
          },
        );

        deteccionesCreadas =
          mapaFallasCreadas.size;

      } catch (err) {

        const msg =
          err instanceof Error
            ? err.message
            : String(err);

        this.logger.error(
          `Error en inserción masiva: ${msg}`,
        );

        throw new BadRequestException(
          `Error al insertar fallas: ${msg}`,
        );
      }
    }

    // ----------------------------------------------------------
    // 5. CREAR ACCIONES
    // ----------------------------------------------------------

    for (const acc of parseado.acciones) {

      const deteccionCorrespondiente =
        deteccionesValidas.find(
          (d) =>
            `${d.progresiva}|${d.via}` ===
            acc.claveDeteccion,
        );

      if (!deteccionCorrespondiente) {
        continue;
      }

      const mapeada =
        mapaFallasCreadas.get(
          deteccionCorrespondiente.fila,
        );

      if (!mapeada) {

        erroresAcumulados.push({
          fila: acc.fila,

          mensaje:
            `No se pudo crear la acción ` +
            `porque la detección ` +
            `correspondiente falló.`,
        });

        continue;
      }

      try {

        await this.accionesService.crear(
          mapeada.fallaId,
          {
            accion: acc.accion,
            conclusion: acc.conclusion,
            pt: acc.pt,
            fechaEjecucion:
              acc.fechaEjecucion,
            observaciones:
              acc.observaciones,
          },
          user,
        );

        accionesCreadas++;

      } catch (err) {

        const msg =
          err instanceof Error
            ? err.message
            : String(err);

        erroresAcumulados.push({
          fila: acc.fila,

          mensaje:
            `Error al crear acción: ${msg}`,
        });
      }
    }

    // ----------------------------------------------------------
    // 6. AUDITORÍA
    // ----------------------------------------------------------

    await registrarAuditoria(
      this.auditoria,
      {
        modulo: ModuloAuditoria.FALLAS,

        entidad: 'FallaRiel',

        entidadId: 'IMPORTACION',

        operacion: OperacionAuditoria.IMPORT,

        user,

        registrosAfectados:
          deteccionesCreadas,

        detalle: {
          totalFilas: parseado.totalFilas,
          deteccionesCreadas,
          accionesCreadas,
          errores:
            erroresAcumulados.length,
        },
      },
    );

    // ----------------------------------------------------------
    // 7. INVALIDAR SOLO KPIs
    // ----------------------------------------------------------

    this.kpisService.invalidarCache();

    // ----------------------------------------------------------
    // 8. RESPUESTA
    // ----------------------------------------------------------

    return {
      totalFilas: parseado.totalFilas,

      deteccionesCreadas,

      accionesCreadas,

      errores: erroresAcumulados.length,

      detalleErrores:
        erroresAcumulados.slice(0, 50),
    };
  }
}