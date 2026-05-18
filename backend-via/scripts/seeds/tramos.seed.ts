import { DataSource } from 'typeorm';
import { Tramo } from '../../src/modules/catalogos/tramos/entities/tramo.entity';

/**
 * ============================================================
 * Seed de Tramos - Línea 1
 * ============================================================
 * Carga los 28 tramos de la Línea 1 del Metro de Lima.
 * 
 * Datos basados en:
 * - Progresivas: metros desde el origen
 * - Códigos: identificadores únicos por tramo
 * - Nombres: descripción amigable
 * 
 * Idempotente: si el tramo (por código) ya existe, lo salta.
 * ============================================================
 */
export async function seedTramos(dataSource: DataSource): Promise<void> {
  console.log('  → Sembrando tramos (Línea 1)...');

  const repo = dataSource.getRepository(Tramo);

  const tramos: Partial<Tramo>[] = [
    {
      orden: 1,
      progresivaInicio: -1000,
      progresivaFin: -37,
      codigo: 'PRE-PT',
      nombre: 'Inicio Línea → Patio Taller',
    },
    {
      orden: 2,
      progresivaInicio: -36,
      progresivaFin: 373,
      codigo: 'PT-VES',
      nombre: 'Patio Taller → Villa El Salvador',
    },
    {
      orden: 3,
      progresivaInicio: 374,
      progresivaFin: 1786,
      codigo: 'VES-PIN',
      nombre: 'Villa El Salvador → Parque Industrial',
    },
    {
      orden: 4,
      progresivaInicio: 1787,
      progresivaFin: 3608,
      codigo: 'PIN-PUM',
      nombre: 'Parque Industrial → Pumacahua',
    },
    {
      orden: 5,
      progresivaInicio: 3609,
      progresivaFin: 5076,
      codigo: 'PUM-VMA',
      nombre: 'Pumacahua → Villa María',
    },
    {
      orden: 6,
      progresivaInicio: 5077,
      progresivaFin: 6170,
      codigo: 'VMA-MAU',
      nombre: 'Villa María → María Auxiliadora',
    },
    {
      orden: 7,
      progresivaInicio: 6171,
      progresivaFin: 7344,
      codigo: 'MAU-SJU',
      nombre: 'María Auxiliadora → San Juan',
    },
    {
      orden: 8,
      progresivaInicio: 7345,
      progresivaFin: 8966,
      codigo: 'SJU-ATO',
      nombre: 'San Juan → Atocongo',
    },
    {
      orden: 9,
      progresivaInicio: 8967,
      progresivaFin: 10558,
      codigo: 'ATO-JCH',
      nombre: 'Atocongo → Jorge Chávez',
    },
    {
      orden: 10,
      progresivaInicio: 10559,
      progresivaFin: 11641,
      codigo: 'JCH-AYA',
      nombre: 'Jorge Chávez → Ayacucho',
    },
    {
      orden: 11,
      progresivaInicio: 11642,
      progresivaFin: 12609,
      codigo: 'AYA-CAB',
      nombre: 'Ayacucho → Cabitos',
    },
    {
      orden: 12,
      progresivaInicio: 12610,
      progresivaFin: 14549,
      codigo: 'CAB-ANG',
      nombre: 'Cabitos → Angamos',
    },
    {
      orden: 13,
      progresivaInicio: 14550,
      progresivaFin: 15653,
      codigo: 'ANG-SBS',
      nombre: 'Angamos → San Borja Sur',
    },
    {
      orden: 14,
      progresivaInicio: 15654,
      progresivaFin: 17191,
      codigo: 'SBS-CUL',
      nombre: 'San Borja Sur → La Cultura',
    },
    {
      orden: 15,
      progresivaInicio: 17192,
      progresivaFin: 18882,
      codigo: 'CUL-NAR',
      nombre: 'La Cultura → Nicolás Arriola',
    },
    {
      orden: 16,
      progresivaInicio: 18883,
      progresivaFin: 19892,
      codigo: 'NAR-GAM',
      nombre: 'Nicolás Arriola → Gamarra',
    },
    {
      orden: 17,
      progresivaInicio: 19893,
      progresivaFin: 21251,
      codigo: 'GAM-MIG',
      nombre: 'Gamarra → Miguel Grau',
    },
    {
      orden: 18,
      progresivaInicio: 21252,
      progresivaFin: 22269,
      codigo: 'MIG-ELA',
      nombre: 'Miguel Grau → El Ángel',
    },
    {
      orden: 19,
      progresivaInicio: 22270,
      progresivaFin: 22803,
      codigo: 'ELA-PM',
      nombre: 'El Ángel → Presbítero Maestro',
    },
    {
      orden: 20,
      progresivaInicio: 22804,
      progresivaFin: 24444,
      codigo: 'PRE-CAA',
      nombre: 'Presbítero Maestro → Caja de Agua',
    },
    {
      orden: 21,
      progresivaInicio: 24445,
      progresivaFin: 25884,
      codigo: 'CAA-PIR',
      nombre: 'Caja de Agua → Pirámide del Sol',
    },
    {
      orden: 22,
      progresivaInicio: 25885,
      progresivaFin: 27217,
      codigo: 'PIR-JAR',
      nombre: 'Pirámide del Sol → Los Jardines',
    },
    {
      orden: 23,
      progresivaInicio: 27218,
      progresivaFin: 28515,
      codigo: 'JAR-POS',
      nombre: 'Los Jardines → Los Postes',
    },
    {
      orden: 24,
      progresivaInicio: 28516,
      progresivaFin: 29944,
      codigo: 'POS-SCA',
      nombre: 'Los Postes → San Carlos',
    },
    {
      orden: 25,
      progresivaInicio: 29945,
      progresivaFin: 31341,
      codigo: 'SCA-SMA',
      nombre: 'San Carlos → San Martín',
    },
    {
      orden: 26,
      progresivaInicio: 31342,
      progresivaFin: 32383,
      codigo: 'SMA-SRO',
      nombre: 'San Martín → Santa Rosa',
    },
    {
      orden: 27,
      progresivaInicio: 32384,
      progresivaFin: 33490,
      codigo: 'SRO-BAY',
      nombre: 'Santa Rosa → Bayóvar',
    },
    {
      orden: 28,
      progresivaInicio: 33491,
      progresivaFin: 34000,
      codigo: 'BAY-FIN',
      nombre: 'Bayóvar → Fin de Línea',
    },
  ];

  let insertados = 0;
  let salteados = 0;

  for (const tramo of tramos) {
    const existente = await repo.findOne({ where: { codigo: tramo.codigo } });
    
    if (existente) {
      salteados++;
      console.log(`     ⏭️  Salteado: ${tramo.codigo} (ya existe)`);
      continue;
    }

    await repo.save(repo.create(tramo));
    insertados++;
    console.log(`     ✅ Insertado: ${tramo.codigo} - ${tramo.nombre}`);
  }

  console.log(`\n  📊 Resumen: ${insertados} insertados, ${salteados} ya existían`);
}