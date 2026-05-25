// frontend/src/components/shared/stat-card.tsx

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type StatTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'info'
  | 'destructive';

interface DeltaInfo {
  value: string | number;
  label?: string;
  direction?: 'up' | 'down' | 'flat';
  /** Indica si la dirección es positiva ('up' bueno) o negativa ('down' bueno). Default 'up'='good'. */
  goodDirection?: 'up' | 'down';
}

interface StatCardProps {
  /** Etiqueta corta (eyebrow). */
  label: string;
  /** Valor principal (string o number; usa tabular-nums). */
  value: ReactNode;
  /** Unidad o sufijo (ej: 'mm', '%', 'fallas'). */
  unit?: string;
  /** Línea secundaria pequeña debajo del valor. */
  helper?: string;
  /** Icono opcional a la derecha. */
  icon?: LucideIcon;
  /** Tono semántico (afecta a icono y borde sutil). Default: 'neutral'. */
  tone?: StatTone;
  /** Información de variación (delta) — chip con flecha y % o número. */
  delta?: DeltaInfo;
  /** Skeleton loading. */
  loading?: boolean;
  /** Para listas tipo grid, permite hacer click. */
  onClick?: () => void;
  className?: string;
}

/**
 * Tarjeta de KPI moderna — reemplazo recomendado para KpiCard.
 *
 * Diseño:
 * - SIN borde lateral coloreado (tropo común a evitar).
 * - Icono con fondo suave del tono semántico.
 * - Valor grande con tabular-nums; etiqueta pequeña en uppercase.
 * - Delta opcional con flecha de tendencia.
 *
 * Ejemplo:
 *   <StatCard
 *     label="Mediciones del mes"
 *     value={142}
 *     unit="filas"
 *     icon={Activity}
 *     tone="brand"
 *     delta={{ value: '+12%', direction: 'up' }}
 *   />
 */
export function StatCard({
  label,
  value,
  unit,
  helper,
  icon: Icon,
  tone = 'neutral',
  delta,
  loading,
  onClick,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn('surface p-5', className)}>
        <div className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  const iconBg: Record<StatTone, string> = {
    neutral: 'bg-muted text-muted-foreground',
    brand: 'bg-brand-soft text-brand-soft-foreground',
    success: 'bg-success-soft text-success-soft-foreground',
    warning: 'bg-warning-soft text-warning-soft-foreground',
    info: 'bg-info-soft text-info-soft-foreground',
    destructive: 'bg-destructive-soft text-destructive-soft-foreground',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'surface group relative p-5 transition-all',
        onClick && 'cursor-pointer hover:border-border-strong hover:shadow',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="eyebrow truncate">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-semibold tracking-tight text-foreground tabular-nums">
              {value ?? <span className="text-muted-foreground">—</span>}
            </span>
            {unit && (
              <span className="text-sm font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          {helper && (
            <p className="truncate text-xs text-muted-foreground">{helper}</p>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
              iconBg[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {delta && <DeltaChip delta={delta} />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Delta chip
// ──────────────────────────────────────────────────────────────────────────────

function DeltaChip({ delta }: { delta: DeltaInfo }) {
  const direction = delta.direction ?? 'flat';
  const goodDirection = delta.goodDirection ?? 'up';

  const isGood =
    direction === 'flat'
      ? null
      : (direction === 'up' && goodDirection === 'up') ||
        (direction === 'down' && goodDirection === 'down');

  const Icon =
    direction === 'up'
      ? ArrowUpRight
      : direction === 'down'
        ? ArrowDownRight
        : Minus;

  const tone =
    isGood === null
      ? 'text-muted-foreground bg-muted'
      : isGood
        ? 'text-success-soft-foreground bg-success-soft'
        : 'text-destructive-soft-foreground bg-destructive-soft';

  return (
    <div className="mt-3 flex items-center gap-2">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
          tone,
        )}
      >
        <Icon className="h-3 w-3" />
        <span className="tabular-nums">{delta.value}</span>
      </span>
      {delta.label && (
        <span className="text-xs text-muted-foreground">{delta.label}</span>
      )}
    </div>
  );
}
