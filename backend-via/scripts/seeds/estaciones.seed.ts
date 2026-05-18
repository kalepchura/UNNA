import { DataSource } from 'typeorm';
import { Estacion } from '../../src/modules/catalogos/estaciones/entities/estacion.entity';
import { Tramo } from '../../src/modules/catalogos/tramos/entities/tramo.entity';

export async function seedEstaciones(ds: DataSource): Promise<void> {
  console.log('  → Sembrando estaciones...');

  const estacionRepo = ds.getRepository(Estacion);
  const tramoRepo = ds.getRepository(Tramo);

  // Obtener todos los tramos y crear mapa código → id
  const tramos = await tramoRepo.find();
  const tramoMap = new Map<string, number>();
  tramos.forEach(t => tramoMap.set(t.codigo, t.id));

  // Asignación EXPLÍCITA: cada estación a su tramo por código
  const asignacion: Record<string, string> = {
    'INI': 'PRE-PT', 'PT': 'PRE-PT',
    'VES': 'PT-VES', 'PIN': 'VES-PIN', 'PUM': 'PIN-PUM',
    'VMA': 'PUM-VMA', 'MAU': 'VMA-MAU', 'SJU': 'MAU-SJU',
    'ATO': 'SJU-ATO', 'JCH': 'ATO-JCH', 'AYA': 'JCH-AYA',
    'CAB': 'AYA-CAB', 'ANG': 'CAB-ANG', 'SBS': 'ANG-SBS',
    'CUL': 'SBS-CUL', 'NAR': 'CUL-NAR', 'GAM': 'NAR-GAM',
    'MIG': 'GAM-MIG', 'ELA': 'MIG-ELA', 'PM': 'ELA-PM',
    'CAA': 'PRE-CAA', 'PIR': 'CAA-PIR', 'JAR': 'PIR-JAR',
    'POS': 'JAR-POS', 'SCA': 'POS-SCA', 'SMA': 'SCA-SMA',
    'SRO': 'SMA-SRO', 'BAY': 'SRO-BAY', 'FIN': 'BAY-FIN',
  };

  const estaciones = [
    { orden: 0, progresiva: -1000, codigo: 'INI', nombre: 'Inicio Línea' },
    { orden: 1, progresiva: -36, codigo: 'PT', nombre: 'Patio Taller' },
    { orden: 2, progresiva: 374, codigo: 'VES', nombre: 'Villa El Salvador' },
    { orden: 3, progresiva: 1787, codigo: 'PIN', nombre: 'Parque Industrial' },
    { orden: 4, progresiva: 3609, codigo: 'PUM', nombre: 'Pumacahua' },
    { orden: 5, progresiva: 5077, codigo: 'VMA', nombre: 'Villa María' },
    { orden: 6, progresiva: 6171, codigo: 'MAU', nombre: 'María Auxiliadora' },
    { orden: 7, progresiva: 7345, codigo: 'SJU', nombre: 'San Juan' },
    { orden: 8, progresiva: 8967, codigo: 'ATO', nombre: 'Atocongo' },
    { orden: 9, progresiva: 10559, codigo: 'JCH', nombre: 'Jorge Chávez' },
    { orden: 10, progresiva: 11642, codigo: 'AYA', nombre: 'Ayacucho' },
    { orden: 11, progresiva: 12610, codigo: 'CAB', nombre: 'Cabitos' },
    { orden: 12, progresiva: 14550, codigo: 'ANG', nombre: 'Angamos' },
    { orden: 13, progresiva: 15654, codigo: 'SBS', nombre: 'San Borja Sur' },
    { orden: 14, progresiva: 17192, codigo: 'CUL', nombre: 'La Cultura' },
    { orden: 15, progresiva: 18883, codigo: 'NAR', nombre: 'Nicolás Arriola' },
    { orden: 16, progresiva: 19893, codigo: 'GAM', nombre: 'Gamarra' },
    { orden: 17, progresiva: 21252, codigo: 'MIG', nombre: 'Miguel Grau' },
    { orden: 18, progresiva: 22270, codigo: 'ELA', nombre: 'El Ángel' },
    { orden: 19, progresiva: 22804, codigo: 'PM', nombre: 'Presbítero Maestro' },
    { orden: 20, progresiva: 24445, codigo: 'CAA', nombre: 'Caja de Agua' },
    { orden: 21, progresiva: 25885, codigo: 'PIR', nombre: 'Pirámide del Sol' },
    { orden: 22, progresiva: 27218, codigo: 'JAR', nombre: 'Los Jardines' },
    { orden: 23, progresiva: 28516, codigo: 'POS', nombre: 'Los Postes' },
    { orden: 24, progresiva: 29945, codigo: 'SCA', nombre: 'San Carlos' },
    { orden: 25, progresiva: 31342, codigo: 'SMA', nombre: 'San Martín' },
    { orden: 26, progresiva: 32384, codigo: 'SRO', nombre: 'Santa Rosa' },
    { orden: 27, progresiva: 33491, codigo: 'BAY', nombre: 'Bayóvar' },
    { orden: 28, progresiva: 34000, codigo: 'FIN', nombre: 'Fin de Línea' },
  ];

  let insertados = 0;
  let saltados = 0;

  for (const estacion of estaciones) {
    const codigoTramo = asignacion[estacion.codigo];
    const tramoId = codigoTramo ? tramoMap.get(codigoTramo) : null;

    if (!tramoId) {
      console.warn(`     ⚠️ Tramo no encontrado para ${estacion.codigo}`);
      saltados++;
      continue;
    }

    const existe = await estacionRepo.findOne({ where: { codigo: estacion.codigo } });
    if (existe) {
      saltados++;
      continue;
    }

    await estacionRepo.save(estacionRepo.create({ ...estacion, tramoId }));
    insertados++;
  }

  console.log(`     ✅ ${insertados} insertadas, ${saltados} saltadas`);
}