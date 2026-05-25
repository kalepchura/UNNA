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

/**
 * RESPONSE DTO — FallaRiel con contexto enriquecido.
 *
 * Cuando se carga la entidad con relations: ['tramo', 'curvaHorizontal', 'curvaVertical'],
 * incluimos también los NOMBRES (no solo IDs) para que el frontend no tenga
 * que hacer otra request al catálogo.
 *
 * ============================================================
 * FASE 2 — CAMPOS NUEVOS
 * ============================================================
 *  - Caracterización: tipoDefecto, elementoAfectado, zonaAfectada,
 *    perfil, altaBaja
 *  - Medidas: progresivaFinal, largo, ancho, profundidad, numeroFoto, tipoOnda
 *  - Estado desnormalizado: estadoActual, accionActual, ptActual, fechaEjecucionActual
 *  - Acciones: array opcional. Se incluye SOLO cuando se llama desde el
 *    endpoint de detalle (GET /:id). En listados, queda undefined para
 *    no inflar el payload.
 * ============================================================
 */
export class FallaRielResponseDto {
  id!: number;

  // Campos directos originales
  progresiva!: number;
  via!: TipoVia;
  fecha!: Date;
  carril!: LadoRiel;
  causa!: string | null;
  origen!: string | null;

  // FASE 2 — Caracterización (siempre vienen con valor, default SIN_DEFINIR)
  tipoDefecto!: TipoDefectoRiel;
  elementoAfectado!: ElementoAfectadoRiel;
  zonaAfectada!: ZonaAfectadaRiel;
  perfil!: PerfilFallaRiel;
  altaBaja!: AltaBaja;

  // FASE 2 — Medidas (nullable: vienen vacíos hasta que se midan)
  progresivaFinal!: number | null;
  largo!: number | null;
  ancho!: number | null;
  profundidad!: number | null;
  numeroFoto!: number | null;
  tipoOnda!: string | null;

  // FASE 2 — Estado desnormalizado (refleja la última acción)
  estadoActual!: EstadoFalla;
  accionActual!: AccionRiel | null;
  ptActual!: string | null;
  fechaEjecucionActual!: Date | null;

  // Calculados (con id + nombre/código)
  velocidadKmh!: number | null;

  tramoId!: number;
  tramoCodigo!: string;
  tramoNombre!: string;

  curvaHorizontalId!: number | null;
  curvaHorizontalNombre!: string | null;

  curvaVerticalId!: number | null;
  curvaVerticalNombre!: string | null;

  // Archivos
  nombreInformeInterno!: string | null;
  urlInformeInterno!: string | null;
  nombreInformeExterno!: string | null;
  urlInformeExterno!: string | null;

  // Auditoría visible
  creadoEn!: Date;
  actualizadoEn!: Date;
  eliminado!: boolean;

  /**
   * Historial de acciones (timeline).
   * Solo se llena en el endpoint de detalle. En listados queda undefined.
   * Para incluirlo, el service debe cargar las relations correspondientes
   * y luego llamar a fromEntity con incluirAcciones=true.
   */
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

    // FASE 2 — Caracterización
    dto.tipoDefecto = f.tipoDefecto;
    dto.elementoAfectado = f.elementoAfectado;
    dto.zonaAfectada = f.zonaAfectada;
    dto.perfil = f.perfil;
    dto.altaBaja = f.altaBaja;

    // FASE 2 — Medidas
    dto.progresivaFinal = f.progresivaFinal;
    dto.largo = f.largo;
    dto.ancho = f.ancho;
    dto.profundidad = f.profundidad;
    dto.numeroFoto = f.numeroFoto;
    dto.tipoOnda = f.tipoOnda;

    // FASE 2 — Estado desnormalizado
    dto.estadoActual = f.estadoActual;
    dto.accionActual = f.accionActual;
    dto.ptActual = f.ptActual;
    dto.fechaEjecucionActual = f.fechaEjecucionActual;

    dto.velocidadKmh = f.velocidadKmh;

    dto.tramoId = f.tramoId;
    // f.tramo solo está cargado si se hizo JOIN. Si no, devolvemos cadenas vacías.
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

    // Acciones: solo si se piden Y vienen cargadas en la entidad
    if (opciones?.incluirAcciones && f.acciones) {
      dto.acciones = f.acciones
        .filter((a) => !a.eliminado)
        .sort((a, b) => {
          // Mismo orden que usa el repositorio: fecha asc, id asc
          const fa = a.fechaEjecucion?.getTime() ?? -Infinity;
          const fb = b.fechaEjecucion?.getTime() ?? -Infinity;
          if (fa !== fb) return fa - fb;
          return a.id - b.id;
        })
        .map((a) => AccionRielResponseDto.fromEntity(a));
    }

    return dto;
  }
}