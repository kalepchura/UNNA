import { Injectable } from '@nestjs/common';
import { DesgasteAnalyticsRepository } from '../repositories/desgaste-analytics.repository';
import {
  KpisDesgasteResponseDto,
  KpiZonaRojaDto,
  KpiMayorDesgasteDto,
  KpiSinMedicionUltimoAnioDto,
} from '../dto/kpis/kpis-desgaste-response.dto';
import {
  NivelAlertaColor,
  PuntoW,
} from '../../../common/enums';
import {
  DESGASTE_KPI,
} from '../../../common/constants/desgaste.constants';

@Injectable()
export class KpisDesgasteService {
  // ──── Caché en memoria (mismo TTL que fallas y temperatura) ────
  private cache: { data: KpisDesgasteResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly analyticsRepo: DesgasteAnalyticsRepository,
  ) {}

  /**
   * Calcula los 3 KPIs usando caché de 5 minutos.
   * Si la caché está vigente, devuelve el resultado almacenado sin consultar la BD.
   */
  async calcularTodos(): Promise<KpisDesgasteResponseDto> {
    const ahora = Date.now();
    if (this.cache.data && this.cache.expira > ahora) {
      return this.cache.data;
    }

    const result = await this.calcularDesdeBD();
    this.cache = {
      data: result,
      expira: ahora + this.TTL_MS,
    };
    return result;
  }

  /**
   * Invalida la caché manualmente.
   * (Se debe llamar cuando se importen nuevas mediciones o se modifiquen datos).
   */
  invalidarCache(): void {
    this.cache = { data: null, expira: 0 };
  }

  // ──────────────────────────────────────────────────────
  // Cálculo real desde BD (privado)
  // ──────────────────────────────────────────────────────

  private async calcularDesdeBD(): Promise<KpisDesgasteResponseDto> {
    const [zonaRoja, mayorDesgaste, sinMedicion] = await Promise.all([
      this.calcularZonaRoja(),
      this.calcularMayorDesgaste(),
      this.calcularSinMedicionUltimoAnio(),
    ]);

    return {
      zonaRoja,
      mayorDesgaste,
      sinMedicionUltimoAnio: sinMedicion,
      calculadoEn: new Date(),
    };
  }

  // ----------------------------------------------------------
  // KPI 1
  // ----------------------------------------------------------

  private async calcularZonaRoja(): Promise<KpiZonaRojaDto> {
    const cantidad = await this.analyticsRepo.contarElementosEnZonaRoja();

    let color: NivelAlertaColor;
    if (cantidad >= DESGASTE_KPI.KPI1.UMBRAL_ROJO) color = NivelAlertaColor.ROJO;
    else if (cantidad >= DESGASTE_KPI.KPI1.UMBRAL_AMARILLO) color = NivelAlertaColor.AMARILLO;
    else color = NivelAlertaColor.VERDE;

    return { cantidad, color };
  }

  // ----------------------------------------------------------
  // KPI 2
  // ----------------------------------------------------------

  private async calcularMayorDesgaste(): Promise<KpiMayorDesgasteDto> {
    const elem = await this.analyticsRepo.obtenerElementoMayorDesgaste();

    if (!elem) {
      return {
        codigoElemento: null,
        tramoCodigo: null,
        tramoNombre: null,
        via: null,
        punto: null,
        valorMm: null,
        anio: null,
        trimestre: null,
        color: NivelAlertaColor.GRIS,
      };
    }

    let color: NivelAlertaColor;
    if (elem.valor > DESGASTE_KPI.KPI2.UMBRAL_ROJO) color = NivelAlertaColor.ROJO;
    else if (elem.valor >= DESGASTE_KPI.KPI2.UMBRAL_AMARILLO) color = NivelAlertaColor.AMARILLO;
    else color = NivelAlertaColor.VERDE;

    return {
      codigoElemento: elem.codigoElemento,
      tramoCodigo: elem.tramoCodigo,
      tramoNombre: elem.tramoNombre,
      via: elem.via,
      punto: elem.punto as PuntoW,
      valorMm: Math.round(elem.valor * 100) / 100,
      anio: elem.anio,
      trimestre: elem.trimestre,
      color,
    };
  }

  // ----------------------------------------------------------
  // KPI 3
  // ----------------------------------------------------------

  private async calcularSinMedicionUltimoAnio(): Promise<KpiSinMedicionUltimoAnioDto> {
    const anioMax = await this.analyticsRepo.obtenerAnioMaximoRegistrado();

    if (anioMax === null) {
      return {
        cantidad: 0,
        anioReferencia: null,
        color: NivelAlertaColor.VERDE,
        primerosElementos: [],
      };
    }

    const { cantidad, primeros } = await this.analyticsRepo.obtenerElementosSinMedicionEnAnio(
      anioMax,
      50,
    );

    let color: NivelAlertaColor;
    if (cantidad >= DESGASTE_KPI.KPI3.UMBRAL_ROJO) color = NivelAlertaColor.ROJO;
    else if (cantidad >= DESGASTE_KPI.KPI3.UMBRAL_AMARILLO) color = NivelAlertaColor.AMARILLO;
    else color = NivelAlertaColor.VERDE;

    return {
      cantidad,
      anioReferencia: anioMax,
      color,
      primerosElementos: primeros,
    };
  }
}