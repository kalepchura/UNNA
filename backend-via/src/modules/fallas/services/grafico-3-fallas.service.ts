// backend/src/modules/fallas/services/grafico-3-fallas.service.ts

import { Injectable } from '@nestjs/common';
import { FallasAnalyticsRepository } from '../repositories/fallas-analytics.repository';
import { Grafico3RequestDto } from '../dto/graficos/grafico-3/grafico-3-request.dto';
import {
  Grafico3ResponseDto,
  Grafico3SerieDto,
} from '../dto/graficos/grafico-3/grafico-3-response.dto';
import { Grafico3ConfigDto } from '../dto/graficos/grafico-3/grafico-3-config.dto';
import { TipoFallaFiltro } from '../../../common/enums';
import { VelocidadesService } from '../../catalogos/velocidades/services/velocidades.service';
import {
  validarConfigBase,
  resolverTipoFalla,
  resolverViaFiltro,
  columnasPorNivel,
} from '../helpers/graficos.helper';

@Injectable()
export class Grafico3FallasService {
  constructor(
    private readonly analyticsRepo: FallasAnalyticsRepository,
    private readonly velocidadesService: VelocidadesService,
  ) {}

  async calcular(request: Grafico3RequestDto): Promise<Grafico3ResponseDto> {
    const config = request.config;

    // Catálogo de velocidades siempre se carga (define el eje X).
    const velocidades = (await this.velocidadesService.listarParaFiltro()).sort((a, b) => a - b);
    const categorias = velocidades.map((v) => `${v} km/h`);

    if (!config) {
      return this.respuestaVacia(categorias, 'Configura los filtros y pulsa Aplicar.');
    }

    const v = validarConfigBase(config);
    if (!v.ok) {
      return this.respuestaVacia(categorias, v.mensaje, config.nivel);
    }

    if (!config.fechaDesde || !config.fechaHasta) {
      return this.respuestaVacia(categorias, 'Especifica fecha desde y fecha hasta.', config.nivel);
    }

    return this.calcularDesdeBD(config, velocidades, categorias);
  }

  // ----------------------------------------------------------
  // Cálculo principal
  // ----------------------------------------------------------
  private async calcularDesdeBD(
    config: Grafico3ConfigDto,
    velocidades: number[],
    categorias: string[],
  ): Promise<Grafico3ResponseDto> {
    const { incluirRiel, incluirSoldadura } = resolverTipoFalla(config.nivel, config.tipoFalla);
    const viaFiltro = resolverViaFiltro(config.tipoVia);
    const cols = columnasPorNivel(config.nivel);

    if (!incluirRiel && !incluirSoldadura) {
      return this.respuestaVacia(categorias, 'Sin tablas que aporten datos a este nivel.', config.nivel);
    }

    const fechaDesde = this.parsearFecha(config.fechaDesde);
    const fechaHasta = this.parsearFecha(config.fechaHasta);

    const filas = await this.analyticsRepo.fallasG3PorVelocidad({
      fechaDesde, fechaHasta,
      incluirRiel, incluirSoldadura,
      viaFiltro,
      elementoIds: config.elementoIds,
      cols,
    });

    // apilarPorTipo solo tiene sentido si AMBAS están incluidas.
    const puedeApilar = incluirRiel && incluirSoldadura;
    const apilar = (config.apilarPorTipo ?? false) && puedeApilar;

    const series = apilar
      ? this.armarApilado(filas, velocidades)
      : this.armarTotal(filas, velocidades);

    const totalFallas = filas.reduce((acc, f) => acc + f.total, 0);

    return {
      categorias,
      series,
      metadata: { totalFallas, calculadoEn: new Date(), nivel: config.nivel },
    };
  }

  private armarTotal(
    filas: Array<{ velocidad: number; tipo: string; total: number }>,
    velocidades: number[],
  ): Grafico3SerieDto[] {
    const datos = velocidades.map((v) =>
      filas.filter((f) => f.velocidad === v).reduce((acc, f) => acc + f.total, 0),
    );
    return [{ nombre: 'Total', codigo: 'TOTAL', datos }];
  }

  private armarApilado(
    filas: Array<{ velocidad: number; tipo: string; total: number }>,
    velocidades: number[],
  ): Grafico3SerieDto[] {
    const total = (v: number, tipo: 'RIEL' | 'SOLDADURA'): number => {
      const fila = filas.find((f) => f.velocidad === v && f.tipo === tipo);
      return fila?.total ?? 0;
    };
    return [
      { nombre: 'Riel',      codigo: 'RIEL',      datos: velocidades.map((v) => total(v, 'RIEL')) },
      { nombre: 'Soldadura', codigo: 'SOLDADURA', datos: velocidades.map((v) => total(v, 'SOLDADURA')) },
    ];
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  private parsearFecha(fecha: string): Date {
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private respuestaVacia(
    categorias: string[],
    mensaje: string,
    nivel?: Grafico3ConfigDto['nivel'],
  ): Grafico3ResponseDto {
    return {
      categorias,
      series: [],
      metadata: { totalFallas: 0, calculadoEn: new Date(), nivel, mensaje },
    };
  }
}