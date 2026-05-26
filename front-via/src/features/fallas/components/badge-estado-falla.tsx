/**
 * Badge visual para el estado de una falla (o de una acción).
 *
 * Cada estado tiene su color semántico para que el ingeniero
 * identifique de un vistazo en qué situación está cada falla:
 *  - NO_ATENDIDO   → rojo (atención requerida)
 *  - PROGRAMADO    → amarillo (en agenda)
 *  - EN_EJECUCION  → azul (en proceso)
 *  - RESUELTO      → verde (cerrado)
 *  - CANCELADO     → gris (descartado)
 *  - FALTA_VERIFICAR → naranja (pendiente verificación)
 *
 * Componente reutilizable: usado en detalle de falla, listado,
 * timeline de acciones, y cualquier vista que muestre el estado.
 */

import { cn } from '@/lib/utils';
import { EstadoFalla, LABEL_ESTADO_FALLA } from '@/lib/types/enums/fallas.enum';

interface BadgeEstadoFallaProps {
  estado: EstadoFalla;
  /** Tamaño del badge. Default: 'md'. */
  size?: 'sm' | 'md';
  className?: string;
}

const ESTILOS: Record<EstadoFalla, string> = {
  [EstadoFalla.NO_ATENDIDO]:
    'bg-red-100 text-red-800 border-red-200',
  [EstadoFalla.PROGRAMADO]:
    'bg-amber-100 text-amber-800 border-amber-200',
  [EstadoFalla.EN_EJECUCION]:
    'bg-blue-100 text-blue-800 border-blue-200',
  [EstadoFalla.RESUELTO]:
    'bg-green-100 text-green-800 border-green-200',
  [EstadoFalla.CANCELADO]:
    'bg-gray-100 text-gray-700 border-gray-200',
  [EstadoFalla.FALTA_VERIFICAR]:
    'bg-orange-100 text-orange-800 border-orange-200',
};

export function BadgeEstadoFalla({
  estado,
  size = 'md',
  className,
}: BadgeEstadoFallaProps) {
  const tamano = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium whitespace-nowrap',
        ESTILOS[estado],
        tamano,
        className,
      )}
    >
      {LABEL_ESTADO_FALLA[estado]}
    </span>
  );
}