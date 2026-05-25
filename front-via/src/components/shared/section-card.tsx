// frontend/src/components/shared/section-card.tsx

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  /** Título de la sección (h3). Si se omite, no se renderiza el header. */
  title?: ReactNode;
  /** Subtítulo o descripción debajo del título. */
  description?: ReactNode;
  /** Acciones a la derecha del header (botones, filtros locales). */
  actions?: ReactNode;
  /** Indicador a la izquierda del título (icono pequeño, color, etc.). */
  leading?: ReactNode;
  /** Eyebrow opcional (label pequeño sobre el título). */
  eyebrow?: ReactNode;
  /** Contenido principal. */
  children: ReactNode;
  /** Pie del card (paginación, totales, acciones secundarias). */
  footer?: ReactNode;
  /** Padding interno del cuerpo. Default: 'md'. */
  bodyPadding?: 'none' | 'sm' | 'md' | 'lg';
  /** Variante visual. */
  variant?: 'default' | 'flush';
  className?: string;
  bodyClassName?: string;
}

/**
 * Tarjeta CANÓNICA para envolver cualquier sección de contenido del sistema.
 * Reemplaza usos sueltos de `<Card>` cuando se necesita un header con título +
 * acciones consistente entre módulos.
 *
 * Ejemplos:
 *
 *   // Lista simple
 *   <SectionCard title="Tramos" description="Total: 14">
 *     <ul>...</ul>
 *   </SectionCard>
 *
 *   // Con acciones y footer
 *   <SectionCard
 *     eyebrow="Operaciones"
 *     title="Evolución de desgaste"
 *     description="Últimos 12 meses"
 *     actions={<Button size="sm">Exportar</Button>}
 *     footer={<div className="text-sm text-muted-foreground">Actualizado hoy</div>}
 *   >
 *     <Chart ... />
 *   </SectionCard>
 *
 *   // Variante flush (sin padding) — para tablas que ya manejan su propio padding
 *   <SectionCard title="Listado" variant="flush" bodyPadding="none">
 *     <DataTable bare ... />
 *   </SectionCard>
 */
export function SectionCard({
  title,
  description,
  actions,
  leading,
  eyebrow,
  children,
  footer,
  bodyPadding = 'md',
  variant = 'default',
  className,
  bodyClassName,
}: SectionCardProps) {
  const hasHeader = !!(title || description || actions || eyebrow);

  const paddingClass = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }[bodyPadding];

  return (
    <section
      className={cn(
        'surface overflow-hidden',
        variant === 'flush' && 'shadow-sm',
        className,
      )}
    >
      {hasHeader && (
        <header
          className={cn(
            'flex flex-wrap items-start justify-between gap-3',
            'border-b border-border bg-card px-5 py-4',
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            {leading && (
              <div className="flex-shrink-0 pt-0.5">{leading}</div>
            )}
            <div className="min-w-0">
              {eyebrow && (
                <div className="eyebrow mb-1">{eyebrow}</div>
              )}
              {title && (
                <h3 className="text-[15px] font-semibold leading-tight tracking-tight text-foreground">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex flex-shrink-0 items-center gap-2">
              {actions}
            </div>
          )}
        </header>
      )}

      <div className={cn(paddingClass, bodyClassName)}>{children}</div>

      {footer && (
        <footer className="border-t border-border bg-muted/30 px-5 py-3">
          {footer}
        </footer>
      )}
    </section>
  );
}
