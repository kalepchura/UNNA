import { DataSource } from 'typeorm';
import { Cambiavia } from '../../src/modules/catalogos/cambiavias/entities/cambiavia.entity';
import { Tramo } from '../../src/modules/catalogos/tramos/entities/tramo.entity';
import { CurvaHorizontal } from '../../src/modules/catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { CurvaVertical } from '../../src/modules/catalogos/curvas-verticales/entities/curva-vertical.entity';
import { Velocidad } from '../../src/modules/catalogos/velocidades/entities/velocidad.entity';
import {
  TipoVia, TipoCambiavia, NormaCambiavia, TipoAguja, Derivacion,
} from '../../src/common/enums';

export async function seedCambiavias(ds: DataSource): Promise<void> {
  console.log('  → Sembrando cambiavías...');

  const repo = ds.getRepository(Cambiavia);
  const tramoRepo = ds.getRepository(Tramo);
  const curvaHorizontalRepo = ds.getRepository(CurvaHorizontal);
  const curvaVerticalRepo = ds.getRepository(CurvaVertical);
  const velocidadRepo = ds.getRepository(Velocidad);

  // Cargar datos para búsqueda
  const tramos = await tramoRepo.find();
  const curvasH = await curvaHorizontalRepo.find();
  const curvasV = await curvaVerticalRepo.find();
  const velocidades = await velocidadRepo.find();

  console.log(`     📍 ${tramos.length} tramos cargados`);
  console.log(`     📍 ${curvasH.length} curvas horizontales`);
  console.log(`     📍 ${curvasV.length} curvas verticales`);
  console.log(`     📍 ${velocidades.length} segmentos de velocidad`);

  // Tramo por progresiva
  const getTramoId = (progresiva: number): number | null => {
    for (const t of tramos) {
      if (progresiva >= t.progresivaInicio && progresiva <= t.progresivaFin) {
        return t.id;
      }
    }
    return null;
  };

  // Curva horizontal por progresiva y vía
  const getCurvaHorizontalId = (progresiva: number, via: TipoVia): number | null => {
    for (const c of curvasH) {
      if (c.inicioM <= progresiva && c.finM >= progresiva && c.via === via) {
        return c.id;
      }
    }
    return null;
  };

  // Curva vertical por progresiva y vía
  const getCurvaVerticalId = (progresiva: number, via: TipoVia): number | null => {
    for (const c of curvasV) {
      if (c.inicioM <= progresiva && c.finM >= progresiva && c.via === via) {
        return c.id;
      }
    }
    return null;
  };

  // Velocidad por progresiva (SIEMPRE number)
  const getVelocidadKmh = (progresiva: number): number => {
    for (const v of velocidades) {
      if (progresiva >= v.progresivaInicio && progresiva <= v.progresivaFin) {
        return v.velocidadKmh;
      }
    }
    console.warn(`     ⚠️ Velocidad no encontrada para progresiva ${progresiva}, usando 50 km/h`);
    return 50;
  };

  // Datos de cambiavias
  const cambiaviasData = [
    { descripcion: 'CAMBIAVIA AG 2', codigoBd: 'AG 2 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: -430 },
    { descripcion: 'CAMBIAVIA AG 19', codigoBd: 'AG 19 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: -400 },
    { descripcion: 'CAMBIAVIA AG 1', codigoBd: 'AG 1 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: -383 },
    { descripcion: 'CAMBIAVIA AG 3', codigoBd: 'AG 3 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: -342 },
    { descripcion: 'CAMBIAVIA AG 5', codigoBd: 'AG 5 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: -316 },
    { descripcion: 'CAMBIAVIA AG 7', codigoBd: 'AG 7 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: -279 },
    { descripcion: 'CAMBIAVIA AG 6', codigoBd: 'AG 6 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: -233 },
    { descripcion: 'CAMBIAVIA AG 9', codigoBd: 'AG 9 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 96 },
    { descripcion: 'CAMBIAVIA AG 8', codigoBd: 'AG 8 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 144 },
    { descripcion: 'CAMBIAVIA AG 10', codigoBd: 'AG 10 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 183 },
    { descripcion: 'CAMBIAVIA AG 11', codigoBd: 'AG 11 COLA VES', tipo: '0:12', norma: 'UNIFER 50', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 229 },
    { descripcion: 'CAMBIAVIA AG 12', codigoBd: 'AG 12 VES NORTE', tipo: '1:10', norma: 'AREMA', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'CURVA', progresiva: 429 },
    { descripcion: 'CAMBIAVIA AG 13', codigoBd: 'AG 13 VES NORTE', tipo: '1:10', norma: 'AREMA', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'CURVA', progresiva: 489 },
    { descripcion: 'CAMBIAVIA AG 30', codigoBd: 'AG 30 VES NORTE', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 579 },
    { descripcion: 'CAMBIAVIA AG 31', codigoBd: 'AG 31 VES NORTE', tipo: '1:10', norma: 'UIC', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 639 },
    { descripcion: 'CAMBIAVIA AG 32', codigoBd: 'AG 32 PUM SUR', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 3428 },
    { descripcion: 'CAMBIAVIA AG 33', codigoBd: 'AG 33 PUM SUR', tipo: '1:10', norma: 'UIC', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 3488 },
    { descripcion: 'CAMBIAVIA AG 15', codigoBd: 'AG 15 SJU SUR', tipo: '1:10', norma: 'AREMA', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'CURVA', progresiva: 7186 },
    { descripcion: 'CAMBIAVIA AG 14', codigoBd: 'AG 14 SJU SUR', tipo: '1:10', norma: 'AREMA', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'CURVA', progresiva: 7243 },
    { descripcion: 'CAMBIAVIA AG 16', codigoBd: 'AG 16 SJU NORTE', tipo: '1:10', norma: 'AREMA', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'CURVA', progresiva: 7432 },
    { descripcion: 'CAMBIAVIA AG 17', codigoBd: 'AG 17 SJU NORTE', tipo: '1:10', norma: 'AREMA', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'CURVA', progresiva: 7494 },
    { descripcion: 'CAMBIAVIA AG 21', codigoBd: 'AG 21 SJU APART', tipo: '1:8', norma: 'AREMA', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'CURVA', progresiva: 7515 },
    { descripcion: 'CAMBIAVIA AG 23', codigoBd: 'AG 23 SJU APART', tipo: '1:8', norma: 'AREMA', via: 'TERCERA', derivacion: 'DERECHA', agujaTipo: 'RECTA', progresiva: 7574 },
    { descripcion: 'CAMBIAVIA AG 25', codigoBd: 'AG 25 SJU APART', tipo: '1:8', norma: 'AREMA', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'CURVA', progresiva: 7704 },
    { descripcion: 'CAMBIAVIA AG 27', codigoBd: 'AG 27 SJU APART', tipo: '1:8', norma: 'AREMA', via: 'TERCERA', derivacion: 'IZQUIERDA', agujaTipo: 'RECTA', progresiva: 7764 },
    { descripcion: 'CAMBIAVIA AG 34', codigoBd: 'AG 34 AYA SUR', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 11164 },
    { descripcion: 'CAMBIAVIA AG 35', codigoBd: 'AG 35 AYA SUR', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 11224 },
    { descripcion: 'CAMBIAVIA AG 37', codigoBd: 'AG 37 AYA NORTE', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 11730 },
    { descripcion: 'CAMBIAVIA AG 36', codigoBd: 'AG 36 AYA NORTE', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 11790 },
    { descripcion: 'CAMBIAVIA AG 2', codigoBd: 'AG 2 CUL', tipo: '1:8', norma: 'AREMA', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'CURVA', progresiva: 17006 },
    { descripcion: 'CAMBIAVIA AG 1', codigoBd: 'AG 1 CUL', tipo: '1:8', norma: 'AREMA', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'CURVA', progresiva: 17054 },
    { descripcion: 'CAMBIAVIA AG 3', codigoBd: 'AG 3 CUL', tipo: '1:8', norma: 'AREMA', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'CURVA', progresiva: 17265 },
    { descripcion: 'CAMBIAVIA AG 4', codigoBd: 'AG 4 CUL', tipo: '1:8', norma: 'AREMA', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'CURVA', progresiva: 17321 },
    { descripcion: 'CAMBIAVIA AG 10', codigoBd: 'AG 10 NAR APART', tipo: '1:8', norma: 'AREMA', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'CURVA', progresiva: 19286 },
    { descripcion: 'CAMBIAVIA AG 14', codigoBd: 'AG 14 NAR APART', tipo: '1:8', norma: 'AREMA', via: 'TERCERA', derivacion: 'IZQUIERDA', agujaTipo: 'RECTA', progresiva: 19336 },
    { descripcion: 'CAMBIAVIA AG 16', codigoBd: 'AG 16 NAR APART', tipo: '1:8', norma: 'AREMA', via: 'TERCERA', derivacion: 'DERECHA', agujaTipo: 'RECTA', progresiva: 19627 },
    { descripcion: 'CAMBIAVIA AG 12', codigoBd: 'AG 12 NAR APART', tipo: '1:8', norma: 'AREMA', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'CURVA', progresiva: 19681 },
    { descripcion: 'CAMBIAVIA AG 38', codigoBd: 'AG 38 GAM SUR', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 19736 },
    { descripcion: 'CAMBIAVIA AG 39', codigoBd: 'AG 39 GAM SUR', tipo: '1:10', norma: 'UIC', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 19790 },
    { descripcion: 'CAMBIAVIA AG 6', codigoBd: 'AG 6 MIG', tipo: '1:10', norma: 'AREMA', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'CURVA', progresiva: 21113 },
    { descripcion: 'CAMBIAVIA AG 5', codigoBd: 'AG 5 MIG', tipo: '1:10', norma: 'AREMA', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'CURVA', progresiva: 21166 },
    { descripcion: 'CAMBIAVIA AG 7', codigoBd: 'AG 7 MIG', tipo: '1:10', norma: 'AREMA', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'CURVA', progresiva: 21313 },
    { descripcion: 'CAMBIAVIA AG 8', codigoBd: 'AG 8 MIG', tipo: '1:10', norma: 'AREMA', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'CURVA', progresiva: 21380 },
    { descripcion: 'CAMBIAVIA AG 40', codigoBd: 'AG 40 PRE NORTE', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 26232 },
    { descripcion: 'CAMBIAVIA AG 41', codigoBd: 'AG 41 PRE NORTE', tipo: '1:10', norma: 'UIC', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 26292 },
    { descripcion: 'CAMBIAVIA AG 5', codigoBd: 'AG 5 JAR APART', tipo: '1:10', norma: 'UIC', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 26351 },
    { descripcion: 'CAMBIAVIA AG 6', codigoBd: 'AG 6 JAR APART', tipo: '1:10', norma: 'UIC', via: 'TERCERA', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 26400 },
    { descripcion: 'CAMBIAVIA AG 8', codigoBd: 'AG 8 JAR APART', tipo: '1:10', norma: 'UIC', via: 'TERCERA', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 26690 },
    { descripcion: 'CAMBIAVIA AG 7', codigoBd: 'AG 7 JAR APART', tipo: '1:10', norma: 'UIC', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 26736 },
    { descripcion: 'CAMBIAVIA AG 1', codigoBd: 'AG 1 JAR SUR', tipo: '1:8', norma: 'UIC', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 27063 },
    { descripcion: 'CAMBIAVIA AG 2', codigoBd: 'AG 2 JAR SUR', tipo: '1:8', norma: 'UIC', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 27115 },
    { descripcion: 'CAMBIAVIA AG 4', codigoBd: 'AG 4 JAR NORTE', tipo: '1:8', norma: 'UIC', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 27300 },
    { descripcion: 'CAMBIAVIA AG 3', codigoBd: 'AG 3 JAR NORTE', tipo: '1:8', norma: 'UIC', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 27361 },
    { descripcion: 'CAMBIAVIA AG 42', codigoBd: 'AG 42 SCA SUR', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 29496 },
    { descripcion: 'CAMBIAVIA AG 43', codigoBd: 'AG 43 SCA SUR', tipo: '1:10', norma: 'UIC', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 29556 },
    { descripcion: 'CAMBIAVIA AG 45', codigoBd: 'AG 45 BAY SUR', tipo: '1:10', norma: 'UIC', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 33129 },
    { descripcion: 'CAMBIAVIA AG 44', codigoBd: 'AG 44 BAY SUR', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 33180 },
    { descripcion: 'CAMBIAVIA AG 10', codigoBd: 'AG 10 BAY SUR', tipo: '1:10', norma: 'UIC', via: 'PAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 33245 },
    { descripcion: 'CAMBIAVIA AG 9', codigoBd: 'AG 9 BAY SUR', tipo: '1:10', norma: 'UIC', via: 'IMPAR', derivacion: 'DERECHA', agujaTipo: 'N.A', progresiva: 33302 },
    { descripcion: 'CAMBIAVIA AG 11', codigoBd: 'AG 11 BAY NORTE', tipo: '1:8', norma: 'UIC', via: 'IMPAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 33566 },
    { descripcion: 'CAMBIAVIA AG 12', codigoBd: 'AG 12 BAY NORTE', tipo: '1:8', norma: 'UIC', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 33614 },
    { descripcion: 'CAMBIAVIA AG 14', codigoBd: 'AG 14 COLA BAY', tipo: '1:8', norma: 'UIC', via: 'PAR', derivacion: 'IZQUIERDA', agujaTipo: 'N.A', progresiva: 33631 },
  ];

  // Mapeos
  const tipoMap: Record<string, TipoCambiavia> = {
    '0:12': TipoCambiavia.T_0_12,
    '1:8': TipoCambiavia.T_1_8,
    '1:10': TipoCambiavia.T_1_10,
  };

  const normaMap: Record<string, NormaCambiavia> = {
    'AREMA': NormaCambiavia.AREMA,
    'UIC': NormaCambiavia.UIC,
    'UNIFER 50': NormaCambiavia.UNIFER_50,
  };

  const agujaMap: Record<string, TipoAguja> = {
    'N.A': TipoAguja.NA,
    'CURVA': TipoAguja.CURVA,
    'RECTA': TipoAguja.RECTA,
  };

  const derivacionMap: Record<string, Derivacion> = {
    'IZQUIERDA': Derivacion.IZQUIERDA,
    'DERECHA': Derivacion.DERECHA,
  };

  let insertados = 0;
  let saltados = 0;

  for (const data of cambiaviasData) {
    const existe = await repo.findOne({ where: { codigoBd: data.codigoBd } });
    if (existe) {
      saltados++;
      continue;
    }

    const tramoId = getTramoId(data.progresiva);
    if (!tramoId) {
      console.warn(`     ⚠️ Tramo no encontrado para progresiva ${data.progresiva}`);
      saltados++;
      continue;
    }

    const via = data.via as TipoVia;
    const curvaHorizontalId = getCurvaHorizontalId(data.progresiva, via);
    const curvaVerticalId = getCurvaVerticalId(data.progresiva, via);
    const velocidadKmh = getVelocidadKmh(data.progresiva);

    const nuevo = repo.create({
      codigoBd: data.codigoBd,
      descripcion: data.descripcion,
      tipo: tipoMap[data.tipo],
      norma: normaMap[data.norma],
      via: via,
      derivacion: derivacionMap[data.derivacion],
      agujaTipo: agujaMap[data.agujaTipo],
      progresiva: data.progresiva,
      tramoId: tramoId,
      curvaHorizontalId: curvaHorizontalId,
      curvaVerticalId: curvaVerticalId,
      velocidadKmh: velocidadKmh,
    });

    await repo.save(nuevo);
    insertados++;
  }

  console.log(`     ✅ ${insertados} cambiavias insertados, ${saltados} ya existían`);
}