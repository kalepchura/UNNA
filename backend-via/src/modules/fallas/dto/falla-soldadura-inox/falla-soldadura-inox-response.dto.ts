import { FallaSoldaduraInox } from '../../entities/falla-soldadura-inox.entity';
import {
  TipoVia,
  UbicacionFalla,
  AccionFalla,
  TipoCambiavia,
  NormaCambiavia,
} from '../../../../common/enums';

/**
 * RESPONSE DTO — FallaSoldaduraInox con contexto del cambiavía.
 *
 * Aplanamos los datos del cambiavía para que el frontend NO tenga
 * que navegar `falla.cambiavia.tramo.nombre`. Le servimos todo
 * en el primer nivel.
 */
export class FallaSoldaduraInoxResponseDto {
  id!: number;

  // Datos propios
  fechaDeteccion!: Date;
  ubicacionFalla!: UbicacionFalla;
  accion!: AccionFalla;
  observacion!: string | null;
  ensayo!: string | null;
  pt!: string | null;

  // Datos heredados del cambiavía (aplanados)
  cambiaviaId!: number;
  cambiaviaCodigoBd!: string;
  cambiaviaDescripcion!: string | null;
  cambiaviaTipo!: TipoCambiavia;
  cambiaviaNorma!: NormaCambiavia;

  progresiva!: number;
  via!: TipoVia;
  velocidadKmh!: number;

  tramoId!: number;
  tramoCodigo!: string;
  tramoNombre!: string;

  curvaHorizontalId!: number | null;
  curvaVerticalId!: number | null;

  // Auditoría visible
  creadoEn!: Date;
  actualizadoEn!: Date;
  eliminado!: boolean;

  static fromEntity(f: FallaSoldaduraInox): FallaSoldaduraInoxResponseDto {
    const dto = new FallaSoldaduraInoxResponseDto();
    dto.id = f.id;
    dto.fechaDeteccion = f.fechaDeteccion;
    dto.ubicacionFalla = f.ubicacionFalla;
    dto.accion = f.accion;
    dto.observacion = f.observacion;
    dto.ensayo = f.ensayo;
    dto.pt = f.pt;

    // Datos del cambiavía (requiere que se haya cargado por JOIN)
    const cv = f.cambiavia;
    dto.cambiaviaId = f.cambiaviaId;
    dto.cambiaviaCodigoBd = cv?.codigoBd ?? '';
    dto.cambiaviaDescripcion = cv?.descripcion ?? null;
    dto.cambiaviaTipo = cv?.tipo as TipoCambiavia;
    dto.cambiaviaNorma = cv?.norma as NormaCambiavia;
    dto.progresiva = cv?.progresiva ?? 0;
    dto.via = cv?.via as TipoVia;
    dto.velocidadKmh = cv?.velocidadKmh ?? 0;

    dto.tramoId = cv?.tramoId ?? 0;
    dto.tramoCodigo = cv?.tramo?.codigo ?? '';
    dto.tramoNombre = cv?.tramo?.nombre ?? '';

    dto.curvaHorizontalId = cv?.curvaHorizontalId ?? null;
    dto.curvaVerticalId = cv?.curvaVerticalId ?? null;

    dto.creadoEn = f.creadoEn;
    dto.actualizadoEn = f.actualizadoEn;
    dto.eliminado = f.eliminado;

    return dto;
  }
}