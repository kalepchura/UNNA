import { Injectable, NotFoundException } from '@nestjs/common';
import { TramosService } from '../../modules/catalogos/tramos/services/tramos.service';
import { CurvasHorizontalesService } from '../../modules/catalogos/curvas-horizontales/services/curvas-horizontales.service';
import { CurvasVerticalesService } from '../../modules/catalogos/curvas-verticales/services/curvas-verticales.service';
import { VelocidadesService } from '../../modules/catalogos/velocidades/services/velocidades.service';
import { TipoVia } from '../enums';

/**
 * Resultado del cálculo de contexto geográfico.
 */
export interface ContextoGeografico {
  tramoId: number;
  curvaHorizontalId: number | null;
  curvaVerticalId: number | null;
  velocidadKmh: number | null;
}

/**
 * ============================================================
 * GeolocalizacionService
 * ============================================================
 * Servicio compartido que dado (progresiva, via) calcula:
 *  - tramoId (obligatorio: si la progresiva no cae en ningún tramo, se rechaza)
 *  - curvaHorizontalId (puede ser null = tramo en tangente)
 *  - curvaVerticalId (puede ser null = sin curva vertical en ese punto)
 *  - velocidadKmh (puede ser null si no hay rango definido)
 *
 * Lo usan: FallaRiel, Temperatura (asignación de tramo) y Desgaste.
 *
 * Referencia: Informe sección 9.1.3.
 * ============================================================
 */
@Injectable()
export class GeolocalizacionService {
  constructor(
    private readonly tramosService: TramosService,
    private readonly curvasHService: CurvasHorizontalesService,
    private readonly curvasVService: CurvasVerticalesService,
    private readonly velocidadesService: VelocidadesService,
  ) {}

  /**
   * Calcula el contexto geográfico completo para una progresiva y vía dadas.
   *
   * Lanza NotFoundException si la progresiva no pertenece a ningún tramo
   * registrado (eso indica error de captura del usuario).
   */
  async calcular(
    progresiva: number,
    via: TipoVia,
  ): Promise<ContextoGeografico> {
    // 1. Tramo (obligatorio)
    // resolverPorProgresiva ya lanza 404 si no encuentra
    const tramo = await this.tramosService.resolverPorProgresiva(progresiva);

    // 2. Curva horizontal (opcional, puede ser null = tangente)
    const curvaH = await this.curvasHService.resolverPorProgresivaYVia(
      progresiva, via,
    );

    // 3. Curva vertical (opcional, puede ser null)
    const curvaV = await this.curvasVService.resolverPorProgresivaYVia(
      progresiva, via,
    );

    // 4. Velocidad (opcional, puede ser null si no hay rango)
    const velocidad = await this.velocidadesService.resolverPorProgresiva(progresiva);

    return {
      tramoId: tramo.id,
      curvaHorizontalId: curvaH?.id ?? null,
      curvaVerticalId: curvaV?.id ?? null,
      velocidadKmh: velocidad?.velocidadKmh ?? null,
    };
  }
}