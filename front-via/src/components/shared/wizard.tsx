
import type { LucideIcon } from 'lucide-react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── WizardStep — hero envoltorio para el campo del paso ──────────────────────

interface WizardStepProps {
  stepNumber: number;
  totalSteps: number;
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function WizardStep({
  stepNumber,
  totalSteps,
  icon: Icon,
  title,
  description,
  children,
  className,
}: WizardStepProps) {
  return (
    <div
      key={stepNumber}
      className={cn('mx-auto max-w-lg anim-fade-in', className)}
    >
      {/* Hero */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div
          className="
            flex h-14 w-14 items-center justify-center rounded-2xl
            bg-brand-soft text-brand-soft-foreground
            shadow-sm ring-1 ring-brand/15
          "
        >
          <Icon className="h-6 w-6" />
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand">
          Paso {stepNumber} de {totalSteps}
        </p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 max-w-prose text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Field */}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ── WizardSummary — resumen acumulativo de selecciones ───────────────────────

export type SummaryItemTone = 'completed' | 'current' | 'pending';

export interface WizardSummaryItem {
  /** Etiqueta corta del paso (ej: 'Agrupación'). */
  label: string;
  /** Valor seleccionado para el paso. Undefined si aún no se eligió. */
  value?: React.ReactNode;
  /** Estado visual. */
  tone: SummaryItemTone;
}

interface WizardSummaryProps {
  items: WizardSummaryItem[];
  className?: string;
}

export function WizardSummary({ items, className }: WizardSummaryProps) {
  return (
    <div
      className={cn(
        'mt-8 rounded-lg border border-border bg-muted/30 px-4 py-3',
        className,
      )}
    >
      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Resumen de la configuración
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <SummaryChip key={i} item={it} />
        ))}
      </ul>
    </div>
  );
}

function SummaryChip({ item }: { item: WizardSummaryItem }) {
  const toneStyles: Record<SummaryItemTone, string> = {
    completed: 'bg-success-soft text-success-soft-foreground border-success/20',
    current: 'bg-brand-soft text-brand-soft-foreground border-brand/20 ring-2 ring-brand/15',
    pending: 'bg-card text-muted-foreground border-border',
  };

  const valueDisplay = item.value ?? (
    <span className="italic text-muted-foreground/70">Sin definir</span>
  );

  return (
    <li
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-xs leading-tight',
        toneStyles[item.tone],
      )}
    >
      {item.tone === 'completed' && (
        <Check className="h-3 w-3" strokeWidth={3} />
      )}
      {item.tone === 'current' && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 animate-pulse-subtle rounded-full bg-brand opacity-75" />
          <span className="relative h-2 w-2 rounded-full bg-brand" />
        </span>
      )}
      {item.tone === 'pending' && <Circle className="h-2.5 w-2.5" />}
      <span className="font-medium">{item.label}:</span>
      <span>{valueDisplay}</span>
    </li>
  );
}
