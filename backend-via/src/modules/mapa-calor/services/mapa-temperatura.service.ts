import { Injectable } from '@nestjs/common';
import { TramosService } from '../../catalogos/tramos/services/tramos.service';
import { MapaCalorRepository } from '../repositories/mapa-calor.repository';
import {
  MapaTemperaturaRequestDto,
  TipoValorTemperatura,
} from '../dto/temperatura/mapa-temperatura-request.dto';
import {
  MapaTemperaturaResponseDto,
  TramoColoreadoTemperaturaDto,
} from '../dto/temperatura/mapa-temperatura-response.dto';
import { NivelAlertaColor } from '../../../common/enums';
import { MAPA_TEMPERATURA } from '../../../common/constants/mapa-calor.constants';

@Injectable()
export class MapaTemperaturaService {
  private cacheBase: { data: MapaTemperaturaResponseDto | null; expira: number } = {
    data: null,
    expira: 0,
  };
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly tramosService: TramosService,
    private readonly mapaRepo: MapaCalorRepository,
  ) {}

  async calcular(request: MapaTemperaturaRequestDto): Promise<MapaTemperaturaResponseDto> {
    const fechaDesde = request.fechaDesde ?? this.primerDiaDelAnio();
    const fechaHasta = request.fechaHasta ?? this.hoyIso();
    const tipoValor = request.tipoValor ?? TipoValorTemperatura.PROMEDIO;

    const esBase = !request.fechaDesde && !request.fechaHasta && !request.tipoValor;
    if (esBase) {
      const ahora = Date.now();
      if (this.cacheBase.data && this.cacheBase.expira > ahora) {
        return this.cacheBase.data;
      }
    }

    const tramos = await this.tramosService.listarTodos();
    const tramosOrdenados = [...tramos].sort(
      (a, b) => a.progresivaInicio - b.progresivaInicio,
    );

    const agregacion = tipoValor === TipoValorTemperatura.MAXIMO ? 'MAX' : 'AVG';
    const filas = await this.mapaRepo.agregarPorTramo(fechaDesde, fechaHasta, agregacion);

    const datosPorTramo = new Map<number, { valor: number; cantidad: number }>();
    for (const f of filas) {
      datosPorTramo.set(f.tramoId, { valor: f.valor, cantidad: f.cantidadMediciones });
    }

    const tramosColoreados: TramoColoreadoTemperaturaDto[] = tramosOrdenados.map((t) => {
      const dato = datosPorTramo.get(t.id);
      const valor = dato ? this.redondear2(dato.valor) : null;
      const color = this.calcularColor(valor);
      return {
        codigo: t.codigo,
        nombre: t.nombre,
        progresivaInicio: t.progresivaInicio,
        progresivaFin: t.progresivaFin,
        valor,
        color,
        cantidadMediciones: dato?.cantidad ?? 0,
      };
    });

    const tramosConDatos = tramosColoreados.filter((t) => t.valor !== null).length;

    const respuesta: MapaTemperaturaResponseDto = {
      filtrosAplicados: { fechaDesde, fechaHasta, tipoValor },
      tramos: tramosColoreados,
      metadata: {
        totalTramos: tramosColoreados.length,
        tramosConDatos,
        tramosSinDatos: tramosColoreados.length - tramosConDatos,
        calculadoEn: new Date(),
      },
    };

    if (esBase) {
      this.cacheBase = { data: respuesta, expira: Date.now() + this.TTL_MS };
    }

    return respuesta;
  }

  private calcularColor(valor: number | null): NivelAlertaColor {
    if (valor === null) return NivelAlertaColor.GRIS;
    if (valor <= MAPA_TEMPERATURA.UMBRAL_VERDE_MAX) return NivelAlertaColor.VERDE;
    if (valor <= MAPA_TEMPERATURA.UMBRAL_AMARILLO_MAX) return NivelAlertaColor.AMARILLO;
    return NivelAlertaColor.ROJO;
  }

  private primerDiaDelAnio(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-01-01`;
  }

  private hoyIso(): string {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private redondear2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}