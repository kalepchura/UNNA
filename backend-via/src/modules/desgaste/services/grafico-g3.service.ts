import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DesgasteAnalyticsRepository } from '../repositories/desgaste-analytics.repository';
import { MtbEscenarioRepository } from '../repositories/mtb-escenario.repository';
import { EscenarioMTB } from '../entities/escenario-mtb.entity';
import { ElementoDesgaste } from '../../catalogos/elementos-desgaste/entities/elemento-desgaste.entity';
import { Tramo } from '../../catalogos/tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../../catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../catalogos/curvas-verticales/entities/curva-vertical.entity';

import { GraficoG3RequestDto } from '../dto/graficos/grafico-3/grafico-g3-request.dto';
import {
  GraficoG3ResponseDto,
  GraficoG3SerieDto,
  GraficoG3PuntoDto,
} from '../dto/graficos/grafico-3/grafico-g3-response.dto';
import { GraficoG3ConfigDto } from '../dto/graficos/grafico-3/grafico-g3-config.dto';
import { mergeConfig } from '../../../common/helpers/config-merge.helper';

import {
  TipoAgrupacionDesgaste,
  TipoViaFiltro,
  PuntoW,
} from '../../../common/enums';
import { TOLERANCIA_MAXIMA_MM } from '../../../common/constants/desgaste.constants';

const CONFIG_BASE_G3: GraficoG3ConfigDto = {
  tipoAgrupacion: TipoAgrupacionDesgaste.TRAMO,
  tramoId: 4,
  via: TipoViaFiltro.AMBAS,
  puntosW: [PuntoW.W1],
  escenarioId: 1, // ID del escenario REAL (ajusta si es diferente)
};

@Injectable()
export class GraficoG3Service {
  private cacheBase: { data: GraficoG3ResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly analyticsRepo: DesgasteAnalyticsRepository,
    private readonly valoresRepo: MtbEscenarioRepository,
    @InjectRepository(EscenarioMTB)
    private readonly escenarioRepo: Repository<EscenarioMTB>,
    @InjectRepository(ElementoDesgaste)
    private readonly elementosRepo: Repository<ElementoDesgaste>,
    @InjectRepository(Tramo)
    private readonly tramosRepo: Repository<Tramo>,
    @InjectRepository(CurvaHorizontal)
    private readonly curvasHRepo: Repository<CurvaHorizontal>,
    @InjectRepository(CurvaVertical)
    private readonly curvasVRepo: Repository<CurvaVertical>,
  ) {}

  async calcular(request: GraficoG3RequestDto): Promise<GraficoG3ResponseDto> {
    const config = mergeConfig(CONFIG_BASE_G3, request.config);

    // Resolver elementos si no se enviaron
    await this.resolverDefaultsDinamicos(config);

    const esConfigBase = this.esConfiguracionBase(config);

    if (esConfigBase) {
      const ahora = Date.now();
      if (this.cacheBase.data && this.cacheBase.expira > ahora) {
        return this.cacheBase.data;
      }
    }

    const agrupacionId = this.obtenerIdAgrupacion(config);
    await this.validarExistencia(config.tipoAgrupacion!, agrupacionId);

    // Cargar MTB acumulado del escenario seleccionado
    const { mtbAcumuladoPorAnio, escenarioNombre } = await this.cargarMtbAcumuladoEscenario(
      config.escenarioId!,
    );

    const mediciones = await this.analyticsRepo.medicionesConContexto(
      config.tipoAgrupacion!,
      agrupacionId,
      config.via!,
      config.elementoCodigos ?? [],
    );

    if (mediciones.length === 0) {
      return this.respuestaSinDatos(config, escenarioNombre);
    }

    const ultimasPorAnio = this.tomarUltimoTrimestrePorAnio(mediciones);
    const series = this.construirSeries(
      ultimasPorAnio,
      config.puntosW!,
      mtbAcumuladoPorAnio,
      config.escenarioId!.toString(),
    );

    const respuesta: GraficoG3ResponseDto = {
      configAplicada: config,
      series,
      metadata: {
        escenarioNombre,
        totalLineas: series.length,
        totalMediciones: mediciones.length,
        toleranciaMm: TOLERANCIA_MAXIMA_MM,
        calculadoEn: new Date(),
      },
    };

    if (esConfigBase) {
      this.cacheBase = { data: respuesta, expira: Date.now() + this.TTL_MS };
    }

    return respuesta;
  }

  invalidarCacheBase(): void {
    this.cacheBase = { data: null, expira: 0 };
  }

  // ---------- helpers ----------

  private async resolverDefaultsDinamicos(config: GraficoG3ConfigDto): Promise<void> {
    if (config.elementoCodigos && config.elementoCodigos.length > 0) return;

    const agrupacionId = this.obtenerIdAgrupacion(config);
    if (config.tipoAgrupacion === TipoAgrupacionDesgaste.TRAMO) {
      const elementos = await this.elementosRepo.find({
        where: { tramoId: agrupacionId },
        order: { progresiva: 'ASC' },
      });
      config.elementoCodigos = elementos.map(e => e.codigoElemento);
    } else {
      config.elementoCodigos = [];
    }
  }

  private obtenerIdAgrupacion(config: GraficoG3ConfigDto): number {
    switch (config.tipoAgrupacion) {
      case TipoAgrupacionDesgaste.TRAMO: return config.tramoId!;
      case TipoAgrupacionDesgaste.CURVA_HORIZONTAL: return config.curvaHorizontalId!;
      case TipoAgrupacionDesgaste.CURVA_VERTICAL: return config.curvaVerticalId!;
      default: return config.tramoId!;
    }
  }

  private esConfiguracionBase(config: GraficoG3ConfigDto): boolean {
    return (
      config.tipoAgrupacion === CONFIG_BASE_G3.tipoAgrupacion &&
      config.tramoId === CONFIG_BASE_G3.tramoId &&
      config.via === CONFIG_BASE_G3.via &&
      JSON.stringify(config.puntosW) === JSON.stringify(CONFIG_BASE_G3.puntosW) &&
      config.escenarioId === CONFIG_BASE_G3.escenarioId
    );
  }

  private async validarExistencia(tipo: TipoAgrupacionDesgaste, id: number): Promise<void> {
    let existe = false;
    if (tipo === TipoAgrupacionDesgaste.TRAMO) {
      existe = !!(await this.tramosRepo.findOne({ where: { id } }));
    } else if (tipo === TipoAgrupacionDesgaste.CURVA_HORIZONTAL) {
      existe = !!(await this.curvasHRepo.findOne({ where: { id } }));
    } else if (tipo === TipoAgrupacionDesgaste.CURVA_VERTICAL) {
      existe = !!(await this.curvasVRepo.findOne({ where: { id } }));
    }
    if (!existe) throw new NotFoundException(`${tipo} con ID ${id} no encontrado`);
  }

  private async cargarMtbAcumuladoEscenario(escenarioId: number) {
    const escenario = await this.escenarioRepo.findOne({ where: { id: escenarioId } });
    if (!escenario || escenario.eliminado) {
      throw new BadRequestException(`Escenario con ID ${escenarioId} no disponible.`);
    }
    const valores = await this.valoresRepo.listarPorEscenario(escenario.id);
    if (!valores.length) {
      throw new BadRequestException(`Escenario con ID ${escenarioId} sin valores anuales.`);
    }
    let acum = 0;
    const mapa = new Map<number, number>();
    for (const v of valores) {
      acum += parseFloat(v.mtb);
      mapa.set(v.anio, Math.round(acum * 1000) / 1000);
    }
    return { mtbAcumuladoPorAnio: mapa, escenarioNombre: escenario.nombre };
  }

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
  ): Map<number, Map<number, any>> {
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

  private construirSeries(
    ultimasPorElementoYAnio: Map<number, Map<number, any>>,
    puntosW: PuntoW[],
    mtbAcumuladoPorAnio: Map<number, number>,
    escenarioCodigo: string,
  ): GraficoG3SerieDto[] {
    const series: GraficoG3SerieDto[] = [];
    const elementos = Array.from(ultimasPorElementoYAnio.entries()).sort((a, b) => {
      const codA = this.primerCodigoElemento(a[1]);
      const codB = this.primerCodigoElemento(b[1]);
      return codA - codB;
    });

    for (const [, porAnio] of elementos) {
      const codigoElemento = this.primerCodigoElemento(porAnio);
      for (const punto of puntosW) {
        const puntos = this.construirPuntosLinea(porAnio, punto, mtbAcumuladoPorAnio);
        if (puntos.length === 0) continue;
        series.push({
          codigo: `ELEM-${codigoElemento}-${punto}-${escenarioCodigo}`,
          nombre: `Elem. ${codigoElemento} - ${punto}`,
          codigoElemento,
          punto,
          escenarioCodigo,
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
  ): GraficoG3PuntoDto[] {
    const puntos: GraficoG3PuntoDto[] = [];
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
    for (const fila of porAnio.values()) return fila.codigoElemento;
    return 0;
  }

  private respuestaSinDatos(config: GraficoG3ConfigDto, escenarioNombre: string): GraficoG3ResponseDto {
    return {
      configAplicada: config,
      series: [],
      metadata: {
        escenarioNombre,
        totalLineas: 0,
        totalMediciones: 0,
        toleranciaMm: TOLERANCIA_MAXIMA_MM,
        calculadoEn: new Date(),
      },
    };
  }
}