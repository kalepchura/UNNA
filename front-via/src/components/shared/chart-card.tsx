// frontend/src/components/shared/chart-card.tsx

import type { ReactNode } from 'react';
import { SectionCard } from './section-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  /** Título del gráfico. */
  title: ReactNode;
  /** Subtítulo / contexto. */
  description?: ReactNode;
  /** Acciones (filtros locales, botón exportar...). */
  actions?: ReactNode;
  /** Eyebrow opcional (categoría/módulo). */
  eyebrow?: ReactNode;
  /** Contenido del gráfico (componente Recharts, ApexCharts, etc.). */
  children: ReactNode;
  /** Pie con leyenda o totales. */
  footer?: ReactNode;
  /** Indica que está cargando. */
  loading?: boolean;
  /** Estado vacío. */
  empty?: ReactNode;
  /** Altura mínima del área del gráfico. Default: 280. */
  minHeight?: number | string;
  className?: string;
  bodyClassName?: string;
}

/**
 * Tarjeta CANÓNICA para gráficos / dashboards.
 *
 * Envuelve un gráfico con:
 * - Header con título, eyebrow, descripción y acciones (filtros locales, export).
 * - Cuerpo con padding consistente.
 * - Footer opcional para leyendas o totales.
 * - Estados de loading y vacío unificados.
 *
 * Ejemplo:
 *
 *   <ChartCard
 *     eyebrow="Desgaste"
 *     title="Evolución real"
 *     description="Últimos 12 meses por tramo"
 *     actions={<Button size="sm">Exportar</Button>}
 *     loading={isLoading}
 *     minHeight={320}
 *   >
 *     <ResponsiveContainer ...>...</ResponsiveContainer>
 *   </ChartCard>
 */
export function ChartCard({
  title,
  description,
  actions,
  eyebrow,
  children,
  footer,
  loading,
  empty,
  minHeight = 280,
  className,
  bodyClassName,
}: ChartCardProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      actions={actions}
      eyebrow={eyebrow}
      footer={footer}
      bodyPadding="none"
      className={className}
    >
      <div
        className={cn(
          'relative flex flex-col px-5 py-4',
          bodyClassName,
        )}
        style={{ minHeight }}
      >
        {loading ? (
          <ChartSkeleton height={minHeight} />
        ) : empty ? (
          <div className="flex flex-1 items-center justify-center py-6">
            {empty}
          </div>
        ) : (
          children
        )}
      </div>
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

function ChartSkeleton({ height }: { height: number | string }) {
  return (
    <div
      className="flex w-full flex-col gap-3"
      style={{ minHeight: height }}
    >
      <div className="flex items-end gap-3 px-2 pt-4">
        {[60, 80, 45, 90, 65, 75, 55, 85, 70, 95, 50, 80].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 pb-2">
        <Skeleton className="h-2 w-12" />
        <Skeleton className="h-2 w-12" />
        <Skeleton className="h-2 w-12" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Layout helpers
// ──────────────────────────────────────────────────────────────────────────────

interface ChartGridProps {
  /** Número de columnas en pantalla grande. Default: 2. */
  columns?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
}

/**
 * Grid responsive para múltiples ChartCard. 1 columna en móvil, N en desktop.
 */
export function ChartGrid({
  columns = 2,
  children,
  className,
}: ChartGridProps) {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  }[columns];
  return (
    <div className={cn('grid gap-4', cols, className)}>
      {children}
    </div>
  );
}
