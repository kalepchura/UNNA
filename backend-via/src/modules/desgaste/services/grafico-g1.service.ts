import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DesgasteAnalyticsRepository } from '../repositories/desgaste-analytics.repository';
import { EscenariosMtbRepository } from '../repositories/escenarios-mtb.repository';
import { MtbEscenarioRepository } from '../repositories/mtb-escenario.repository';
import { ElementoDesgaste } from '../../catalogos/elementos-desgaste/entities/elemento-desgaste.entity';
import { Tramo } from '../../catalogos/tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../../catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../catalogos/curvas-verticales/entities/curva-vertical.entity';

import { GraficoG1RequestDto } from '../dto/graficos/grafico-1/grafico-g1-request.dto';
import {
  GraficoG1ResponseDto,
  GraficoG1SerieDto,
  GraficoG1PuntoDto,
} from '../dto/graficos/grafico-1/grafico-g1-response.dto';
import { GraficoG1ConfigDto } from '../dto/graficos/grafico-1/grafico-g1-config.dto';
import { mergeConfig } from '../../../common/helpers/config-merge.helper';

import {
  TipoAgrupacionDesgaste,
  TipoViaFiltro,
  PuntoW,
} from '../../../common/enums';
import {
  TOLERANCIA_MAXIMA_MM,
  ESCENARIO_REAL_NOMBRE,
} from '../../../common/constants/desgaste.constants';

/** Configuración base: TRAMO, ID 4, AMBAS, W1 */
const CONFIG_BASE_G1: GraficoG1ConfigDto = {
  tipoAgrupacion: TipoAgrupacionDesgaste.TRAMO,
  tramoId: 4,
  via: TipoViaFiltro.AMBAS,
  puntosW: [PuntoW.W1],
};

@Injectable()
export class GraficoG1Service {
  private cacheBase: { data: GraficoG1ResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly analyticsRepo: DesgasteAnalyticsRepository,
    private readonly escenariosRepo: EscenariosMtbRepository,
    private readonly valoresRepo: MtbEscenarioRepository,
    @InjectRepository(ElementoDesgaste)
    private readonly elementosRepo: Repository<ElementoDesgaste>,
    @InjectRepository(Tramo)
    private readonly tramosRepo: Repository<Tramo>,
    @InjectRepository(CurvaHorizontal)
    private readonly curvasHRepo: Repository<CurvaHorizontal>,
    @InjectRepository(CurvaVertical)
    private readonly curvasVRepo: Repository<CurvaVertical>,
  ) {}

  // ----------------------------------------------------------
  // CALCULAR EL GRÁFICO
  // ----------------------------------------------------------

  async calcular(request: GraficoG1RequestDto): Promise<GraficoG1ResponseDto> {
    // 1. Merge con defaults (undefined no pisan)
    const config = mergeConfig(CONFIG_BASE_G1, request.config);

    // 2. Resolver valores que no vinieron (todos los elementos del tramo/curva)
    await this.resolverDefaultsDinamicos(config);

    // 3. Determinar si es la configuración base (para cachear)
    const esConfigBase = this.esConfiguracionBase(config);

    if (esConfigBase) {
      const ahora = Date.now();
      if (this.cacheBase.data && this.cacheBase.expira > ahora) {
        return this.cacheBase.data;
      }
    }

    // 4. Validar que el ID de agrupación exista realmente
    const agrupacionId = this.obtenerIdAgrupacion(config);
    await this.validarExistencia(config.tipoAgrupacion!, agrupacionId);

    // 5. Cargar MTB acumulado del escenario REAL (eje X)
    const mtbAcumuladoPorAnio = await this.cargarMtbAcumuladoReal();

    // 6. Cargar mediciones de los elementos seleccionados
    const mediciones = await this.analyticsRepo.medicionesConContexto(
      config.tipoAgrupacion!,
      agrupacionId,
      config.via!,
      config.elementoCodigos ?? [],
    );

    if (mediciones.length === 0) {
      return this.respuestaSinDatos(config);
    }

    // 7. Agrupar mediciones por (elemento, año) tomando el último trimestre
    const ultimasPorAnio = this.tomarUltimoTrimestrePorAnio(mediciones);

    // 8. Construir series (una por combinación elemento × puntoW)
    const series = this.construirSeries(
      ultimasPorAnio,
      config.puntosW!,
      mtbAcumuladoPorAnio,
    );

    const respuesta: GraficoG1ResponseDto = {
      configAplicada: config,
      series,
      metadata: {
        totalLineas: series.length,
        totalMediciones: mediciones.length,
        toleranciaMm: TOLERANCIA_MAXIMA_MM,
        calculadoEn: new Date(),
      },
    };

    // 9. Guardar en caché si es la base
    if (esConfigBase) {
      this.cacheBase = { data: respuesta, expira: Date.now() + this.TTL_MS };
    }

    return respuesta;
  }

  invalidarCacheBase(): void {
    this.cacheBase = { data: null, expira: 0 };
  }

  // ----------------------------------------------------------
  // HELPERS DE CONFIGURACIÓN
  // ----------------------------------------------------------

  /**
   * Si no se envió elementoCodigos (array vacío o ausente),
   * carga todos los códigos de los elementos del tramo/curva activo.
   */
  private async resolverDefaultsDinamicos(config: GraficoG1ConfigDto): Promise<void> {
    if (config.elementoCodigos && config.elementoCodigos.length > 0) return;

    const agrupacionId = this.obtenerIdAgrupacion(config);
    let elementos: ElementoDesgaste[] = [];

    if (config.tipoAgrupacion === TipoAgrupacionDesgaste.TRAMO) {
      elementos = await this.elementosRepo.find({
        where: { tramoId: agrupacionId },
        order: { progresiva: 'ASC' },
      });
    } else {
      // Para curvas, se requiere que el frontend envíe explícitamente los códigos
      // o se podría buscar por curvaHorizontalId / curvaVerticalId
      // Por simplicidad, si no se enviaron, se deja array vacío
      config.elementoCodigos = [];
      return;
    }

    config.elementoCodigos = elementos.map(e => e.codigoElemento);
  }

  /** Obtiene el ID de agrupación activo según el tipo */
  private obtenerIdAgrupacion(config: GraficoG1ConfigDto): number {
    switch (config.tipoAgrupacion) {
      case TipoAgrupacionDesgaste.TRAMO:
        return config.tramoId!;
      case TipoAgrupacionDesgaste.CURVA_HORIZONTAL:
        return config.curvaHorizontalId!;
      case TipoAgrupacionDesgaste.CURVA_VERTICAL:
        return config.curvaVerticalId!;
      default:
        return config.tramoId!;
    }
  }

  private esConfiguracionBase(config: GraficoG1ConfigDto): boolean {
    return (
      config.tipoAgrupacion === CONFIG_BASE_G1.tipoAgrupacion &&
      config.tramoId === CONFIG_BASE_G1.tramoId &&
      config.via === CONFIG_BASE_G1.via &&
      JSON.stringify(config.puntosW) === JSON.stringify(CONFIG_BASE_G1.puntosW)
    );
  }

  // ----------------------------------------------------------
  // VALIDACIÓN DE EXISTENCIA DEL ID
  // ----------------------------------------------------------

  private async validarExistencia(
    tipo: TipoAgrupacionDesgaste,
    id: number,
  ): Promise<void> {
    let existe = false;

    switch (tipo) {
      case TipoAgrupacionDesgaste.TRAMO: {
        const t = await this.tramosRepo.findOne({ where: { id } });
        existe = !!t;
        break;
      }
      case TipoAgrupacionDesgaste.CURVA_HORIZONTAL: {
        const c = await this.curvasHRepo.findOne({ where: { id } });
        existe = !!c;
        break;
      }
      case TipoAgrupacionDesgaste.CURVA_VERTICAL: {
        const c = await this.curvasVRepo.findOne({ where: { id } });
        existe = !!c;
        break;
      }
    }

    if (!existe) {
      throw new NotFoundException(
        `${tipo} con ID ${id} no encontrado`,
      );
    }
  }

  // ----------------------------------------------------------
  // MTB ACUMULADO DEL ESCENARIO REAL
  // ----------------------------------------------------------

  private async cargarMtbAcumuladoReal(): Promise<Map<number, number>> {
    const real = await this.escenariosRepo.buscarPorNombre(ESCENARIO_REAL_NOMBRE);
    if (!real || real.eliminado) {
      throw new BadRequestException(
        `El escenario '${ESCENARIO_REAL_NOMBRE}' no está disponible. ` +
        `Es necesario para construir el eje X de este gráfico.`,
      );
    }

    const valores = await this.valoresRepo.listarPorEscenario(real.id);
    if (valores.length === 0) {
      throw new BadRequestException(
        `El escenario '${ESCENARIO_REAL_NOMBRE}' no tiene valores anuales cargados. ` +
        `Cargue los valores antes de generar este gráfico.`,
      );
    }

    let acum = 0;
    const mapa = new Map<number, number>();
    for (const v of valores) {
      acum += parseFloat(v.mtb);
      mapa.set(v.anio, Math.round(acum * 1000) / 1000);
    }
    return mapa;
  }

  // ----------------------------------------------------------
  // ÚLTIMO TRIMESTRE POR (elemento, año)
  // ----------------------------------------------------------

  private tomarUltimoTrimestrePorAnio(
    mediciones: Array<{
      elementoId: number;
      codigoElemento: number;
      anio: number;
      trimestre: number;
      w1: number | null;
      w2: number | null;
      w3r: number | null;
      w3l: number | null;
    }>,
  ): Map<
    number,
    Map<
      number,
      {
        codigoElemento: number;
        anio: number;
        trimestre: number;
        w1: number | null;
        w2: number | null;
        w3r: number | null;
        w3l: number | null;
      }
    >
  > {
    const result = new Map<number, Map<number, any>>();

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
  ): GraficoG1SerieDto[] {
    const series: GraficoG1SerieDto[] = [];

    const elementos = Array.from(ultimasPorElementoYAnio.entries()).sort(
      (a, b) => {
        const codA = this.primerCodigoElemento(a[1]);
        const codB = this.primerCodigoElemento(b[1]);
        return codA - codB;
      },
    );

    for (const [, porAnio] of elementos) {
      const codigoElemento = this.primerCodigoElemento(porAnio);

      for (const punto of puntosW) {
        const puntos = this.construirPuntosLinea(porAnio, punto, mtbAcumuladoPorAnio);
        if (puntos.length === 0) continue;

        series.push({
          codigo: `ELEM-${codigoElemento}-${punto}`,
          nombre: `Elem. ${codigoElemento} - ${punto}`,
          codigoElemento,
          punto,
          puntos,
        });
      }
    }

    return series;
  }

  private construirPuntosLinea(
    porAnio: Map<number, any>,
    punto: PuntoW,
    mtbAcumuladoPorAnio: Map<number, number>,
  ): GraficoG1PuntoDto[] {
    const puntos: GraficoG1PuntoDto[] = [];
    const aniosOrdenados = [...porAnio.keys()].sort((a, b) => a - b);

    for (const anio of aniosOrdenados) {
      const fila = porAnio.get(anio);
      const valorW = this.obtenerValorPunto(fila, punto);
      const mtbAcum = mtbAcumuladoPorAnio.get(anio);

      if (valorW === null || valorW === undefined || mtbAcum === undefined) continue;

      puntos.push({
        x: mtbAcum,
        y: Math.round(valorW * 100) / 100,
        anio,
      });
    }

    return puntos;
  }

  private obtenerValorPunto(fila: any, punto: PuntoW): number | null {
    switch (punto) {
      case PuntoW.W1: return fila.w1;
      case PuntoW.W2: return fila.w2;
      case PuntoW.W3R: return fila.w3r;
      case PuntoW.W3L: return fila.w3l;
      default: return null;
    }
  }

  private primerCodigoElemento(porAnio: Map<number, any>): number {
    for (const fila of porAnio.values()) {
      return fila.codigoElemento;
    }
    return 0;
  }

  // ----------------------------------------------------------
  // RESPUESTA SIN DATOS
  // ----------------------------------------------------------

  private respuestaSinDatos(config: GraficoG1ConfigDto): GraficoG1ResponseDto {
    return {
      configAplicada: config,
      series: [],
      metadata: {
        totalLineas: 0,
        totalMediciones: 0,
        toleranciaMm: TOLERANCIA_MAXIMA_MM,
        calculadoEn: new Date(),
      },
    };
  }
}