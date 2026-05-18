import { TemperaturaImportacion } from '../entities/temperatura-importacion.entity';
import { TipoArchivoTemperatura } from '../../../common/enums';

/**
 * RESPONSE DTO de una importación (cabecera) con contexto enriquecido.
 *
 * Aplanamos el tramo (codigo + nombre) para que el frontend no tenga
 * que navegar `imp.tramo.nombre`.
 */
export class ImportacionResponseDto {
  id!: number;
  nombreArchivo!: string;
  tipoArchivo!: TipoArchivoTemperatura;
  progresiva!: number;

  tramoId!: number;
  tramoCodigo!: string;
  tramoNombre!: string;

  comentarioEspecialista!: string | null;
  fechaSubida!: Date;

  totalRegistros!: number;
  registrosValidos!: number;
  registrosInvalidos!: number;

  /**
   * NO devolvemos `urlArchivo` aquí: ese path interno no debe
   * exponerse al frontend. Para descargar usar GET /archivo/url
   * que devuelve URL firmada temporal.
   */

  // Auditoría visible
  creadoPor!: string;       // UUID
  creadoEn!: Date;
  actualizadoEn!: Date;
  eliminado!: boolean;

  static fromEntity(i: TemperaturaImportacion): ImportacionResponseDto {
    const dto = new ImportacionResponseDto();
    dto.id = i.id;
    dto.nombreArchivo = i.nombreArchivo;
    dto.tipoArchivo = i.tipoArchivo;
    dto.progresiva = i.progresiva;

    dto.tramoId = i.tramoId;
    dto.tramoCodigo = i.tramo?.codigo ?? '';
    dto.tramoNombre = i.tramo?.nombre ?? '';

    dto.comentarioEspecialista = i.comentarioEspecialista;
    dto.fechaSubida = i.fechaSubida;
    dto.totalRegistros = i.totalRegistros;
    dto.registrosValidos = i.registrosValidos;
    dto.registrosInvalidos = i.registrosInvalidos;

    dto.creadoPor = i.creadoPor;
    dto.creadoEn = i.creadoEn;
    dto.actualizadoEn = i.actualizadoEn;
    dto.eliminado = i.eliminado;

    return dto;
  }
}