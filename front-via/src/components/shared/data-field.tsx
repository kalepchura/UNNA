import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataFieldProps {
  /** Etiqueta del campo. */
  label: string;
  /** Valor a mostrar. Si es null/undefined → guion. */
  value: ReactNode;
  className?: string;
}

/**
 * Par "etiqueta + valor" para vistas de detalle.
 * La etiqueta va arriba, en gris pequeño.
 * El valor va abajo, en naegro normal.
 */
export function DataField({ label, value, className }: DataFieldProps) {
  return (
    <div className={cn('space-y-0.5', className)}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}a
      </p>
      <p className="text-sm font-medium">
        {value ?? <span className="text-muted-foreground">—</span>}
      </p>
    </div>
  );
}