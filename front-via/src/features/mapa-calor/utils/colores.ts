/**
 * Mapeo centralizado de colores del semáforo para el Mapa de Calor.
 */

export type ColorSemaforo = 'VERDE' | 'AMARILLO' | 'ROJO' | 'GRIS';

export const SEMAFORO: Record<
  ColorSemaforo,
  { bg: string; text: string; bgSoft: string; label: string; glow: string }
> = {
  VERDE: {
    bg: '#16a34a',
    text: '#15803d',
    bgSoft: 'rgba(22, 163, 74, 0.12)',
    label: 'Normal',
    glow: 'rgba(22, 163, 74, 0.35)',
  },
  AMARILLO: {
    bg: '#eab308',
    text: '#a16207',
    bgSoft: 'rgba(234, 179, 8, 0.12)',
    label: 'Atención',
    glow: 'rgba(234, 179, 8, 0.35)',
  },
  ROJO: {
    bg: '#e11d48',
    text: '#be123c',
    bgSoft: 'rgba(225, 29, 72, 0.12)',
    label: 'Crítico',
    glow: 'rgba(225, 29, 72, 0.35)',
  },
  GRIS: {
    bg: '#94a3b8',
    text: '#475569',
    bgSoft: 'rgba(148, 163, 184, 0.15)',
    label: 'Sin datos',
    glow: 'rgba(148, 163, 184, 0.25)',
  },
};

export function colorSemaforo(color: string | null | undefined) {
  if (!color) return SEMAFORO.GRIS;
  return SEMAFORO[color as ColorSemaforo] ?? SEMAFORO.GRIS;
}

// ─── Colores por vía (fallas, temperatura) ───────────────────────────────────

export const COLOR_VIA: Record<string, string> = {
  PAR:     '#2563eb',
  IMPAR:   '#d97706',
  TERCERA: '#0891b2',
  CERO:    '#101113',
};

export function colorVia(via: string | null | undefined): string {
  if (!via) return '#475569';
  return COLOR_VIA[via] ?? '#475569';
}

// ─── Colores fijos por vía + carril (desgaste general e índice) ──────────────

/**
 * Los 4 carriles de desgaste tienen colores fijos independientes
 * del valor semáforo. Sirven para la línea guía y la leyenda.
 *
 * PAR-IZQUIERDA  → azul oscuro
 * PAR-DERECHA    → azul claro
 * IMPAR-IZQUIERDA → verde oscuro
 * IMPAR-DERECHA  → verde claro
 */
export const COLOR_VIA_RIEL: Record<string, Record<string, string>> = {
  PAR: {
    IZQUIERDA: '#3022f4',
    DERECHA:   '#341143',
  },
  IMPAR: {
    IZQUIERDA: '#ba7021',
    DERECHA:   '#294232',
  },
};

export function colorViaRiel(
  via: string | null | undefined,
  riel: string | null | undefined,
): string {
  if (!via || !riel) return '#94a3b8';
  return COLOR_VIA_RIEL[via]?.[riel] ?? '#94a3b8';
}

/** Items para la leyenda de vías en el mapa de desgaste. */
export const LEYENDA_VIAS_DESGASTE = [
  { via: 'PAR',   riel: 'IZQUIERDA', label: 'PAR · Izquierda',  color: COLOR_VIA_RIEL.PAR.IZQUIERDA },
  { via: 'PAR',   riel: 'DERECHA',   label: 'PAR · Derecha',    color: COLOR_VIA_RIEL.PAR.DERECHA },
  { via: 'IMPAR', riel: 'IZQUIERDA', label: 'IMPAR · Izquierda',color: COLOR_VIA_RIEL.IMPAR.IZQUIERDA },
  { via: 'IMPAR', riel: 'DERECHA',   label: 'IMPAR · Derecha',  color: COLOR_VIA_RIEL.IMPAR.DERECHA },
] as const;