/**
 * utils-carga-tramos.ts
 *
 * CORRECCIONES DEFINITIVAS:
 * - obtenerIndiceTramo usa progresivaInicio directamente, igual que
 *   tramoDeProgresiva en esquema-base. Sin punto medio, sin mapaTramo.
 * - cargaFallas: usa el.progresivaInicio (no el punto medio inicio+fin).
 *   El punto medio desplazaba el conteo al tramo siguiente cuando el
 *   elemento empezaba cerca del final de un tramo.
 * - cargaDesgasteGeneral / cargaDesgasteIndice: sin cambios de lógica,
 *   ya usaban p.progresiva directamente (punto fijo).
 */

import type {
  EstacionEsquema,
  LineaFallas,
  LineaDesgaste,
  LineaDesgasteIndice,
  TramoColoreadoTemperatura,
  SegmentacionFallas,
  TramoEsquema,
} from '../types/mapa-calor.types';

/**
 * Resuelve el índice de tramo para una progresiva dada buscando
 * el rango entre estaciones consecutivas.
 *
 * Misma lógica que tramoDeProgresiva en esquema-base:
 * - i < N-2: rango semiabierto [pA, pB)
 * - i = N-2: rango cerrado     [pA, pB]
 */
function obtenerIndiceTramo(
  progresivaInicio: number,
  estaciones: EstacionEsquema[],
): number {
  const ests = [...estaciones].sort((a, b) => a.progresiva - b.progresiva);
  const N = ests.length;

  for (let i = 0; i < N - 1; i++) {
    const enRango =
      i < N - 2
        ? progresivaInicio >= ests[i].progresiva && progresivaInicio < ests[i + 1].progresiva
        : progresivaInicio >= ests[i].progresiva && progresivaInicio <= ests[i + 1].progresiva;
    if (enRango) return i;
  }

  if (progresivaInicio < ests[0]?.progresiva) return 0;
  return Math.max(0, N - 2);
}

export function cargaTemperatura(
  _tramos: TramoColoreadoTemperatura[],
): Record<number, number> {
  // La capa de temperatura pinta tramos completos con strokeWidth fijo;
  // no necesita expandir el espacio vertical de ningún tramo.
  return {};
}

export function cargaFallas(
  lineas: LineaFallas[],
  segmentacion: SegmentacionFallas,
  estaciones: EstacionEsquema[],
  _tramos: TramoEsquema[],
): Record<number, number> {
  // En modo TRAMO cada elemento ocupa el tramo completo con una línea gruesa,
  // no hay superposición de puntos dentro del tramo → sin expansión.
  if (segmentacion === 'TRAMO') return {};

  const contadores: Record<number, Record<string, number>> = {};

  lineas.forEach((linea) => {
    linea.elementos.forEach((el) => {
      // Usar progresivaInicio directamente — mismo criterio que tramoDeProgresiva.
      // El punto medio (inicio+fin)/2 desplazaba el conteo al tramo incorrecto.
      const t = obtenerIndiceTramo(el.progresivaInicio, estaciones);
      if (!contadores[t]) contadores[t] = {};
      contadores[t][linea.via] = (contadores[t][linea.via] ?? 0) + 1;
    });
  });

  const resultado: Record<number, number> = {};
  Object.entries(contadores).forEach(([tStr, viaConteos]) => {
    resultado[+tStr] = Math.max(...Object.values(viaConteos));
  });
  return resultado;
}

export function cargaDesgasteGeneral(
  lineas: LineaDesgaste[],
  estaciones: EstacionEsquema[],
  _tramos: TramoEsquema[],
): Record<number, number> {
  const contadores: Record<number, Record<string, number>> = {};

  lineas.forEach((linea) => {
    const carril = `${linea.via}-${linea.riel}`;
    linea.puntos.forEach((p) => {
      const t = obtenerIndiceTramo(p.progresiva, estaciones);
      if (!contadores[t]) contadores[t] = {};
      contadores[t][carril] = (contadores[t][carril] ?? 0) + 1;
    });
  });

  const resultado: Record<number, number> = {};
  Object.entries(contadores).forEach(([tStr, carrilConteos]) => {
    resultado[+tStr] = Math.max(...Object.values(carrilConteos));
  });
  return resultado;
}

export function cargaDesgasteIndice(
  lineas: LineaDesgasteIndice[],
  estaciones: EstacionEsquema[],
  _tramos: TramoEsquema[],
): Record<number, number> {
  const contadores: Record<number, Record<string, number>> = {};

  lineas.forEach((linea) => {
    const carril = `${linea.via}-${linea.riel}`;
    linea.puntos.forEach((p) => {
      const t = obtenerIndiceTramo(p.progresiva, estaciones);
      if (!contadores[t]) contadores[t] = {};
      contadores[t][carril] = (contadores[t][carril] ?? 0) + 1;
    });
  });

  const resultado: Record<number, number> = {};
  Object.entries(contadores).forEach(([tStr, carrilConteos]) => {
    resultado[+tStr] = Math.max(...Object.values(carrilConteos));
  });
  return resultado;
}