import { ElementoDesgaste } from '../entities/elemento-desgaste.entity';
import {
  TipoVia, LadoRiel, PerfilRiel, CarrilCurva,
} from '../../../../common/enums';

export class ElementoDesgasteResponseDto {
  id!: number;
  codigoElemento!: number;
  progresiva!: number;
  via!: TipoVia;
  tramoId!: number;
  curvaHorizontalId!: number | null;
  curvaVerticalId!: number | null;
  riel!: LadoRiel;
  perfil!: PerfilRiel;
  carrilCurva!: CarrilCurva;

  static fromEntity(e: ElementoDesgaste): ElementoDesgasteResponseDto {
    const dto = new ElementoDesgasteResponseDto();
    Object.assign(dto, e);
    return dto;
  }
}