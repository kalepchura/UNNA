import { CurvaVertical } from '../entities/curva-vertical.entity';
import { TipoVia } from '../../../../common/enums';

export class CurvaVerticalResponseDto {
  id!: number;
  nombre!: string;
  via!: TipoVia;
  inicioM!: number;
  finM!: number;
  pkVertice!: number | null;
  pendienteEntrada!: number | null;
  pendienteSalida!: number | null;
  radio!: number | null;

  static fromEntity(c: CurvaVertical): CurvaVerticalResponseDto {
    const dto = new CurvaVerticalResponseDto();
    Object.assign(dto, c);
    return dto;
  }
}