import { Injectable } from '@nestjs/common';
import { TemperaturaAnalyticsRepository } from '../repositories/temperatura-analytics.repository';
import {
  KpisTemperaturaResponseDto,
  KpiMaximaUltimoMesDto,
  KpiZonasAlertaAnioDto,
  KpiDiasConsecutivosDto,
} from '../dto/kpis/kpis-temperatura-response.dto';
import { NivelAlertaColor } from '../../../common/enums';
import { TEMPERATURA_KPI } from '../../../common/constants/temperatura.constants';

@Injectable()
export class KpisTemperaturaService {
  // ──── Caché en memoria (mismo TTL que fallas) ────
  private cache: { data: KpisTemperaturaResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly analyticsRepo: TemperaturaAnalyticsRepository,
  ) {}

  /**
   * Calcula los 3 KPIs usando caché de 5 minutos.
   * Si la caché está vigente, devuelve el resultado almacenado sin consultar la BD.
   */
  async calcularTodos(): Promise<KpisTemperaturaResponseDto> {
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
   * (Se debe llamar cuando se importen nuevos datos o se modifiquen registros).
   */
  invalidarCache(): void {
    this.cache = { data: null, expira: 0 };
  }

  // ──────────────────────────────────────────────────────
  // Cálculo real desde BD (privado)
  // ──────────────────────────────────────────────────────

  private async calcularDesdeBD(): Promise<KpisTemperaturaResponseDto> {
    const [maximaUltimoMes, zonasAlertaAnio, diasConsecutivos] = await Promise.all([
      this.calcularMaximaUltimoMes(),
      this.calcularZonasAlertaAnio(),
      this.calcularDiasConsecutivos(),
    ]);

    return {
      maximaUltimoMes,
      zonasAlertaAnio,
      diasConsecutivos,
      calculadoEn: new Date(),
    };
  }

  // ----------------------------------------------------------
  // KPI 1
  // ----------------------------------------------------------

  private async calcularMaximaUltimoMes(): Promise<KpiMaximaUltimoMesDto> {
    const { desde, hasta } = this.getRangoUltimos30Dias();

    const reg = await this.analyticsRepo.obtenerMaxEnRango(desde, hasta);

    if (!reg) {
      return {
        valorCelsius: null,
        progresiva: null,
        tramoCodigo: null,
        tramoNombre: null,
        fecha: null,
        color: NivelAlertaColor.GRIS,
        rango: this.formatearRango(desde, hasta),
      };
    }

    const valor = reg.temperatura;
    let color: NivelAlertaColor;
    if (valor >= TEMPERATURA_KPI.KPI1.UMBRAL_ROJO) color = NivelAlertaColor.ROJO;
    else if (valor >= TEMPERATURA_KPI.KPI1.UMBRAL_AMARILLO) color = NivelAlertaColor.AMARILLO;
    else color = NivelAlertaColor.VERDE;

    return {
      valorCelsius: valor,
      progresiva: reg.progresiva,
      tramoCodigo: reg.tramoCodigo,
      tramoNombre: reg.tramoNombre,
      fecha: reg.fecha,
      color,
      rango: this.formatearRango(desde, hasta),
    };
  }

  // ----------------------------------------------------------
  // KPI 2
  // ----------------------------------------------------------

  private async calcularZonasAlertaAnio(): Promise<KpiZonasAlertaAnioDto> {
    const { desde, hasta, anio } = this.getRangoAnioActual();

    const tramos = await this.analyticsRepo.obtenerTramosEnAlerta(desde, hasta);
    const cantidad = tramos.length;

    let color: NivelAlertaColor;
    if (cantidad >= TEMPERATURA_KPI.KPI2.UMBRAL_ROJO) color = NivelAlertaColor.ROJO;
    else if (cantidad >= TEMPERATURA_KPI.KPI2.UMBRAL_AMARILLO) color = NivelAlertaColor.AMARILLO;
    else color = NivelAlertaColor.VERDE;

    return {
      cantidad,
      color,
      anio,
      tramos,
    };
  }

  // ----------------------------------------------------------
  // KPI 3
  // ----------------------------------------------------------

  private async calcularDiasConsecutivos(): Promise<KpiDiasConsecutivosDto> {
    // Paso 1: identificar tramo más crítico (mayor promedio últimos 30 días)
    const { desde, hasta } = this.getRangoUltimos30Dias();
    const tramoCritico = await this.analyticsRepo.obtenerTramoConMayorPromedio(desde, hasta);

    if (!tramoCritico) {
      return {
        dias: 0,
        color: NivelAlertaColor.VERDE,
        tramoCodigo: null,
        tramoNombre: null,
        promedioCelsius: null,
      };
    }

    // Paso 2: obtener días con alerta para ese tramo
    const diasAlerta = await this.analyticsRepo.obtenerDiasEnAlertaPorTramo(
      tramoCritico.tramoId,
      60,
    );

    // Paso 3: contar días consecutivos hasta HOY
    const dias = this.contarDiasConsecutivosHastaHoy(diasAlerta);

    let color: NivelAlertaColor;
    if (dias >= TEMPERATURA_KPI.KPI3.UMBRAL_ROJO) color = NivelAlertaColor.ROJO;
    else if (dias >= TEMPERATURA_KPI.KPI3.UMBRAL_AMARILLO) color = NivelAlertaColor.AMARILLO;
    else color = NivelAlertaColor.VERDE;

    return {
      dias,
      color,
      tramoCodigo: tramoCritico.codigo,
      tramoNombre: tramoCritico.nombre,
      promedioCelsius: tramoCritico.promedio,
    };
  }

  // ──── HELPERS DE FECHAS ────

  private getRangoUltimos30Dias(): { desde: Date; hasta: Date } {
    const hasta = this.normalizarFinDia(new Date());
    const desde = new Date(hasta);
    desde.setDate(desde.getDate() - 30);
    desde.setHours(0, 0, 0, 0);
    return { desde, hasta };
  }

  private getRangoAnioActual(): { desde: Date; hasta: Date; anio: number } {
    const anio = new Date().getFullYear();
    const desde = new Date(anio, 0, 1);
    const hasta = new Date(anio, 11, 31, 23, 59, 59, 999);
    return { desde, hasta, anio };
  }

  private normalizarFinDia(d: Date): Date {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  }

  private formatearRango(desde: Date, hasta: Date): string {
    return `${this.formatearDiaCorto(desde)} - ${this.formatearDiaCorto(hasta)}`;
  }

  private formatearDiaCorto(d: Date): string {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  // ──── HELPER: días consecutivos ────

  private contarDiasConsecutivosHastaHoy(fechasAlerta: Date[]): number {
    if (fechasAlerta.length === 0) return 0;

    const hoy = this.fechaSinHora(new Date());
    const fechasSet = new Set(
      fechasAlerta.map((f) => this.fechaSinHora(f).toISOString()),
    );

    let dias = 0;
    let cursor = new Date(hoy);

    while (fechasSet.has(cursor.toISOString())) {
      dias++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return dias;
  }

  private fechaSinHora(d: Date): Date {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }
}