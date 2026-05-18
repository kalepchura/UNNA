import { Cambiavia } from '../entities/cambiavia.entity';
import {
  TipoVia, TipoCambiavia, NormaCambiavia, TipoAguja, Derivacion,
} from '../../../../common/enums';

export class CambiaviaResponseDto {
  id!: number;
  codigoBd!: string;
  descripcion!: string | null;
  tipo!: TipoCambiavia;
  norma!: NormaCambiavia;
  via!: TipoVia;
  derivacion!: Derivacion;
  agujaTipo!: TipoAguja;
  progresiva!: number;
  tramoId!: number;
  curvaHorizontalId!: number | null;
  curvaVerticalId!: number | null;
  velocidadKmh!: number;

  static fromEntity(c: Cambiavia): CambiaviaResponseDto {
    const dto = new CambiaviaResponseDto();
    Object.assign(dto, c);
    return dto;
  }
}