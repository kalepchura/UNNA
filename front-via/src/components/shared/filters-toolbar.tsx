import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── FiltersToolbar ───────────────────────────────────────────────────────────

interface FiltersToolbarProps {
  children: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  onClear?: () => void;
  activeCount?: number;
  title?: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  variant?: 'default' | 'flush';
  className?: string;
}

export function FiltersToolbar({
  children,
  primaryAction,
  secondaryAction,
  onClear,
  activeCount,
  title = 'Filtros',
  description,
  collapsible = false,
  defaultCollapsed = false,
  variant = 'default',
  className,
}: FiltersToolbarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const hasActive = (activeCount ?? 0) > 0;

  return (
    <section
      className={cn(
        variant === 'default' &&
          'overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        className,
      )}
    >
      <header
        className={cn(
          'flex items-start justify-between gap-3',
          'border-b border-border bg-card px-5 py-3.5',
          collapsed && 'border-b-0',
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
              {hasActive && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-soft px-1.5 text-[11px] font-semibold tabular-nums text-brand-soft-foreground">
                  {activeCount}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          {hasActive && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Limpiar todo
            </button>
          )}
          {collapsible && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expandir filtros' : 'Colapsar filtros'}
            >
              {collapsed ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </header>

      {!collapsed && (
        <>
          <div className="px-5 py-4">{children}</div>
          {(primaryAction || secondaryAction) && (
            <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
              {secondaryAction}
              {primaryAction}
            </footer>
          )}
        </>
      )}
    </section>
  );
}

// ── FiltersGrid ──────────────────────────────────────────────────────────────

interface FiltersGridProps {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
}

export function FiltersGrid({ columns = 4, children, className }: FiltersGridProps) {
  const cols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };
  return (
    <div className={cn('grid gap-x-4 gap-y-4', cols[columns], className)}>
      {children}
    </div>
  );
}

// ── FilterField ──────────────────────────────────────────────────────────────

interface FilterFieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  helper?: ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  /**
   * Mensaje de error. Si se proporciona, muestra el texto en rojo
   * bajo el control (reemplaza al helper cuando hay error).
   */
  error?: string;
}

export function FilterField({
  label,
  htmlFor,
  children,
  helper,
  span,
  className,
  error,
}: FilterFieldProps) {
  const spanClass: Record<number, string> = {
    1: '',
    2: 'sm:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    5: 'lg:col-span-5',
    6: 'lg:col-span-6',
  };
  return (
    <div className={cn('space-y-1.5', span && spanClass[span], className)}>
      <label
        htmlFor={htmlFor}
        className={cn(
          'block text-[11.5px] font-semibold uppercase tracking-[0.04em]',
          // Label en rojo cuando hay error
          error ? 'text-red-500' : 'text-muted-foreground',
        )}
      >
        {label}
      </label>
      {children}
      {/* Error tiene prioridad sobre helper */}
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}

// ── DateInput ────────────────────────────────────────────────────────────────

interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export function DateInput({ className, ...props }: DateInputProps) {
  return (
    <input
      type="date"
      className={cn(
        'h-9 w-full rounded-md border border-input bg-background px-3 text-sm',
        'tabular-nums text-foreground outline-none transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[color-scheme:light]',
        className,
      )}
      {...props}
    />
  );
}