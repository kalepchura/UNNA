import { DataSource } from 'typeorm';
import { CurvaVertical } from '../../src/modules/catalogos/curvas-verticales/entities/curva-vertical.entity';
import { Estacion } from '../../src/modules/catalogos/estaciones/entities/estacion.entity';
import { TipoVia } from '../../src/common/enums';

// Definir el tipo para cada curva
type CurvaVerticalData = {
  nombre: string;
  via: TipoVia;
  inicioM: number;
  finM: number;
  pkVertice: number;
  pendienteEntrada: number;
  pendienteSalida: number;
  radio: number;
};

export async function seedCurvasVerticales(ds: DataSource): Promise<void> {
  console.log('  → Sembrando curvas verticales...');
  
  const repo = ds.getRepository(CurvaVertical);
  const estacionRepo = ds.getRepository(Estacion);

  // Cargar estaciones ordenadas por progresiva
  const estaciones = await estacionRepo.find({ order: { progresiva: 'ASC' } });
  console.log(`     📍 ${estaciones.length} estaciones cargadas`);
  
  // Función para encontrar estación por progresiva (devuelve number | null)
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

  // Datos con tipos explícitos - usando el enum TipoVia
  const curvasData: CurvaVerticalData[] = [
    { nombre: 'Curva V-1', via: TipoVia.PAR, inicioM: 233, finM: 308, pkVertice: 271, pendienteEntrada: -2.191, pendienteSalida: 0.019, radio: 3392 },
    { nombre: 'Curva V-2', via: TipoVia.PAR, inicioM: 493, finM: 564, pkVertice: 528, pendienteEntrada: 0.019, pendienteSalida: -2.589, radio: 2722 },
    { nombre: 'Curva V-3', via: TipoVia.PAR, inicioM: 680, finM: 720, pkVertice: 700, pendienteEntrada: -2.589, pendienteSalida: -2.485, radio: 38443 },
    { nombre: 'Curva V-4', via: TipoVia.PAR, inicioM: 1141, finM: 1205, pkVertice: 1173, pendienteEntrada: -2.485, pendienteSalida: -1.718, radio: 8349 },
    { nombre: 'Curva V-5', via: TipoVia.PAR, inicioM: 1354, finM: 1417, pkVertice: 1386, pendienteEntrada: -1.718, pendienteSalida: -3.5, radio: 3502 },
    { nombre: 'Curva V-6', via: TipoVia.PAR, inicioM: 1605, finM: 1706, pkVertice: 1656, pendienteEntrada: -3.5, pendienteSalida: -0.496, radio: 3362 },
    { nombre: 'Curva V-7', via: TipoVia.PAR, inicioM: 1856, finM: 1951, pkVertice: 1903, pendienteEntrada: -0.496, pendienteSalida: -3.319, radio: 3365 },
    { nombre: 'Curva V-8', via: TipoVia.PAR, inicioM: 2368, finM: 2408, pkVertice: 2387, pendienteEntrada: -3.319, pendienteSalida: -3.507, radio: 21310 },
    { nombre: 'Curva V-9', via: TipoVia.PAR, inicioM: 2666, finM: 2716, pkVertice: 2691, pendienteEntrada: -3.507, pendienteSalida: -3.416, radio: 55369 },
    { nombre: 'Curva V-10', via: TipoVia.PAR, inicioM: 2825, finM: 2865, pkVertice: 2845, pendienteEntrada: -3.416, pendienteSalida: -3.479, radio: 64427 },
    { nombre: 'Curva V-11', via: TipoVia.PAR, inicioM: 2984, finM: 3054, pkVertice: 3019, pendienteEntrada: -3.479, pendienteSalida: -2.216, radio: 5544 },
    { nombre: 'Curva V-12', via: TipoVia.PAR, inicioM: 3313, finM: 3391, pkVertice: 3352, pendienteEntrada: -2.216, pendienteSalida: 0.003, radio: 3515 },
    { nombre: 'Curva V-13', via: TipoVia.IMPAR, inicioM: 3683, finM: 3757, pkVertice: 3720, pendienteEntrada: 0.003, pendienteSalida: 2.46, radio: 3012 },
    { nombre: 'Curva V-14', via: TipoVia.IMPAR, inicioM: 4091, finM: 4151, pkVertice: 4121, pendienteEntrada: 2.46, pendienteSalida: 3.16, radio: 8572 },
    { nombre: 'Curva V-15', via: TipoVia.IMPAR, inicioM: 4441, finM: 4499, pkVertice: 4470, pendienteEntrada: 3.16, pendienteSalida: 1.768, radio: 4167 },
    { nombre: 'Curva V-16', via: TipoVia.IMPAR, inicioM: 4659, finM: 4709, pkVertice: 4684, pendienteEntrada: 1.768, pendienteSalida: 1.93, radio: 30984 },
    { nombre: 'Curva V-17', via: TipoVia.IMPAR, inicioM: 4775, finM: 4810, pkVertice: 4793, pendienteEntrada: 1.93, pendienteSalida: 1.611, radio: 10979 },
    { nombre: 'Curva V-18', via: TipoVia.IMPAR, inicioM: 4924, finM: 4980, pkVertice: 4952, pendienteEntrada: 1.611, pendienteSalida: 0.422, radio: 24709 },
    { nombre: 'Curva V-19', via: TipoVia.PAR, inicioM: 5415, finM: 5518, pkVertice: 5467, pendienteEntrada: 0.422, pendienteSalida: -2.819, radio: 3179 },
    { nombre: 'Curva V-20', via: TipoVia.PAR, inicioM: 5929, finM: 6005, pkVertice: 5967, pendienteEntrada: -2.819, pendienteSalida: -0.349, radio: 3077 },
    { nombre: 'Curva V-21', via: TipoVia.PAR, inicioM: 6250, finM: 6280, pkVertice: 6265, pendienteEntrada: -0.349, pendienteSalida: -0.143, radio: 14505 },
    { nombre: 'Curva V-22', via: TipoVia.PAR, inicioM: 6297, finM: 6337, pkVertice: 6317, pendienteEntrada: -0.143, pendienteSalida: -0.273, radio: 30711 },
    { nombre: 'Curva V-23', via: TipoVia.PAR, inicioM: 6396, finM: 6436, pkVertice: 6416, pendienteEntrada: -0.273, pendienteSalida: -0.329, radio: 71005 },
    { nombre: 'Curva V-24', via: TipoVia.PAR, inicioM: 6507, finM: 6589, pkVertice: 6548, pendienteEntrada: -0.329, pendienteSalida: -3.518, radio: 2569 },
    { nombre: 'Curva V-25', via: TipoVia.PAR, inicioM: 6860, finM: 6928, pkVertice: 6894, pendienteEntrada: -3.518, pendienteSalida: -1.6, radio: 83699 },
    { nombre: 'Curva V-26', via: TipoVia.PAR, inicioM: 7140, finM: 7186, pkVertice: 7163, pendienteEntrada: -1.68, pendienteSalida: -0.554, radio: 4085 },
    { nombre: 'Curva V-27', via: TipoVia.PAR, inicioM: 7249, finM: 7269, pkVertice: 7259, pendienteEntrada: -0.554, pendienteSalida: -0.147, radio: 4917 },
    { nombre: 'Curva V-28', via: TipoVia.PAR, inicioM: 7605, finM: 7645, pkVertice: 7625, pendienteEntrada: -0.147, pendienteSalida: -0.112, radio: 114690 },
    { nombre: 'Curva V-29', via: TipoVia.PAR, inicioM: 7994, finM: 8199, pkVertice: 8097, pendienteEntrada: -0.112, pendienteSalida: -2.526, radio: 8493 },
    { nombre: 'Curva V-30', via: TipoVia.PAR, inicioM: 8437, finM: 8539, pkVertice: 8488, pendienteEntrada: -2.526, pendienteSalida: -3.491, radio: 10562 },
    { nombre: 'Curva V-31', via: TipoVia.PAR, inicioM: 8772, finM: 8844, pkVertice: 8808, pendienteEntrada: -3.491, pendienteSalida: -0.672, radio: 2554 },
    { nombre: 'Curva V-32', via: TipoVia.PAR, inicioM: 8887, finM: 8909, pkVertice: 8898, pendienteEntrada: -0.672, pendienteSalida: -0.103, radio: 3865 },
    { nombre: 'Curva V-33', via: TipoVia.PAR, inicioM: 9022, finM: 9047, pkVertice: 9034, pendienteEntrada: -0.103, pendienteSalida: -0.733, radio: 3968 },
    { nombre: 'Curva V-34', via: TipoVia.PAR, inicioM: 9172, finM: 9237, pkVertice: 9204, pendienteEntrada: -0.733, pendienteSalida: -1.836, radio: 5894 },
    { nombre: 'Curva V-35', via: TipoVia.PAR, inicioM: 9552, finM: 9652, pkVertice: 9602, pendienteEntrada: -1.836, pendienteSalida: 0.474, radio: 4328 },
    { nombre: 'Curva V-36', via: TipoVia.IMPAR, inicioM: 9869, finM: 10019, pkVertice: 9944, pendienteEntrada: 0.474, pendienteSalida: 0.372, radio: 147162 },
    { nombre: 'Curva V-37', via: TipoVia.IMPAR, inicioM: 10024, finM: 10104, pkVertice: 10064, pendienteEntrada: 0.372, pendienteSalida: 0.736, radio: 21975 },
    { nombre: 'Curva V-38', via: TipoVia.IMPAR, inicioM: 10413, finM: 10448, pkVertice: 10431, pendienteEntrada: 0.736, pendienteSalida: 0.267, radio: 7448 },
    { nombre: 'Curva V-39', via: TipoVia.IMPAR, inicioM: 10632, finM: 10662, pkVertice: 10647, pendienteEntrada: 0.267, pendienteSalida: 0.611, radio: 8715 },
    { nombre: 'Curva V-40', via: TipoVia.IMPAR, inicioM: 10842, finM: 10928, pkVertice: 10885, pendienteEntrada: 0.611, pendienteSalida: 2.899, radio: 3758 },
    { nombre: 'Curva V-41', via: TipoVia.IMPAR, inicioM: 10959, finM: 11031, pkVertice: 10995, pendienteEntrada: 2.899, pendienteSalida: 0.837, radio: 3516 },
    { nombre: 'Curva V-42', via: TipoVia.IMPAR, inicioM: 11349, finM: 11424, pkVertice: 11386, pendienteEntrada: 0.837, pendienteSalida: 2.9, radio: 3534 },
    { nombre: 'Curva V-43', via: TipoVia.IMPAR, inicioM: 11493, finM: 11579, pkVertice: 11536, pendienteEntrada: 2.96, pendienteSalida: 0.249, radio: 3173 },
    { nombre: 'Curva V-44', via: TipoVia.IMPAR, inicioM: 11802, finM: 11836, pkVertice: 11819, pendienteEntrada: 0.249, pendienteSalida: 1.037, radio: 4320 },
    { nombre: 'Curva V-45', via: TipoVia.IMPAR, inicioM: 11925, finM: 11961, pkVertice: 11943, pendienteEntrada: 1.037, pendienteSalida: 0.506, radio: 6786 },
    { nombre: 'Curva V-46', via: TipoVia.IMPAR, inicioM: 12230, finM: 12264, pkVertice: 12247, pendienteEntrada: 0.506, pendienteSalida: 1.613, radio: 3071 },
    { nombre: 'Curva V-47', via: TipoVia.IMPAR, inicioM: 12372, finM: 12412, pkVertice: 12392, pendienteEntrada: 1.613, pendienteSalida: 0.284, radio: 3010 },
    { nombre: 'Curva V-48', via: TipoVia.IMPAR, inicioM: 12671, finM: 12731, pkVertice: 12701, pendienteEntrada: 0.284, pendienteSalida: 1.761, radio: 4064 },
    { nombre: 'Curva V-49', via: TipoVia.IMPAR, inicioM: 13059, finM: 13089, pkVertice: 13074, pendienteEntrada: 1.761, pendienteSalida: 1.574, radio: 16064 },
    { nombre: 'Curva V-50', via: TipoVia.IMPAR, inicioM: 13443, finM: 13488, pkVertice: 13465, pendienteEntrada: 1.574, pendienteSalida: 1.061, radio: 8766 },
    { nombre: 'Curva V-51', via: TipoVia.IMPAR, inicioM: 13910, finM: 13938, pkVertice: 13924, pendienteEntrada: 1.061, pendienteSalida: 0.963, radio: 28705 },
    { nombre: 'Curva V-52', via: TipoVia.IMPAR, inicioM: 14184, finM: 14259, pkVertice: 14221, pendienteEntrada: 0.963, pendienteSalida: 3.022, radio: 3642 },
    { nombre: 'Curva V-53', via: TipoVia.IMPAR, inicioM: 14364, finM: 14444, pkVertice: 14404, pendienteEntrada: 3.022, pendienteSalida: 0.497, radio: 3167 },
    { nombre: 'Curva V-54', via: TipoVia.IMPAR, inicioM: 14661, finM: 14706, pkVertice: 14683, pendienteEntrada: 0.497, pendienteSalida: 1.376, radio: 5115 },
    { nombre: 'Curva V-55', via: TipoVia.IMPAR, inicioM: 15499, finM: 15529, pkVertice: 15514, pendienteEntrada: 1.376, pendienteSalida: 0.497, radio: 3409 },
    { nombre: 'Curva V-56', via: TipoVia.IMPAR, inicioM: 15776, finM: 15836, pkVertice: 15806, pendienteEntrada: 0.497, pendienteSalida: 1.716, radio: 4920 },
    { nombre: 'Curva V-57', via: TipoVia.IMPAR, inicioM: 15912, finM: 15946, pkVertice: 15929, pendienteEntrada: 1.716, pendienteSalida: 0.838, radio: 3871 },
    { nombre: 'Curva V-58', via: TipoVia.IMPAR, inicioM: 16788, finM: 16822, pkVertice: 16805, pendienteEntrada: 0.838, pendienteSalida: 0.993, radio: 21848 },
    { nombre: 'Curva V-59', via: TipoVia.IMPAR, inicioM: 16984, finM: 17011, pkVertice: 16998, pendienteEntrada: 0.993, pendienteSalida: 0.5, radio: 5476 },
    { nombre: 'Curva V-60', via: TipoVia.IMPAR, inicioM: 17335, finM: 17390, pkVertice: 17363, pendienteEntrada: 0.5, pendienteSalida: 2.266, radio: 3115 },
    { nombre: 'Curva V-61', via: TipoVia.IMPAR, inicioM: 17474, finM: 17532, pkVertice: 17503, pendienteEntrada: 2.266, pendienteSalida: 0.616, radio: 3516 },
    { nombre: 'Curva V-62', via: TipoVia.PAR, inicioM: 17765, finM: 17839, pkVertice: 17802, pendienteEntrada: 0.616, pendienteSalida: -1.5, radio: 3415 },
    { nombre: 'Curva V-63', via: TipoVia.PAR, inicioM: 18150, finM: 18214, pkVertice: 18182, pendienteEntrada: -1.55, pendienteSalida: -0.124, radio: 4488 },
    { nombre: 'Curva V-64', via: TipoVia.IMPAR, inicioM: 18691, finM: 18721, pkVertice: 18706, pendienteEntrada: -0.124, pendienteSalida: 0.5, radio: 4806 },
    { nombre: 'Curva V-65', via: TipoVia.IMPAR, inicioM: 19148, finM: 19178, pkVertice: 19163, pendienteEntrada: 0.5, pendienteSalida: 0.5, radio: 6001 },
    { nombre: 'Curva V-66', via: TipoVia.IMPAR, inicioM: 19563, finM: 19593, pkVertice: 19578, pendienteEntrada: 0, pendienteSalida: 0.5, radio: 6000 },
    { nombre: 'Curva V-67', via: TipoVia.IMPAR, inicioM: 20014, finM: 20046, pkVertice: 20030, pendienteEntrada: 0.5, pendienteSalida: 1.031, radio: 6031 },
    { nombre: 'Curva V-68', via: TipoVia.IMPAR, inicioM: 20408, finM: 20443, pkVertice: 20425, pendienteEntrada: 1.031, pendienteSalida: 0.001, radio: 13395 },
    { nombre: 'Curva V-69', via: TipoVia.IMPAR, inicioM: 20591, finM: 20651, pkVertice: 20621, pendienteEntrada: 0.001, pendienteSalida: 1.944, radio: 3087 },
    { nombre: 'Curva V-70', via: TipoVia.IMPAR, inicioM: 20651, finM: 20679, pkVertice: 20665, pendienteEntrada: 1.944, pendienteSalida: 2.957, radio: 2798 },
    { nombre: 'Curva V-71', via: TipoVia.IMPAR, inicioM: 21026, finM: 21115, pkVertice: 21071, pendienteEntrada: 2.957, pendienteSalida: 0.002, radio: 3013 },
    { nombre: 'Curva V-72', via: TipoVia.IMPAR, inicioM: 21538, finM: 21663, pkVertice: 21601, pendienteEntrada: 0.002, pendienteSalida: 1.373, radio: 9103 },
    { nombre: 'Curva V-73', via: TipoVia.IMPAR, inicioM: 21980, finM: 22040, pkVertice: 22010, pendienteEntrada: 1.373, pendienteSalida: 0.5, radio: 6861 },
    { nombre: 'Curva V-74', via: TipoVia.PAR, inicioM: 22556, finM: 22592, pkVertice: 22574, pendienteEntrada: 0.5, pendienteSalida: -0.5, radio: 3602 },
    { nombre: 'Curva V-75', via: TipoVia.IMPAR, inicioM: 22978, finM: 23077, pkVertice: 23028, pendienteEntrada: -0.5, pendienteSalida: 2.02, radio: 3933 },
    { nombre: 'Curva V-76', via: TipoVia.IMPAR, inicioM: 23245, finM: 23275, pkVertice: 23260, pendienteEntrada: 2.02, pendienteSalida: 2.17, radio: 20055 },
    { nombre: 'Curva V-77', via: TipoVia.IMPAR, inicioM: 23350, finM: 23440, pkVertice: 23395, pendienteEntrada: 2.17, pendienteSalida: -0.032, radio: 4089 },
    { nombre: 'Curva V-78', via: TipoVia.IMPAR, inicioM: 23696, finM: 23726, pkVertice: 23711, pendienteEntrada: -0.032, pendienteSalida: 0.08, radio: 6857 },
    { nombre: 'Curva V-79', via: TipoVia.IMPAR, inicioM: 23821, finM: 23851, pkVertice: 23836, pendienteEntrada: 0.08, pendienteSalida: -0.049, radio: 23297 },
    { nombre: 'Curva V-80', via: TipoVia.PAR, inicioM: 24014, finM: 24068, pkVertice: 24041, pendienteEntrada: -0.049, pendienteSalida: -1.804, radio: 3083 },
    { nombre: 'Curva V-81', via: TipoVia.PAR, inicioM: 24179, finM: 24234, pkVertice: 24206, pendienteEntrada: -1.804, pendienteSalida: 0, radio: 3000 },
    { nombre: 'Curva V-82', via: TipoVia.IMPAR, inicioM: 24805, finM: 24885, pkVertice: 24845, pendienteEntrada: 0, pendienteSalida: 1.865, radio: 4289 },
    { nombre: 'Curva V-83', via: TipoVia.IMPAR, inicioM: 25349, finM: 25429, pkVertice: 25389, pendienteEntrada: 1.865, pendienteSalida: 3.006, radio: 7020 },
    { nombre: 'Curva V-84', via: TipoVia.IMPAR, inicioM: 25609, finM: 25733, pkVertice: 25671, pendienteEntrada: 3.006, pendienteSalida: 0.5, radio: 4970 },
    { nombre: 'Curva V-85', via: TipoVia.IMPAR, inicioM: 25997, finM: 26057, pkVertice: 26027, pendienteEntrada: 0.5, pendienteSalida: 0.073, radio: 13945 },
    { nombre: 'Curva V-86', via: TipoVia.IMPAR, inicioM: 28113, finM: 28173, pkVertice: 28143, pendienteEntrada: 0.073, pendienteSalida: 0.882, radio: 7432 },
    { nombre: 'Curva V-87', via: TipoVia.IMPAR, inicioM: 28316, finM: 28376, pkVertice: 28346, pendienteEntrada: 0.882, pendienteSalida: 0.5, radio: 15764 },
    { nombre: 'Curva V-88', via: TipoVia.IMPAR, inicioM: 28657, finM: 28717, pkVertice: 28687, pendienteEntrada: 0.5, pendienteSalida: 0.927, radio: 14031 },
    { nombre: 'Curva V-89', via: TipoVia.IMPAR, inicioM: 29563, finM: 29623, pkVertice: 29593, pendienteEntrada: 0.927, pendienteSalida: 0.5, radio: 14018 },
    { nombre: 'Curva V-90', via: TipoVia.IMPAR, inicioM: 30131, finM: 30191, pkVertice: 30161, pendienteEntrada: 0.5, pendienteSalida: 1.573, radio: 5595 },
    { nombre: 'Curva V-91', via: TipoVia.IMPAR, inicioM: 31185, finM: 31225, pkVertice: 31205, pendienteEntrada: 1.573, pendienteSalida: 0.5, radio: 3730 },
    { nombre: 'Curva V-92', via: TipoVia.IMPAR, inicioM: 31438, finM: 31543, pkVertice: 31491, pendienteEntrada: 0.5, pendienteSalida: 3.376, radio: 3651 },
    { nombre: 'Curva V-93', via: TipoVia.IMPAR, inicioM: 32179, finM: 32269, pkVertice: 32224, pendienteEntrada: 3.376, pendienteSalida: 0.5, radio: 3129 },
    { nombre: 'Curva V-94', via: TipoVia.IMPAR, inicioM: 32445, finM: 32550, pkVertice: 32497, pendienteEntrada: 0.5, pendienteSalida: 3.5, radio: 3500 },
    { nombre: 'Curva V-95', via: TipoVia.IMPAR, inicioM: 33322, finM: 33412, pkVertice: 33367, pendienteEntrada: 3.5, pendienteSalida: 0.5, radio: 3000 },
  ];

  let insertados = 0;
  let saltados = 0;

  for (const curva of curvasData) {
    // Verificar si ya existe por nombre y vía
    const existe = await repo.findOne({ 
      where: { 
        nombre: curva.nombre, 
        via: curva.via 
      } 
    });
    
    if (existe) {
      saltados++;
      continue;
    }

    // Crear SIN id (autoincremental)
    const nuevaCurva = repo.create({
      nombre: curva.nombre,
      via: curva.via,
      inicioM: curva.inicioM,
      finM: curva.finM,
      pkVertice: curva.pkVertice,
      pendienteEntrada: curva.pendienteEntrada,
      pendienteSalida: curva.pendienteSalida,
      radio: curva.radio,
    });

    await repo.save(nuevaCurva);
    insertados++;
  }

  console.log(`     ✅ ${insertados} curvas verticales insertadas, ${saltados} ya existían`);
}