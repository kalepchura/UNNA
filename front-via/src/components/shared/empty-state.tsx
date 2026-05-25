// components/shared/empty-state.tsx

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Título principal. */
  titulo?: string;
  /** Mensaje secundario. */
  subtitulo?: string;
  /** Icono personalizado (lucide). Default: Inbox. */
  icon?: LucideIcon;
  /** Acción primaria (botón "Crear nuevo", "Limpiar filtros"...). */
  action?: ReactNode;
  /** Tamaño del estado: 'sm' (compacto para celdas) | 'md' (default) | 'lg'. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Estado vacío canónico — para tablas, listas, dashboards.
 *
 * Variantes:
 * - 'sm' → para celdas de tabla, listados sutiles (py-8)
 * - 'md' → default (py-12)
 * - 'lg' → para páginas enteras vacías (py-20)
 */
export function EmptyState({
  titulo = 'No hay datos',
  subtitulo = 'No se encontraron registros para mostrar',
  icon: Icon = Inbox,
  action,
  size = 'md',
  className,
}: EmptyStateProps) {
  const sizing = {
    sm: {
      padding: 'py-8 px-6',
      iconBox: 'h-10 w-10',
      icon: 'h-5 w-5',
      title: 'text-sm',
      sub: 'text-xs',
    },
    md: {
      padding: 'py-12 px-6',
      iconBox: 'h-14 w-14',
      icon: 'h-7 w-7',
      title: 'text-sm',
      sub: 'text-sm',
    },
    lg: {
      padding: 'py-20 px-6',
      iconBox: 'h-16 w-16',
      icon: 'h-8 w-8',
      title: 'text-base',
      sub: 'text-sm',
    },
  }[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizing.padding,
        className,
      )}
    >
      <div
        className={cn(
          'mb-4 flex items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground',
          sizing.iconBox,
        )}
      >
        <Icon className={sizing.icon} />
      </div>

      <h3 className={cn('font-semibold text-foreground', sizing.title)}>
        {titulo}
      </h3>

      {subtitulo && (
        <p className={cn('mt-1 max-w-[36ch] text-muted-foreground', sizing.sub)}>
          {subtitulo}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
