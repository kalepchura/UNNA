/**
 * Mapeo centralizado de colores del semáforo para el Mapa de Calor.
 */

export type ColorSemaforo =
  | 'VERDE'
  | 'AMARILLO'
  | 'ROJO'
  | 'GRIS';

export const SEMAFORO: Record<
  ColorSemaforo,
  {
    bg: string;
    text: string;
    bgSoft: string;
    label: string;
    glow: string;
  }
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

/**
 * Devuelve configuración segura del semáforo.
 */
export function colorSemaforo(
  color: string | null | undefined
) {
  if (!color) return SEMAFORO.GRIS;

  return (
    SEMAFORO[color as ColorSemaforo] ??
    SEMAFORO.GRIS
  );
}

/**
 * Color base por vía.
 */
export const COLOR_VIA: Record<string, string> = {
  PAR: '#1d4ed8',
  IMPAR: '#0369a1',
  TERCERA: '#4f46e5',
  CERO: '#475569',
};

export function colorVia(
  via: string | null | undefined
): string {
  if (!via) return '#475569';

  return COLOR_VIA[via] ?? '#475569';
}