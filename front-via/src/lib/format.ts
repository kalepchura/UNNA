import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Helpers de formato consistentes para todo el frontend.
 */

/**
 * Formatea una fecha (string ISO o Date) como "DD/MM/YYYY".
 * Ej: "2026-05-04" → "04/05/2026"
 */
export function formatearFecha(valor: string | Date | null | undefined): string {
  if (!valor) return '—';
  try {
    const fecha = typeof valor === 'string' ? parseISO(valor) : valor;
    return format(fecha, 'dd/MM/yyyy', { locale: es });
  } catch {
    return '—';
  }
}

/**
 * Formatea fecha+hora como "DD/MM/YYYY HH:mm".
 */
export function formatearFechaHora(valor: string | Date | null | undefined): string {
  if (!valor) return '—';
  try {
    const fecha = typeof valor === 'string' ? parseISO(valor) : valor;
    return format(fecha, 'dd/MM/yyyy HH:mm', { locale: es });
  } catch {
    return '—';
  }
}

/**
 * Convierte un Date a string YYYY-MM-DD (formato de los DTOs).
 */
export function fechaAIso(fecha: Date): string {
  return format(fecha, 'yyyy-MM-dd');
}

/**
 * Formatea un número con separadores de miles.
 * Ej: 1234.56 → "1.234,56"
 */
export function formatearNumero(
  valor: number | null | undefined,
  decimales: number = 2,
): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—';
  return valor.toLocaleString('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/**
 * Formatea un entero (sin decimales, con separadores).
 */
export function formatearEntero(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—';
  return valor.toLocaleString('es-PE');
}

// ============================================================
// NUEVAS FUNCIONES AGREGADAS PARA LOS LISTADOS
// ============================================================

/**
 * Formatea una fecha ISO para mostrar en tablas (DD/MM/YYYY)
 * Usa la misma función existente formatearFecha
 */
export function formatearFechaTabla(iso: string): string {
  return formatearFecha(iso);
}

/**
 * Formatea velocidad (ej: 80 → "80 km/h")
 */
export function formatearVelocidad(velocidad: number | null | undefined): string {
  if (velocidad == null) return '—';
  return `${velocidad} km/h`;
}

/**
 * Formatea progresiva (ej: 1234 → "1,234 m")
 */
export function formatearProgresiva(progresiva: number | null | undefined): string {
  if (progresiva == null) return '—';
  return `${progresiva.toLocaleString('es-ES')} m`;
}