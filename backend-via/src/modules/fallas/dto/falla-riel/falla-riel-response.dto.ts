import { FallaRiel } from '../../entities/falla-riel.entity';
import {
  TipoVia,
  LadoRiel,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  AltaBaja,
  EstadoFalla,
  AccionRiel,
} from '../../../../common/enums';
import { AccionRielResponseDto } from '../accion-riel/accion-riel-response.dto';

export class FallaRielResponseDto {
  id!: number;
  progresiva!: number;
  via!: TipoVia;
  fecha!: Date;
  carril!: LadoRiel;
  causa!: string | null;
  origen!: string | null;
  tipoDefecto!: TipoDefectoRiel;
  elementoAfectado!: ElementoAfectadoRiel;
  zonaAfectada!: ZonaAfectadaRiel;
  perfil!: PerfilFallaRiel;
  altaBaja!: AltaBaja;
  progresivaFinal!: number | null;
  largo!: number | null;
  ancho!: number | null;
  profundidad!: number | null;
  numeroFoto!: number | null;
  tipoOnda!: string | null;
  estadoActual!: EstadoFalla;
  accionActual!: AccionRiel | null;
  ptActual!: string | null;
  fechaEjecucionActual!: Date | null;
  velocidadKmh!: number | null;
  tramoId!: number;
  tramoCodigo!: string;
  tramoNombre!: string;
  curvaHorizontalId!: number | null;
  curvaHorizontalNombre!: string | null;
  curvaVerticalId!: number | null;
  curvaVerticalNombre!: string | null;
  nombreInformeInterno!: string | null;
  urlInformeInterno!: string | null;
  nombreInformeExterno!: string | null;
  urlInformeExterno!: string | null;
  creadoEn!: Date;
  actualizadoEn!: Date;
  eliminado!: boolean;
  acciones?: AccionRielResponseDto[];

  static fromEntity(
    f: FallaRiel,
    opciones?: { incluirAcciones?: boolean },
  ): FallaRielResponseDto {
    const dto = new FallaRielResponseDto();
    dto.id = f.id;
    dto.progresiva = f.progresiva;
    dto.via = f.via;
    dto.fecha = f.fecha;
    dto.carril = f.carril;
    dto.causa = f.causa;
    dto.origen = f.origen;
    dto.tipoDefecto = f.tipoDefecto;
    dto.elementoAfectado = f.elementoAfectado;
    dto.zonaAfectada = f.zonaAfectada;
    dto.perfil = f.perfil;
    dto.altaBaja = f.altaBaja;
    dto.progresivaFinal = f.progresivaFinal;
    dto.largo = f.largo;
    dto.ancho = f.ancho;
    dto.profundidad = f.profundidad;
    dto.numeroFoto = f.numeroFoto;
    dto.tipoOnda = f.tipoOnda;
    dto.estadoActual = f.estadoActual;
    dto.accionActual = f.accionActual;
    dto.ptActual = f.ptActual;
    dto.fechaEjecucionActual = f.fechaEjecucionActual;
    dto.velocidadKmh = f.velocidadKmh;
    dto.tramoId = f.tramoId;
    dto.tramoCodigo = f.tramo?.codigo ?? '';
    dto.tramoNombre = f.tramo?.nombre ?? '';
    dto.curvaHorizontalId = f.curvaHorizontalId;
    dto.curvaHorizontalNombre = f.curvaHorizontal?.nombre ?? null;
    dto.curvaVerticalId = f.curvaVerticalId;
    dto.curvaVerticalNombre = f.curvaVertical?.nombre ?? null;
    dto.nombreInformeInterno = f.nombreInformeInterno;
    dto.urlInformeInterno = f.urlInformeInterno;
    dto.nombreInformeExterno = f.nombreInformeExterno;
    dto.urlInformeExterno = f.urlInformeExterno;
    dto.creadoEn = f.creadoEn;
    dto.actualizadoEn = f.actualizadoEn;
    dto.eliminado = f.eliminado;

    // ✅ Acciones: solo si fueron cargadas explícitamente (no proxy lazy)
    if (opciones?.incluirAcciones && Array.isArray(f.acciones)) {
      dto.acciones = f.acciones
        .filter((a) => !a.eliminado)
        // El repositorio ya devuelve las acciones ordenadas cronológicamente
        .map((a) => AccionRielResponseDto.fromEntity(a));
    }

    return dto;
  }
}