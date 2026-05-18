import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MtbEscenarioRepository } from '../repositories/mtb-escenario.repository';
import { EscenarioMTB } from '../entities/escenario-mtb.entity';

import { GraficoG2RequestDto } from '../dto/graficos/grafico-2/grafico-g2-request.dto';
import {
  GraficoG2ResponseDto,
  GraficoG2SerieDto,
} from '../dto/graficos/grafico-2/grafico-g2-response.dto';
import { GraficoG2ConfigDto } from '../dto/graficos/grafico-2/grafico-g2-config.dto';
import { mergeConfig } from '../../../common/helpers/config-merge.helper';
import { calcularMtbAcumulado } from '../helpers/mtb-acumulado.helper';

// Configuración base: solo el escenario REAL (ID 1)
const CONFIG_BASE_G2: GraficoG2ConfigDto = {
  escenarioIds: [1],
};

@Injectable()
export class GraficoG2Service {
  private cacheBase: { data: GraficoG2ResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly valoresRepo: MtbEscenarioRepository,
    @InjectRepository(EscenarioMTB)
    private readonly escenarioRepo: Repository<EscenarioMTB>,
  ) {}

  async calcular(request: GraficoG2RequestDto): Promise<GraficoG2ResponseDto> {
    // 1. Merge con defaults
    const config = mergeConfig(CONFIG_BASE_G2, request.config);

    // 2. Resolver escenarios según convención []/undefined/[ids]
    const escenarios = await this.resolverEscenarios(config.escenarioIds);

    if (escenarios.length === 0) {
      return this.respuestaVacia(config);
    }

    // 3. Determinar si es configuración base (para caché)
    const esConfigBase = this.esConfiguracionBase(config);

    if (esConfigBase) {
      const ahora = Date.now();
      if (this.cacheBase.data && this.cacheBase.expira > ahora) {
        return this.cacheBase.data;
      }
    }

    // 4. Cargar valores y calcular MTB acumulado por escenario
    const datosPorEscenario = new Map<number, Map<number, number>>();
    const todosLosAnios = new Set<number>();

    for (const esc of escenarios) {
      const valores = await this.valoresRepo.listarPorEscenario(esc.id);
      const valoresNumericos = valores.map(v => ({
        anio: v.anio,
        mtb: parseFloat(v.mtb),
      }));
      const acumulados = calcularMtbAcumulado(valoresNumericos);
      const mapa = new Map<number, number>();
      for (const a of acumulados) {
        mapa.set(a.anio, a.mtbAcumulado);
        todosLosAnios.add(a.anio);
      }
      datosPorEscenario.set(esc.id, mapa);
    }

    // 5. Eje X = unión de años
    const aniosOrdenados = [...todosLosAnios].sort((a, b) => a - b);
    const categorias = aniosOrdenados.map(String);

    // 6. Construir series
    const series: GraficoG2SerieDto[] = escenarios.map(esc => {
      const mapa = datosPorEscenario.get(esc.id) ?? new Map();
      const datos = aniosOrdenados.map(anio => mapa.get(anio) ?? null);
      return {
        codigo: esc.nombre,
        nombre: esc.nombre,
        datos,
      };
    });

    const respuesta: GraficoG2ResponseDto = {
      configAplicada: config,
      categorias,
      series,
      metadata: {
        totalEscenarios: escenarios.length,
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

  // ============ helpers ============

  /**
   * Resuelve la lista de escenarios según la convención:
   *  undefined -> [escenario REAL] (ID 1)
   *  []        -> todos los activos (no eliminados)
   *  [ids]     -> esos IDs (valida existencia y que no estén eliminados)
   */
  private async resolverEscenarios(ids: number[] | undefined): Promise<EscenarioMTB[]> {
    if (ids === undefined) {
      const real = await this.escenarioRepo.findOne({ where: { id: 1 } });
      return real && !real.eliminado ? [real] : [];
    }

    if (ids.length === 0) {
      return this.escenarioRepo.find({
        where: { eliminado: false },
        order: { nombre: 'ASC' },
      });
    }

    const result: EscenarioMTB[] = [];
    for (const id of ids) {
      const esc = await this.escenarioRepo.findOne({ where: { id } });
      if (!esc) throw new NotFoundException(`Escenario con ID ${id} no encontrado`);
      if (esc.eliminado) throw new NotFoundException(`Escenario con ID ${id} está eliminado`);
      result.push(esc);
    }
    return result;
  }

  private esConfiguracionBase(config: GraficoG2ConfigDto): boolean {
    return (
      JSON.stringify(config.escenarioIds) === JSON.stringify(CONFIG_BASE_G2.escenarioIds)
    );
  }

  private respuestaVacia(config: GraficoG2ConfigDto): GraficoG2ResponseDto {
    return {
      configAplicada: config,
      categorias: [],
      series: [],
      metadata: { totalEscenarios: 0, calculadoEn: new Date() },
    };
  }
}