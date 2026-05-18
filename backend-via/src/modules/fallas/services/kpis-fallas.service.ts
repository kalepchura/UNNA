import { Injectable } from '@nestjs/common';
import { FallasAnalyticsRepository } from '../repositories/fallas-analytics.repository';
import {
  KpisFallasResponseDto,
  KpiTotalMesActualDto,
  KpiTramoTopDto,
  KpiSoldadurasSinAccionDto,
} from '../dto/kpis/kpis-fallas-response.dto';
import { NivelAlertaColor } from '../../../common/enums';

const UMBRAL_AMARILLO = 6;
const UMBRAL_ROJO = 16;

@Injectable()
export class KpisFallasService {
  private cache: { data: KpisFallasResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000;

  // ✅ CONSTRUCTOR AGREGADO
  constructor(private readonly analyticsRepo: FallasAnalyticsRepository) {}

  async calcularTodos(): Promise<KpisFallasResponseDto> {
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

  invalidarCache(): void {
    this.cache = { data: null, expira: 0 };
  }

  private async calcularDesdeBD(): Promise<KpisFallasResponseDto> {
    const [totalMesActual, tramoTop, soldadurasSinAccion] = await Promise.all([
      this.calcularTotalMesActual(),
      this.calcularTramoTop12Meses(),
      this.calcularSoldadurasSinAccion(),
    ]);

    return {
      totalMesActual,
      tramoTop,
      soldadurasSinAccion,
      calculadoEn: new Date(),
    };
  }

  private async calcularTotalMesActual(): Promise<KpiTotalMesActualDto> {
    const { inicio, fin } = this.getRangoMesActual();

    const { riel, soldadura } = await this.analyticsRepo.contarTotalEnRango(inicio, fin);
    const total = riel + soldadura;

    let color: NivelAlertaColor;
    if (total >= UMBRAL_ROJO) color = NivelAlertaColor.ROJO;
    else if (total >= UMBRAL_AMARILLO) color = NivelAlertaColor.AMARILLO;
    else color = NivelAlertaColor.VERDE;

    return {
      total,
      color,
      periodo: this.formatearMesAnio(inicio),
    };
  }

  private async calcularTramoTop12Meses(): Promise<KpiTramoTopDto> {
    const { inicio, fin } = this.getRangoUltimos12Meses();

    const tramo = await this.analyticsRepo.obtenerTramoConMasFallas(inicio, fin);

    return {
      tramoCodigo: tramo?.codigo ?? null,
      tramoNombre: tramo?.nombre ?? null,
      cantidadFallas: tramo?.total ?? 0,
      rango: `${this.formatearMesAnio(inicio)} - ${this.formatearMesAnio(fin)}`,
    };
  }

  private async calcularSoldadurasSinAccion(): Promise<KpiSoldadurasSinAccionDto> {
    const cantidad = await this.analyticsRepo.contarSoldadurasSinAccion();
    return {
      cantidad,
      critico: cantidad >= 1,
    };
  }

  private getRangoMesActual(): { inicio: Date; fin: Date } {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    return { inicio, fin };
  }

  private getRangoUltimos12Meses(): { inicio: Date; fin: Date } {
    const hoy = new Date();
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 11, 1);
    return { inicio, fin };
  }

  private formatearMesAnio(fecha: Date): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }
}