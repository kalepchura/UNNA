import { CurvaHorizontal } from '../entities/curva-horizontal.entity';
import { TipoVia } from '../../../../common/enums';

export class CurvaHorizontalResponseDto {
  id!: number;
  nombre!: string;
  via!: TipoVia;
  radio!: number | null;
  inicioM!: number;
  finM!: number;
  peralte!: number | null;
  estacionInicioId!: number | null;
  estacionFinId!: number | null;

  static fromEntity(c: CurvaHorizontal): CurvaHorizontalResponseDto {
    const dto = new CurvaHorizontalResponseDto();
    dto.id = c.id;
    dto.nombre = c.nombre;
    dto.via = c.via;
    dto.radio = c.radio;
    dto.inicioM = c.inicioM;
    dto.finM = c.finM;
    dto.peralte = c.peralte;
    dto.estacionInicioId = c.estacionInicioId;
    dto.estacionFinId = c.estacionFinId;
    return dto;
  }
}