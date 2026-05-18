import { DataSource } from 'typeorm';
import { ElementoDesgaste } from '../../src/modules/catalogos/elementos-desgaste/entities/elemento-desgaste.entity';
import { Tramo } from '../../src/modules/catalogos/tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../../src/modules/catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../src/modules/catalogos/curvas-verticales/entities/curva-vertical.entity';
import {
  TipoVia, LadoRiel, PerfilRiel, CarrilCurva,
} from '../../src/common/enums';

type ElementoData = {
  codigoElemento: number;
  progresiva: number;
  via: TipoVia;
  riel: LadoRiel;
  perfil: PerfilRiel;
  carrilCurva: CarrilCurva;
};

export async function seedElementosDesgaste(ds: DataSource): Promise<void> {
  console.log('  → Sembrando elementos de desgaste...');
  
  const elemRepo = ds.getRepository(ElementoDesgaste);
  const tramoRepo = ds.getRepository(Tramo);
  const curvaHorizontalRepo = ds.getRepository(CurvaHorizontal);
  const curvaVerticalRepo = ds.getRepository(CurvaVertical);

  // Cargar todos los tramos
  const tramos = await tramoRepo.find({ order: { progresivaInicio: 'ASC' } });
  console.log(`     📍 ${tramos.length} tramos cargados`);

  // Cargar todas las curvas horizontales y verticales
  const curvasHorizontales = await curvaHorizontalRepo.find();
  const curvasVerticales = await curvaVerticalRepo.find();

  // Función para encontrar tramo por progresiva
  const getTramoId = (progresiva: number): number | null => {
    for (const t of tramos) {
      if (progresiva >= t.progresivaInicio && progresiva <= t.progresivaFin) {
        return t.id;
      }
    }
    return null;
  };

  // Función para encontrar curva horizontal por progresiva y vía
  const getCurvaHorizontalId = (progresiva: number, via: TipoVia): number | null => {
    for (const c of curvasHorizontales) {
      if (c.inicioM <= progresiva && c.finM >= progresiva && c.via === via) {
        return c.id;
      }
    }
    return null;
  };

  // Función para encontrar curva vertical por progresiva y vía
  const getCurvaVerticalId = (progresiva: number, via: TipoVia): number | null => {
    for (const c of curvasVerticales) {
      if (c.inicioM <= progresiva && c.finM >= progresiva && c.via === via) {
        return c.id;
      }
    }
    return null;
  };

  // Datos: [codigo_id, progresiva, via, riel, perfil, carril_curva]
  const elementosData: ElementoData[] = [
    { codigoElemento: 5, progresiva: 900, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 6, progresiva: 900, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 7, progresiva: 900, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 8, progresiva: 900, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 9, progresiva: 1600, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 10, progresiva: 1600, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 11, progresiva: 1600, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 12, progresiva: 1600, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 13, progresiva: 2500, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 14, progresiva: 2500, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 15, progresiva: 2500, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 16, progresiva: 2500, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 17, progresiva: 3185, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 18, progresiva: 3185, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 19, progresiva: 3184, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 20, progresiva: 3184, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_100RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 21, progresiva: 3871, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 22, progresiva: 3871, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 23, progresiva: 3870, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 24, progresiva: 3870, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 25, progresiva: 4200, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 26, progresiva: 4200, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 27, progresiva: 4200, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 28, progresiva: 4200, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 29, progresiva: 4327, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 30, progresiva: 4327, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 31, progresiva: 4326, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 32, progresiva: 4326, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 33, progresiva: 4582, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 34, progresiva: 4582, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 35, progresiva: 4580, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 36, progresiva: 4580, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 37, progresiva: 4789, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 38, progresiva: 4789, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 39, progresiva: 4788, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 40, progresiva: 4788, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 41, progresiva: 5282, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 42, progresiva: 5282, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 43, progresiva: 5282, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 44, progresiva: 5282, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 45, progresiva: 5700, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 46, progresiva: 5700, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 47, progresiva: 5700, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 48, progresiva: 5700, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 49, progresiva: 6349, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 50, progresiva: 6349, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 51, progresiva: 6351, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 52, progresiva: 6351, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 53, progresiva: 6700, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 54, progresiva: 6700, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 55, progresiva: 6700, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 56, progresiva: 6700, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 73, progresiva: 8600, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 74, progresiva: 8600, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 75, progresiva: 8600, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 76, progresiva: 8600, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 77, progresiva: 8758, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 78, progresiva: 8758, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 79, progresiva: 8760, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 80, progresiva: 8760, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 81, progresiva: 9300, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 82, progresiva: 9300, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 83, progresiva: 9300, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 84, progresiva: 9300, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 85, progresiva: 9485, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 86, progresiva: 9485, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 87, progresiva: 9485, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 88, progresiva: 9485, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 89, progresiva: 9905, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 90, progresiva: 9905, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 91, progresiva: 9904, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 92, progresiva: 9904, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 93, progresiva: 10309, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 94, progresiva: 10309, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 95, progresiva: 10307, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 96, progresiva: 10307, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 97, progresiva: 10700, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 98, progresiva: 10700, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 99, progresiva: 10700, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 100, progresiva: 10700, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 101, progresiva: 10907, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 102, progresiva: 10907, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 103, progresiva: 10905, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 104, progresiva: 10905, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 105, progresiva: 11128, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 106, progresiva: 11128, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 107, progresiva: 11126, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 108, progresiva: 11126, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 109, progresiva: 11530, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 110, progresiva: 11530, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 111, progresiva: 11528, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 112, progresiva: 11528, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 113, progresiva: 11860, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 114, progresiva: 11860, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 115, progresiva: 11858, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 116, progresiva: 11858, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 117, progresiva: 12207, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 118, progresiva: 12207, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 119, progresiva: 12205, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 120, progresiva: 12205, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 121, progresiva: 12430, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 122, progresiva: 12430, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 123, progresiva: 12426, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 124, progresiva: 12426, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 125, progresiva: 12800, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 126, progresiva: 12800, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 127, progresiva: 12800, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 128, progresiva: 12800, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 129, progresiva: 13238, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 130, progresiva: 13238, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 131, progresiva: 13233, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 132, progresiva: 13233, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 133, progresiva: 13505, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 134, progresiva: 13505, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 135, progresiva: 13501, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 136, progresiva: 13501, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 137, progresiva: 14100, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 138, progresiva: 14100, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 139, progresiva: 14100, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 140, progresiva: 14100, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 141, progresiva: 14279, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 142, progresiva: 14279, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 143, progresiva: 14276, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 144, progresiva: 14276, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 145, progresiva: 15045, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 146, progresiva: 15045, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 147, progresiva: 15045, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 148, progresiva: 15045, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 149, progresiva: 15850, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 150, progresiva: 15850, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 151, progresiva: 15850, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 152, progresiva: 15850, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 161, progresiva: 17400, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 162, progresiva: 17400, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 163, progresiva: 17400, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 164, progresiva: 17400, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 165, progresiva: 17780, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 166, progresiva: 17780, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 167, progresiva: 17780, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 168, progresiva: 17780, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 169, progresiva: 17900, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 170, progresiva: 17900, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 171, progresiva: 17900, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 172, progresiva: 17900, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 173, progresiva: 18242, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 174, progresiva: 18242, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 175, progresiva: 18243, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 176, progresiva: 18243, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 177, progresiva: 18637, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 178, progresiva: 18637, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 179, progresiva: 18633, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 180, progresiva: 18633, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 181, progresiva: 19173, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 182, progresiva: 19173, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 183, progresiva: 19169, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 184, progresiva: 19169, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 193, progresiva: 20407, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 194, progresiva: 20407, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 195, progresiva: 20404, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 196, progresiva: 20404, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 197, progresiva: 20650, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 198, progresiva: 20650, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 199, progresiva: 20650, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 200, progresiva: 20650, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 201, progresiva: 20921, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 202, progresiva: 20921, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 203, progresiva: 20916, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 204, progresiva: 20916, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 205, progresiva: 21800, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 206, progresiva: 21800, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 207, progresiva: 21800, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 208, progresiva: 21800, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 209, progresiva: 22120, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 210, progresiva: 22120, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 211, progresiva: 22120, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 212, progresiva: 22120, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 213, progresiva: 22670, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 214, progresiva: 22670, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 215, progresiva: 22670, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 216, progresiva: 22670, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 217, progresiva: 23100, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 218, progresiva: 23100, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 219, progresiva: 23100, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 220, progresiva: 23100, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 221, progresiva: 23700, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 222, progresiva: 23700, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 223, progresiva: 23700, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 224, progresiva: 23700, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 225, progresiva: 24030, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 226, progresiva: 24030, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 227, progresiva: 24030, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 228, progresiva: 24030, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 229, progresiva: 24620, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 230, progresiva: 24620, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 231, progresiva: 24620, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 232, progresiva: 24620, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 233, progresiva: 25500, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 234, progresiva: 25500, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 235, progresiva: 25500, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 236, progresiva: 25500, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 237, progresiva: 25700, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 238, progresiva: 25700, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 239, progresiva: 25700, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 240, progresiva: 25700, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 241, progresiva: 26000, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 242, progresiva: 26000, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 243, progresiva: 26000, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 244, progresiva: 26000, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 245, progresiva: 26530, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 246, progresiva: 26530, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 247, progresiva: 26530, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 248, progresiva: 26530, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 249, progresiva: 29800, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 250, progresiva: 29800, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 251, progresiva: 29800, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 252, progresiva: 29800, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 253, progresiva: 30920, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 254, progresiva: 30920, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 255, progresiva: 30920, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 256, progresiva: 30920, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 257, progresiva: 31860, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 258, progresiva: 31860, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 259, progresiva: 31860, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.ALTA },
    { codigoElemento: 260, progresiva: 31860, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.BAJA },
    { codigoElemento: 261, progresiva: 32140, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 262, progresiva: 32140, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 263, progresiva: 32140, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 264, progresiva: 32140, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 265, progresiva: 32600, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 266, progresiva: 32600, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 267, progresiva: 32600, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 268, progresiva: 32600, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 269, progresiva: 32960, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 270, progresiva: 32960, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 271, progresiva: 32960, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 272, progresiva: 32960, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 273, progresiva: 33280, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 274, progresiva: 33280, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 275, progresiva: 33900, via: TipoVia.IMPAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 276, progresiva: 33900, via: TipoVia.IMPAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 277, progresiva: 33900, via: TipoVia.PAR, riel: LadoRiel.IZQUIERDA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
    { codigoElemento: 278, progresiva: 33900, via: TipoVia.PAR, riel: LadoRiel.DERECHA, perfil: PerfilRiel.P_115RE, carrilCurva: CarrilCurva.NA },
  ];

  let insertados = 0;
  let saltados = 0;

  for (const elemento of elementosData) {
    // Verificar si ya existe por código
    const existe = await elemRepo.findOne({ 
      where: { codigoElemento: elemento.codigoElemento } 
    });
    
    if (existe) {
      saltados++;
      continue;
    }

    // Buscar tramo según progresiva
    const tramoId = getTramoId(elemento.progresiva);
    if (!tramoId) {
      console.warn(`     ⚠️ No se encontró tramo para progresiva ${elemento.progresiva}, elemento ${elemento.codigoElemento}`);
      saltados++;
      continue;
    }

    // Buscar curvas (opcional, pueden ser null)
    const curvaHorizontalId = getCurvaHorizontalId(elemento.progresiva, elemento.via);
    const curvaVerticalId = getCurvaVerticalId(elemento.progresiva, elemento.via);

    const nuevoElemento = elemRepo.create({
      codigoElemento: elemento.codigoElemento,
      progresiva: elemento.progresiva,
      via: elemento.via,
      tramoId: tramoId,
      curvaHorizontalId: curvaHorizontalId,
      curvaVerticalId: curvaVerticalId,
      riel: elemento.riel,
      perfil: elemento.perfil,
      carrilCurva: elemento.carrilCurva,
    });

    await elemRepo.save(nuevoElemento);
    insertados++;
  }

  console.log(`     ✅ ${insertados} elementos de desgaste insertados, ${saltados} ya existían`);
}