import { FallaRiel } from '../../entities/falla-riel.entity';
import { TipoVia, LadoRiel } from '../../../../common/enums';

/**
 * RESPONSE DTO — FallaRiel con contexto enriquecido.
 *
 * Cuando se carga la entidad con relations: ['tramo', 'curvaHorizontal', 'curvaVertical'],
 * incluimos también los NOMBRES (no solo IDs) para que el frontend no tenga
 * que hacer otra request al catálogo.
 */
export class FallaRielResponseDto {
  id!: number;

  // Campos directos
  progresiva!: number;
  via!: TipoVia;
  fecha!: Date;
  carril!: LadoRiel;
  causa!: string | null;
  origen!: string | null;

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

  static fromEntity(f: FallaRiel): FallaRielResponseDto {
    const dto = new FallaRielResponseDto();
    dto.id = f.id;
    dto.progresiva = f.progresiva;
    dto.via = f.via;
    dto.fecha = f.fecha;
    dto.carril = f.carril;
    dto.causa = f.causa;
    dto.origen = f.origen;
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

    return dto;
  }
}