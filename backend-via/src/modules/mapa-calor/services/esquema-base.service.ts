import { Injectable } from '@nestjs/common';
import { TramosService } from '../../catalogos/tramos/services/tramos.service';
import { EstacionesService } from '../../catalogos/estaciones/services/estaciones.service';
import {
  EsquemaBaseResponseDto,
  TramoEsquemaDto,
  EstacionEsquemaDto,
} from '../dto/esquema-base/esquema-base-response.dto';

/**
 * ============================================================
 * EsquemaBaseService
 * ============================================================
 * Devuelve el esquema lineal base de la Línea 1 que el frontend
 * usa para dibujar el SVG del Mapa de Calor.
 *
 * No tiene filtros: la geometría de la vía no cambia con los
 * filtros del usuario. Por eso el endpoint es GET (cacheable).
 *
 * Reutiliza los services de los catálogos correspondientes.
 * ============================================================
 */
@Injectable()
export class EsquemaBaseService {
  constructor(
    private readonly tramosService: TramosService,
    private readonly estacionesService: EstacionesService,
  ) {}

  async obtenerEsquemaBase(): Promise<EsquemaBaseResponseDto> {
    // 1. Cargar tramos del catálogo (ordenados por su orden interno
    //    o por progresiva inicial; ambos coinciden en práctica)
    const tramos = await this.tramosService.listarTodos();

    // 2. Cargar estaciones (ordenadas por progresiva)
    const estaciones = await this.estacionesService.listarTodas();

    // 3. Mapear tramos a la estructura mínima del esquema
    const tramosEsquema: TramoEsquemaDto[] = tramos
      .map((t) => ({
        codigo: t.codigo,
        nombre: t.nombre,
        progresivaInicio: t.progresivaInicio,
        progresivaFin: t.progresivaFin,
      }))
      // Orden defensivo por progresiva ascendente
      .sort((a, b) => a.progresivaInicio - b.progresivaInicio);

    // 4. Mapear estaciones
    const estacionesEsquema: EstacionEsquemaDto[] = estaciones
      .map((e) => ({
        codigo: e.codigo,
        nombre: e.nombre,
        progresiva: e.progresiva,
      }))
      .sort((a, b) => a.progresiva - b.progresiva);

    // 5. Calcular extremos del eje
    //    Mínima: 0 si no hay tramos, sino el inicio del primer tramo
    //    Máxima: el fin del último tramo
    const progresivaMinima = tramosEsquema.length > 0 ? tramosEsquema[0].progresivaInicio : 0;
    const progresivaMaxima = tramosEsquema.length > 0
      ? tramosEsquema[tramosEsquema.length - 1].progresivaFin
      : 0;

    return {
      progresivaMinima,
      progresivaMaxima,
      tramos: tramosEsquema,
      estaciones: estacionesEsquema,
      totalTramos: tramosEsquema.length,
      totalEstaciones: estacionesEsquema.length,
      generadoEn: new Date(),
    };
  }
}