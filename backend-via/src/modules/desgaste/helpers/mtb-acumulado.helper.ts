/**
 * ============================================================
 * Helper: cálculo de MTB acumulado.
 * ============================================================
 * Recibe valores anuales ordenados ASC y devuelve la lista con
 * el MTB acumulado calculado año por año.
 *
 * Ejemplo:
 *   input:  [{anio: 2020, mtb: 10}, {anio: 2021, mtb: 11}, {anio: 2022, mtb: 12}]
 *   output: [
 *     {anio: 2020, mtb: 10, mtbAcumulado: 10},
 *     {anio: 2021, mtb: 11, mtbAcumulado: 21},
 *     {anio: 2022, mtb: 12, mtbAcumulado: 33}
 *   ]
 *
 * IMPORTANTE: la entrada debe estar ORDENADA por año ASC. Si
 * no, el cálculo es incorrecto. Esto se garantiza en el repo.
 *
 * Usado por: ValoresMtbService, G1, G2, G3.
 * ============================================================
 */
export interface ValorAnualConAcumulado {
  anio: number;
  mtb: number;
  mtbAcumulado: number;
}

export function calcularMtbAcumulado(
  valoresOrdenados: Array<{ anio: number; mtb: number }>,
): ValorAnualConAcumulado[] {
  let acumulado = 0;
  return valoresOrdenados.map((v) => {
    acumulado += v.mtb;
    return {
      anio: v.anio,
      mtb: v.mtb,
      mtbAcumulado: redondear3(acumulado),
    };
  });
}

/**
 * Devuelve el MTB acumulado HASTA un año específico (inclusive).
 * Si el año no está en los valores, devuelve la última suma anterior.
 *
 * Útil para los gráficos donde el eje X es MTB acumulado:
 * dado un año, ¿cuánto MTB acumulado le corresponde?
 */
export function obtenerMtbAcumuladoHasta(
  valoresOrdenados: Array<{ anio: number; mtb: number }>,
  anioObjetivo: number,
): number {
  let acumulado = 0;
  for (const v of valoresOrdenados) {
    if (v.anio > anioObjetivo) break;
    acumulado += v.mtb;
  }
  return redondear3(acumulado);
}

/** Helper interno para redondear a 3 decimales. */
function redondear3(n: number): number {
  return Math.round(n * 1000) / 1000;
}