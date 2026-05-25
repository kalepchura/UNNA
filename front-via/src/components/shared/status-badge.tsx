// frontend/src/components/shared/status-badge.tsx

import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusTone =
  | 'success'   // verde   — operativo, activo, normal
  | 'warning'   // ámbar   — mantenimiento, en revisión, atención
  | 'info'      // azul    — inspección, programado, neutral activo
  | 'destructive' // rojo  — crítico, fuera de servicio, error
  | 'brand'     // teal    — destacado, especial
  | 'neutral';  // gris    — inactivo, archivado, N/A

interface StatusBadgeProps {
  /** Tono semántico del estado. */
  tone: StatusTone;
  /** Etiqueta visible. */
  children: ReactNode;
  /** Muestra/oculta el punto antes del texto. Default: true. */
  withDot?: boolean;
  /** Estilo sólido (uso ESCASO, para énfasis fuerte). Default: soft. */
  variant?: 'soft' | 'solid';
  className?: string;
}

/**
 * Badge canónico para representar ESTADOS de entidades (operativo, mantenimiento,
 * inspección, crítico, etc.). Único componente para todos los listados.
 *
 * Reglas:
 * - "Operativo / Activo / OK" → tone="success"
 * - "Mantenimiento / Revisión / Pendiente" → tone="warning"
 * - "Inspección / Programado / Info" → tone="info"
 * - "Crítico / Fuera de servicio / Error" → tone="destructive"
 * - "Inactivo / Archivado / N/A" → tone="neutral"
 *
 * Ejemplo:
 *   <StatusBadge tone="success">Operativo</StatusBadge>
 *   <StatusBadge tone="warning">En mantenimiento</StatusBadge>
 */
export function StatusBadge({
  tone,
  children,
  withDot = true,
  variant = 'soft',
  className,
}: StatusBadgeProps) {
  const dotColor: Record<StatusTone, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    info: 'bg-info',
    destructive: 'bg-destructive',
    brand: 'bg-brand',
    neutral: 'bg-muted-foreground',
  };

  const badgeVariant =
    tone === 'neutral'
      ? 'secondary'
      : variant === 'solid'
        ? (`solid-${tone === 'destructive' ? 'destructive' : tone}` as const)
        : tone === 'destructive'
          ? 'destructive'
          : (tone as 'success' | 'warning' | 'info' | 'brand');

  return (
    <Badge
      variant={badgeVariant as any}
      className={cn('gap-1.5 px-2 py-0.5', className)}
    >
      {withDot && (
        <span
          aria-hidden="true"
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'solid' && tone !== 'neutral'
              ? 'bg-current opacity-90'
              : dotColor[tone],
          )}
        />
      )}
      <span>{children}</span>
    </Badge>
  );
}
