// components/shared/error-state.tsx

import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  /** Título del error. */
  titulo?: string;
  /** Descripción. Puede ser un error de la API. */
  descripcion?: string;
  /** Acción de reintentar. */
  onRetry?: () => void;
  /** Etiqueta del botón retry. */
  retryLabel?: string;
  /** Acción secundaria custom. */
  action?: ReactNode;
  /** Tamaño visual. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Estado de error canónico — para tablas, gráficos, formularios cuando
 * algo falla. Reemplaza usos sueltos de "Error al cargar" sin tratamiento.
 */
export function ErrorState({
  titulo = 'No se pudo cargar la información',
  descripcion = 'Hubo un problema al obtener los datos. Por favor intentá nuevamente.',
  onRetry,
  retryLabel = 'Reintentar',
  action,
  size = 'md',
  className,
}: ErrorStateProps) {
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
          'mb-4 flex items-center justify-center rounded-full',
          'bg-destructive-soft text-destructive-soft-foreground',
          sizing.iconBox,
        )}
      >
        <AlertCircle className={sizing.icon} />
      </div>

      <h3 className={cn('font-semibold text-foreground', sizing.title)}>
        {titulo}
      </h3>

      {descripcion && (
        <p className={cn('mt-1 max-w-[44ch] text-muted-foreground', sizing.sub)}>
          {descripcion}
        </p>
      )}

      {(onRetry || action) && (
        <div className="mt-5 flex items-center gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              {retryLabel}
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
