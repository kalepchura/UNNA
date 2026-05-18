import { DataSource } from 'typeorm';
import { CurvaHorizontal } from '../../src/modules/catalogos/curvas-horizontales/entities/curva-horizontal.entity';
import { Estacion } from '../../src/modules/catalogos/estaciones/entities/estacion.entity';
import { TipoVia } from '../../src/common/enums';

export async function seedCurvasHorizontales(ds: DataSource): Promise<void> {
  console.log('  → Sembrando curvas horizontales...');
  
  const repo = ds.getRepository(CurvaHorizontal);
  const estacionRepo = ds.getRepository(Estacion);

  // Cargar estaciones
  const estaciones = await estacionRepo.find({ order: { progresiva: 'ASC' } });
  
  const getEstacionId = (progresiva: number): number | null => {
    let id: number | null = null;
    for (const e of estaciones) {
      if (e.progresiva <= progresiva) {
        id = e.id;
      } else {
        break;
      }
    }
    return id;
  };

  // Datos: [nombre, via, radio, inicioM, finM, peralte] - SIN ID porque es autoincremental
  const curvasData = [
    ['C1-IMP', 'IMPAR', 398, 3090, 3242, 100],
    ['C1-PAR', 'PAR', 397, 3091, 3282, 100],
    ['C2-IMP', 'IMPAR', 379, 3785, 3918, 80],
    ['C2-PAR', 'PAR', 380, 3785, 3960, 80],
    ['C3-IMP', 'IMPAR', 380, 4203, 4392, 100],
    ['C3-PAR', 'PAR', 383, 4204, 4454, 100],
    ['C4-IMP', 'IMPAR', 382, 4512, 4592, 70],
    ['C4-PAR', 'PAR', 386, 4514, 4654, 70],
    ['C5-IMP', 'IMPAR', 193, 4691, 4829, 90],
    ['C5-PAR', 'PAR', 190, 4693, 4890, 90],
    ['C6-PAR', 'PAR', 762, 5203, 5365, 30],
    ['C6-IMP', 'IMPAR', 766, 5203, 5306, 30],
    ['C7-PAR', 'PAR', 456, 6200, 6502, 80],
    ['C7-IMP', 'IMPAR', 460, 6200, 6445, 80],
    ['C8-PAR', 'PAR', 1591, 8722, 8796, 20],
    ['C8-IMP', 'IMPAR', 1587, 8725, 8779, 20],
    ['C9-PAR', 'PAR', 1648, 9428, 9541, 30],
    ['C9-IMP', 'IMPAR', 1645, 9430, 9513, 30],
    ['C10-PAR', 'PAR', 407, 9780, 10033, 120],
    ['C10-IMP', 'IMPAR', 403, 9782, 9962, 120],
    ['C11-PAR', 'PAR', -831, 10260, 10359, -60],
    ['C11-IMP', 'IMPAR', -835, 10261, 10359, -60],
    ['C12-IMP', 'IMPAR', 762, 10836, 10980, 60],
    ['C12-PAR', 'PAR', 766, 10836, 10979, 60],
    ['C17-PAR', 'PAR', 201, 12289, 12571, 100],
    ['C17-IMP', 'IMPAR', 198, 12289, 12568, 100],
    ['C18-IMP', 'IMPAR', -383, 13150, 13342, -130],
    ['C18-PAR', 'PAR', -379, 13153, 13344, -130],
    ['C20-IMP', 'IMPAR', 590, 14220, 14337, 80],
    ['C20-PAR', 'PAR', 593, 14221, 14338, 80],
    ['C22-IMP', 'IMPAR', -374, 17532, 18031, -130],
    ['C22-PAR', 'PAR', -370, 17534, 18028, -130],
    ['C23-IMP', 'IMPAR', 318, 18125, 18446, 80],
    ['C24-IMP', 'IMPAR', 800, 18446, 18758, 40],
    ['C24-PAR', 'PAR', 804, 18446, 18759, 40],
    ['C26-IMP', 'IMPAR', -410, 20322, 20490, -120],
    ['C26-PAR', 'PAR', -406, 20324, 20491, -120],
    ['C27-PAR', 'PAR', 301, 20730, 21111, 140],
    ['C27-IMP', 'IMPAR', 298, 20730, 21106, 140],
    ['C28-IMP', 'IMPAR', 1198, 21559, 21660, 40],
    ['C28-PAR', 'PAR', 1201, 21563, 21664, 40],
    ['C29-IMP', 'IMPAR', -256, 21697, 21928, -130],
    ['C29-PAR', 'PAR', -253, 21702, 21930, -130],
    ['C30-IMP', 'IMPAR', -301, 22068, 22207, -70],
    ['C30-PAR', 'PAR', -298, 22071, 22208, -70],
    ['C31-IMP', 'IMPAR', -262, 22601, 22748, -110],
    ['C31-PAR', 'PAR', -257, 22602, 22747, -110],
    ['C32-PAR', 'PAR', 261, 22911, 23217, 120],
    ['C32-IMP', 'IMPAR', 258, 22913, 23215, 120],
    ['C33-IMP', 'IMPAR', -401, 23576, 23815, -125],
    ['C33-PAR', 'PAR', -398, 23580, 23817, -125],
    ['C34-IMP', 'IMPAR', 298, 23943, 24137, 120],
    ['C34-PAR', 'PAR', 301, 23944, 24140, 120],
    ['C35-IMP', 'IMPAR', 803, 24233, 24392, 60],
    ['C35-PAR', 'PAR', 806, 24236, 24396, 60],
    ['C36-IMP', 'IMPAR', 448, 24520, 24731, 110],
    ['C36-PAR', 'PAR', 451, 24524, 24736, 110],
    ['C37-IMP', 'IMPAR', 698, 25461, 25593, 70],
    ['C37-PAR', 'PAR', 701, 25466, 25599, 70],
    ['C38-IMP', 'IMPAR', -351, 25652, 25773, -95],
    ['C38-PAR', 'PAR', -348, 25657, 25778, -95],
    ['C39-IMP', 'IMPAR', -256, 25902, 26130, -115],
    ['C39-PAR', 'PAR', -253, 25906, 26132, -115],
    ['C40-IMP', 'IMPAR', -401, 26412, 26683, -125],
    ['C40-PAR', 'PAR', -398, 26414, 26683, -125],
    ['C41-PAR', 'PAR', 601, 27677, 27918, 80],
    ['C41-IMP', 'IMPAR', 598, 27677, 27916, 80],
    ['C43-IMP', 'IMPAR', 498, 28838, 29500, 100],
    ['C43-PAR', 'PAR', 501, 28839, 29505, 100],
    ['C44-IMP', 'IMPAR', -321, 29678, 29910, -80],
    ['C44-PAR', 'PAR', -318, 29683, 29913, -80],
    ['C45-IMP', 'IMPAR', 798, 30410, 30546, 60],
    ['C45-PAR', 'PAR', 801, 30413, 30550, 60],
    ['C46-IMP', 'IMPAR', 598, 30593, 30749, 80],
    ['C46-PAR', 'PAR', 601, 30597, 30754, 80],
    ['C47-IMP', 'IMPAR', 398, 30837, 31029, 125],
    ['C47-PAR', 'PAR', 401, 30841, 31035, 125],
    ['C48-IMP', 'IMPAR', -701, 31687, 31948, -70],
    ['C48-PAR', 'PAR', -698, 31693, 31952, -70],
  ];

  let insertados = 0;
  let saltados = 0;

  for (const curva of curvasData) {
    const [nombre, via, radio, inicioM, finM, peralte] = curva;
    
    // Buscar por nombre y via (como en tu ejemplo original)
    const existe = await repo.findOne({ 
      where: { 
        nombre: nombre as string, 
        via: via as TipoVia 
      } 
    });
    
    if (existe) {
      saltados++;
      continue;
    }

    const estacionInicioId = getEstacionId(Number(inicioM));
    const estacionFinId = getEstacionId(Number(finM));

    const nuevaCurva = repo.create({
      nombre: nombre as string,
      via: via as TipoVia,
      radio: Number(radio),
      inicioM: Number(inicioM),
      finM: Number(finM),
      peralte: Number(peralte),
      estacionInicioId,
      estacionFinId,
    });

    await repo.save(nuevaCurva);
    insertados++;
  }

  console.log(`     ✅ ${insertados} curvas horizontales insertadas, ${saltados} ya existían`);
}