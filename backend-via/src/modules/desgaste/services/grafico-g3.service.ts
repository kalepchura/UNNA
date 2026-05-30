import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DesgasteAnalyticsRepository } from '../repositories/desgaste-analytics.repository';
import { MtbEscenarioRepository } from '../repositories/mtb-escenario.repository';
import { EscenarioMTB } from '../entities/escenario-mtb.entity';
import { Tramo } from '../../catalogos/tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../../catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../catalogos/curvas-verticales/entities/curva-vertical.entity';

import { GraficoG3RequestDto } from '../dto/graficos/grafico-3/grafico-g3-request.dto';
import { GraficoG3ConfigDto } from '../dto/graficos/grafico-3/grafico-g3-config.dto';
import {
  GraficoG3ResponseDto,
  GraficoG3SerieDto,
  GraficoG3PuntoDto,
  GraficoG3EscenarioInfoDto,
} from '../dto/graficos/grafico-3/grafico-g3-response.dto';

import {
  TipoAgrupacionDesgaste,
  TipoViaFiltro,
  PuntoW,
} from '../../../common/enums';
import { TOLERANCIA_MAXIMA_MM } from '../../../common/constants/desgaste.constants';

/**
 * Configuración base aplicada cuando no se envía ninguna config.
 * Usa arrays para ser coherente con el nuevo diseño.
 */
const CONFIG_BASE_G3: Required<GraficoG3ConfigDto> = {
  tipoAgrupacion: TipoAgrupacionDesgaste.TRAMO,
  tramoIds: [4],
  curvaHorizontalIds: [],
  curvaVerticalIds: [],
  via: TipoViaFiltro.AMBAS,
  elementoCodigos: [],        // se resuelven dinámicamente
  puntosW: [PuntoW.W1],
  escenarioIds: [1],
};

/**
 * ============================================================
 * GraficoG3Service — Proyección de Desgaste por Escenario
 * ============================================================
 *
 * DISEÑO:
 *  - El request acepta una LISTA de configuraciones independientes.
 *  - Cada config define: agrupación (tramos/curvas), vía, elementos,
 *    puntos W y escenarios.
 *  - Por cada config se procesan todos los escenarioIds solicitados.
 *  - Por cada (escenario × elemento × puntoW) se genera UNA línea.
 *  - Todas las líneas de todas las configs se unifican en la respuesta.
 *
 * EJE X: MTB acumulado del escenario al que pertenece la medición.
 *         Cada escenario tiene su propia escala X.
 * EJE Y: desgaste medido en mm (puede ser negativo).
 * TOOLTIP: año y trimestre de la medición.
 *
 * CACHÉ: se guarda la respuesta de la config base (sin parámetros)
 *        por 5 minutos. Se invalida cuando cambian escenarios o mediciones.
 * ============================================================
 */
@Injectable()
export class GraficoG3Service {
  private cacheBase: { data: GraficoG3ResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly analyticsRepo: DesgasteAnalyticsRepository,
    private readonly mtbRepo: MtbEscenarioRepository,
    @InjectRepository(EscenarioMTB)
    private readonly escenarioRepo: Repository<EscenarioMTB>,
    @InjectRepository(Tramo)
    private readonly tramosRepo: Repository<Tramo>,
    @InjectRepository(CurvaHorizontal)
    private readonly curvasHRepo: Repository<CurvaHorizontal>,
    @InjectRepository(CurvaVertical)
    private readonly curvasVRepo: Repository<CurvaVertical>,
  ) {}

  // ----------------------------------------------------------
  // MÉTODO PRINCIPAL
  // ----------------------------------------------------------

  async calcular(request: GraficoG3RequestDto): Promise<GraficoG3ResponseDto> {
    // Si no se enviaron configs, usar la base
    const configs: GraficoG3ConfigDto[] = request.configuraciones?.length
      ? request.configuraciones
      : [{ ...CONFIG_BASE_G3 }];

    // Detectar si es la config base para devolver caché
    const esBase = configs.length === 1 && this.esConfiguracionBase(configs[0]);
    if (esBase) {
      const ahora = Date.now();
      if (this.cacheBase.data && this.cacheBase.expira > ahora) {
        return this.cacheBase.data;
      }
    }

    // Aplicar defaults a cada config
    const configsResueltas = configs.map(c => this.aplicarDefaults(c));

    // Validar existencia de agrupaciones en BD
    await Promise.all(configsResueltas.map(c => this.validarAgrupacion(c)));

    // Resolver elementos para configs que no los especificaron
    await Promise.all(configsResueltas.map(c => this.resolverElementos(c)));

    // Recopilar todos los escenarioIds únicos para cargar MTB de una vez
    const todosEscenarioIds = [
      ...new Set(configsResueltas.flatMap(c => c.escenarioIds ?? [])),
    ];

    // Cargar info + MTB acumulado de todos los escenarios involucrados
    const escenarioInfoMap = await this.cargarEscenariosInfo(todosEscenarioIds);

    // Procesar cada config y acumular series
    const todasLasSeries: GraficoG3SerieDto[] = [];
    const configsSinDatos: number[] = [];
    let totalMediciones = 0;

    for (let i = 0; i < configsResueltas.length; i++) {
      const config = configsResueltas[i];
      const { series, medicionesCount } = await this.procesarConfig(
        config,
        i,
        escenarioInfoMap,
      );
      if (series.length === 0) configsSinDatos.push(i);
      todasLasSeries.push(...series);
      totalMediciones += medicionesCount;
    }

    // Construir metadata de escenarios presentes en la respuesta
    const escenarioIdsUsados = [...new Set(todasLasSeries.map(s => s.escenarioId))];
    const escenariosMetadata: GraficoG3EscenarioInfoDto[] = escenarioIdsUsados.map(id => {
      const info = escenarioInfoMap.get(id)!;
      return {
        id,
        nombre: info.nombre,
        mtbMaximo: info.mtbMaximo,
        anioInicio: info.anioInicio,
        anioFin: info.anioFin,
      };
    });

    const respuesta: GraficoG3ResponseDto = {
      configuracionesAplicadas: configsResueltas,
      series: todasLasSeries,
      metadata: {
        escenarios: escenariosMetadata,
        totalLineas: todasLasSeries.length,
        totalMediciones,
        toleranciaMm: TOLERANCIA_MAXIMA_MM,
        configsSinDatos,
        calculadoEn: new Date(),
      },
    };

    if (esBase) {
      this.cacheBase = { data: respuesta, expira: Date.now() + this.TTL_MS };
    }

    return respuesta;
  }

  invalidarCacheBase(): void {
    this.cacheBase = { data: null, expira: 0 };
  }

  // ----------------------------------------------------------
  // APLICAR DEFAULTS A UNA CONFIG
  // ----------------------------------------------------------

  private aplicarDefaults(config: GraficoG3ConfigDto): GraficoG3ConfigDto {
    return {
      tipoAgrupacion: config.tipoAgrupacion ?? CONFIG_BASE_G3.tipoAgrupacion,
      tramoIds: config.tramoIds?.length ? config.tramoIds : (
        config.tipoAgrupacion === TipoAgrupacionDesgaste.TRAMO || !config.tipoAgrupacion
          ? CONFIG_BASE_G3.tramoIds
          : []
      ),
      curvaHorizontalIds: config.curvaHorizontalIds ?? [],
      curvaVerticalIds: config.curvaVerticalIds ?? [],
      via: config.via ?? CONFIG_BASE_G3.via,
      elementoCodigos: config.elementoCodigos ?? [],
      puntosW: config.puntosW?.length ? config.puntosW : CONFIG_BASE_G3.puntosW,
      escenarioIds: config.escenarioIds?.length ? config.escenarioIds : CONFIG_BASE_G3.escenarioIds,
    };
  }

  // ----------------------------------------------------------
  // VALIDAR AGRUPACIÓN EXISTE EN BD
  // ----------------------------------------------------------

  private async validarAgrupacion(config: GraficoG3ConfigDto): Promise<void> {
    switch (config.tipoAgrupacion) {
      case TipoAgrupacionDesgaste.TRAMO: {
        const ids = config.tramoIds ?? [];
        for (const id of ids) {
          const existe = await this.tramosRepo.findOne({ where: { id } });
          if (!existe) throw new NotFoundException(`Tramo con ID ${id} no encontrado`);
        }
        break;
      }
      case TipoAgrupacionDesgaste.CURVA_HORIZONTAL: {
        const ids = config.curvaHorizontalIds ?? [];
        for (const id of ids) {
          const existe = await this.curvasHRepo.findOne({ where: { id } });
          if (!existe) throw new NotFoundException(`Curva horizontal con ID ${id} no encontrada`);
        }
        break;
      }
      case TipoAgrupacionDesgaste.CURVA_VERTICAL: {
        const ids = config.curvaVerticalIds ?? [];
        for (const id of ids) {
          const existe = await this.curvasVRepo.findOne({ where: { id } });
          if (!existe) throw new NotFoundException(`Curva vertical con ID ${id} no encontrada`);
        }
        break;
      }
    }
  }

  // ----------------------------------------------------------
  // RESOLVER ELEMENTOS AUTOMÁTICAMENTE
  // ----------------------------------------------------------

  /**
   * Si el usuario no especificó elementoCodigos, los resuelve
   * desde la BD según la agrupación y vía.
   */
  private async resolverElementos(config: GraficoG3ConfigDto): Promise<void> {
    // elementoCodigos vacío = el usuario no eligió nada → no asumimos "todos"
    // El frontend obliga a elegir explícitamente (incluyendo "Todos" via MultiSelect)
    if (!config.elementoCodigos || config.elementoCodigos.length === 0) {
      config.elementoCodigos = [];
    }
  }

  // ----------------------------------------------------------
  // CARGAR INFO DE ESCENARIOS (MTB acumulado)
  // ----------------------------------------------------------

  private async cargarEscenariosInfo(escenarioIds: number[]): Promise<Map<number, {
    nombre: string;
    mtbAcumuladoPorAnio: Map<number, number>;
    mtbMaximo: number;
    anioInicio: number;
    anioFin: number;
  }>> {
    const mapa = new Map<number, {
      nombre: string;
      mtbAcumuladoPorAnio: Map<number, number>;
      mtbMaximo: number;
      anioInicio: number;
      anioFin: number;
    }>();

    for (const id of escenarioIds) {
      const escenario = await this.escenarioRepo.findOne({ where: { id } });
      if (!escenario || escenario.eliminado) {
        throw new BadRequestException(`Escenario con ID ${id} no disponible o eliminado`);
      }

      const valores = await this.mtbRepo.listarPorEscenario(id);
      if (!valores.length) {
        throw new BadRequestException(`Escenario con ID ${id} no tiene valores anuales de MTB`);
      }

      let acum = 0;
      const mtbPorAnio = new Map<number, number>();
      for (const v of valores) {
        acum += parseFloat(v.mtb);
        mtbPorAnio.set(v.anio, Math.round(acum * 1000) / 1000);
      }

      const anios = valores.map(v => v.anio);
      mapa.set(id, {
        nombre: escenario.nombre,
        mtbAcumuladoPorAnio: mtbPorAnio,
        mtbMaximo: acum,
        anioInicio: Math.min(...anios),
        anioFin: Math.max(...anios),
      });
    }

    return mapa;
  }

  // ----------------------------------------------------------
  // PROCESAR UNA CONFIGURACIÓN
  // ----------------------------------------------------------

  private async procesarConfig(
    config: GraficoG3ConfigDto,
    configIndex: number,
    escenarioInfoMap: Map<number, {
      nombre: string;
      mtbAcumuladoPorAnio: Map<number, number>;
      mtbMaximo: number;
      anioInicio: number;
      anioFin: number;
    }>,
  ): Promise<{ series: GraficoG3SerieDto[]; medicionesCount: number }> {
    const series: GraficoG3SerieDto[] = [];
    const agrupacionIds = this.obtenerAgrupacionIds(config);
    const elementoCodigos = config.elementoCodigos ?? [];
    const puntosW = config.puntosW ?? [PuntoW.W1];
    const escenarioIds = config.escenarioIds ?? [];
    let medicionesCount = 0;

    if (elementoCodigos.length === 0 || agrupacionIds.length === 0) {
      return { series: [], medicionesCount: 0 };
    }

    // Por cada escenario solicitado en esta config
    for (const escenarioId of escenarioIds) {
      const escInfo = escenarioInfoMap.get(escenarioId);
      if (!escInfo) continue;

      // Cargar mediciones de este escenario específico
      const mediciones = await this.analyticsRepo.medicionesG3(
        config.tipoAgrupacion!,
        agrupacionIds,
        config.via!,
        elementoCodigos,
        escenarioId,
      );

      medicionesCount += mediciones.length;
      if (mediciones.length === 0) continue;

      // Tomar el último trimestre por (elemento, año)
      const ultimasPorElementoYAnio = this.tomarUltimoTrimestrePorAnio(mediciones);

      // Construir series: elemento × puntoW
      const seriesEscenario = this.construirSeries(
        ultimasPorElementoYAnio,
        puntosW,
        escInfo.mtbAcumuladoPorAnio,
        escenarioId,
        escInfo.nombre,
        configIndex,
      );

      series.push(...seriesEscenario);
    }

    return { series, medicionesCount };
  }

  // ----------------------------------------------------------
  // TOMAR ÚLTIMO TRIMESTRE POR (elemento, año)
  // ----------------------------------------------------------

  private tomarUltimoTrimestrePorAnio(
    mediciones: Array<{
      elementoId: number;
      codigoElemento: number;
      via: string;
      riel: string;
      anio: number;
      trimestre: number;
      w1: number | null;
      w2: number | null;
      w3r: number | null;
      w3l: number | null;
    }>,
  ): Map<number, Map<number, typeof mediciones[0]>> {
    const result = new Map<number, Map<number, typeof mediciones[0]>>();

    for (const m of mediciones) {
      let porAnio = result.get(m.elementoId);
      if (!porAnio) {
        porAnio = new Map();
        result.set(m.elementoId, porAnio);
      }
      const existente = porAnio.get(m.anio);
      if (!existente || m.trimestre > existente.trimestre) {
        porAnio.set(m.anio, m);
      }
    }

    return result;
  }

  // ----------------------------------------------------------
  // CONSTRUIR SERIES
  // ----------------------------------------------------------

  private construirSeries(
    ultimasPorElementoYAnio: Map<number, Map<number, any>>,
    puntosW: PuntoW[],
    mtbAcumuladoPorAnio: Map<number, number>,
    escenarioId: number,
    escenarioNombre: string,
    configIndex: number,
  ): GraficoG3SerieDto[] {
    const series: GraficoG3SerieDto[] = [];

    // Ordenar elementos por código
    const elementos = Array.from(ultimasPorElementoYAnio.entries()).sort((a, b) => {
      const codA = this.primerCodigoElemento(a[1]);
      const codB = this.primerCodigoElemento(b[1]);
      return codA - codB;
    });

    for (const [, porAnio] of elementos) {
      const codigoElemento = this.primerCodigoElemento(porAnio);
      // via y riel son iguales para todas las filas del mismo elemento
      const primeraFila = [...porAnio.values()][0];
      const via  = primeraFila?.via  ?? '';
      const riel = primeraFila?.riel ?? '';

      for (const punto of puntosW) {
        const puntos = this.construirPuntosLinea(porAnio, punto, mtbAcumuladoPorAnio);
        if (puntos.length === 0) continue;

        series.push({
          id: `ELEM-${codigoElemento}-${via}-${riel}-${punto}-ESC-${escenarioId}`,
          nombre: `Elem. ${codigoElemento} · ${via} · ${riel} · ${punto} · ${escenarioNombre}`,
          codigoElemento,
          punto,
          escenarioId,
          escenarioNombre,
          configIndex,
          puntos,
        });
      }
    }

    return series;
  }

  // ----------------------------------------------------------
  // CONSTRUIR PUNTOS DE UNA LÍNEA
  // ----------------------------------------------------------

  private construirPuntosLinea(
    porAnio: Map<number, any>,
    punto: PuntoW,
    mtbAcumuladoPorAnio: Map<number, number>,
  ): GraficoG3PuntoDto[] {
    const puntos: GraficoG3PuntoDto[] = [];
    const aniosOrdenados = [...porAnio.keys()].sort((a, b) => a - b);

    for (const anio of aniosOrdenados) {
      const fila = porAnio.get(anio);
      const valorW = this.obtenerValorPunto(fila, punto);
      const mtbAcum = mtbAcumuladoPorAnio.get(anio);

      // Descartamos si no hay MTB para ese año en el escenario
      // o si el valor W no tiene dato (null/undefined)
      // Nota: valorW puede ser 0 o negativo, eso es válido
      if (valorW === null || valorW === undefined || mtbAcum === undefined) continue;

      puntos.push({
        x: mtbAcum,
        y: Math.round(valorW * 100) / 100,
        anio,
        trimestre: fila.trimestre,
      });
    }

    return puntos;
  }

  // ----------------------------------------------------------
  // HELPERS
  // ----------------------------------------------------------

  private obtenerAgrupacionIds(config: GraficoG3ConfigDto): number[] {
    switch (config.tipoAgrupacion) {
      case TipoAgrupacionDesgaste.TRAMO:            return config.tramoIds ?? [];
      case TipoAgrupacionDesgaste.CURVA_HORIZONTAL: return config.curvaHorizontalIds ?? [];
      case TipoAgrupacionDesgaste.CURVA_VERTICAL:   return config.curvaVerticalIds ?? [];
      default:                                       return config.tramoIds ?? [];
    }
  }

  private obtenerValorPunto(fila: any, punto: PuntoW): number | null {
    switch (punto) {
      case PuntoW.W1:  return fila.w1  !== null ? Number(fila.w1)  : null;
      case PuntoW.W2:  return fila.w2  !== null ? Number(fila.w2)  : null;
      case PuntoW.W3R: return fila.w3r !== null ? Number(fila.w3r) : null;
      case PuntoW.W3L: return fila.w3l !== null ? Number(fila.w3l) : null;
      default:         return null;
    }
  }

  private primerCodigoElemento(porAnio: Map<number, any>): number {
    for (const fila of porAnio.values()) return fila.codigoElemento;
    return 0;
  }

  private esConfiguracionBase(config: GraficoG3ConfigDto): boolean {
    return (
      config.tipoAgrupacion === CONFIG_BASE_G3.tipoAgrupacion &&
      JSON.stringify(config.tramoIds) === JSON.stringify(CONFIG_BASE_G3.tramoIds) &&
      config.via === CONFIG_BASE_G3.via &&
      JSON.stringify(config.puntosW) === JSON.stringify(CONFIG_BASE_G3.puntosW) &&
      JSON.stringify(config.escenarioIds) === JSON.stringify(CONFIG_BASE_G3.escenarioIds)
    );
  }
}