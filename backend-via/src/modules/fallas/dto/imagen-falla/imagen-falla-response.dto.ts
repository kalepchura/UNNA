import { ImagenFalla } from '../../entities/imagen-falla.entity';

export class ImagenFallaResponseDto {
  id!: number;
  fallaId!: number;
  nombreArchivo!: string;
  /** Path en Storage (no URL pública). El frontend pide /url para verlo. */
  rutaStorage!: string;
  creadoEn!: Date;

  static fromEntity(i: ImagenFalla): ImagenFallaResponseDto {
    const dto = new ImagenFallaResponseDto();
    dto.id = i.id;
    dto.fallaId = i.fallaId;
    dto.nombreArchivo = i.nombreArchivo;
    dto.rutaStorage = i.urlArchivo;
    dto.creadoEn = i.creadoEn;
    return dto;
  }
}