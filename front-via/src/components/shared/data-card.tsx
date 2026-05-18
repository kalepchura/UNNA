// frontend/src/components/shared/data-card.tsx

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Contenedor canónico para listados/tablas.
 *
 * Unifica visualmente: Toolbar + Tabla + Paginación en una sola tarjeta con
 * borde y sombra suaves. Reemplaza envolturas tipo `rounded-3xl` con espacios
 * inconsistentes.
 *
 * Uso:
 *   <DataCard>
 *     <DataToolbar>...</DataToolbar>
 *     <DataTable ... />          // sin su propio borde, se hereda del card
 *     <DataPagination ... />
 *   </DataCard>
 */
export function DataCard({ children, className }: DataCardProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        className,
      )}
    >
      {children}
    </section>
  );
}

interface DataToolbarProps {
  /** Bloque izquierdo — típicamente inputs de búsqueda. */
  children: ReactNode;
  /** Acciones a la derecha (Filtros, Columnas, Exportar...). */
  rightSlot?: ReactNode;
  className?: string;
}

/**
 * Barra de herramientas que se coloca al inicio de <DataCard/>.
 *
 * Las búsquedas (Input con icono) y los filtros van como children;
 * las acciones secundarias (Columnas, Exportar) van en rightSlot.
 */
export function DataToolbar({ children, rightSlot, className }: DataToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        'border-b border-border/60 bg-muted/20 px-4 py-3',
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {rightSlot && (
        <div className="flex items-center gap-1.5">{rightSlot}</div>
      )}
    </div>
  );
}

interface DataPaginationProps {
  children: ReactNode;
  className?: string;
}

/**
 * Pie del card para info + controles de paginación.
 * No fuerza estructura interna; pásale dos divs (info izq, controles dcha).
 */
export function DataPagination({ children, className }: DataPaginationProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        'border-t border-border/60 bg-muted/20 px-4 py-3 text-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
