/**
 * Helpers de formato para el Mapa de Calor.
 */

/**
 * Convierte progresiva en metros al formato ferroviario "km+m".
 *
 * Ejemplo:
 *  - 429   → "0+429"
 *  - 1786  → "1+786"
 *  - -37   → "-0+037"
 */
export function fmtProgresiva(metros: number | null | undefined): string {
  if (metros == null) return '—';
  const signo = metros < 0 ? '-' : '';
  const abs = Math.abs(Math.round(metros));
  const km = Math.floor(abs / 1000);
  const m = abs % 1000;
  return `${signo}${km}+${String(m).padStart(3, '0')}`;
}

/**
 * Formatea distancia entre dos progresivas en "m" o "km".
 */
export function fmtDistancia(metros: number): string {
  const abs = Math.abs(metros);
  if (abs >= 1000) return `${(abs / 1000).toFixed(2)} km`;
  return `${Math.round(abs)} m`;
}

/**
 * Formatea valor con su unidad. Si es null/undefined, muestra "—".
 *
 *  fmtValor(29.04, '°C') → "29.04 °C"
 *  fmtValor(null,  '°C') → "—"
 */
export function fmtValor(
  valor: number | null | undefined,
  unidad: string,
  decimales = 2,
): string {
  if (valor == null) return '—';
  return `${Number(valor).toFixed(decimales)} ${unidad}`;
}