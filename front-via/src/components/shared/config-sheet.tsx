// frontend/src/components/shared/config-sheet.tsx
//
// Wrapper para ABRIR los filtros/wizards de gráficos dentro de un Sheet lateral
// (en lugar de tenerlos inline ocupando media pantalla).
//
// Patrón canónico para CUALQUIER configuración de gráfico:
//
//   <ConfigSheet
//     title="Configurar gráfico"
//     description="Ajusta los parámetros del análisis."
//     summary={<ChipSummary items={[…]} />}   // opcional
//     size="2xl"
//   >
//     {(close) => (
//       <FiltrosGrafico1
//         config={…}
//         onChange={…}
//         onAplicar={() => { aplicar(); close(); }}
//       />
//     )}
//   </ConfigSheet>

import { useState, type ReactNode } from 'react';
import { Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

interface ConfigSheetProps {
  /** Título del Sheet. */
  title: string;
  /** Descripción opcional. */
  description?: string;
  /** Etiqueta del botón disparador. Default: 'Configurar'. */
  triggerLabel?: string;
  /** Variante del trigger. Default: 'bar' (chip horizontal). */
  triggerVariant?: 'bar' | 'button' | 'icon';
  /** Resumen visible junto al trigger (chips de filtros activos, etc.). */
  summary?: ReactNode;
  /** Ancho del Sheet. Default: 'xl'. */
  size?: SheetSize;
  /** Render-prop children. Recibe `close` para cerrar el sheet desde dentro. */
  children: (close: () => void) => ReactNode;
  /** Si hay filtros activos, muestra contador visible. */
  activeCount?: number;
  className?: string;
}

export function ConfigSheet({
  title,
  description,
  triggerLabel = 'Configurar gráfico',
  triggerVariant = 'bar',
  summary,
  size = 'xl',
  children,
  activeCount,
  className,
}: ConfigSheetProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* TRIGGER — variantes */}
      {triggerVariant === 'bar' && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'group flex w-full items-center gap-3 rounded-lg border border-border',
            'bg-card px-4 py-3 text-left shadow-sm transition-all',
            'hover:border-border-strong hover:bg-muted/40',
            'focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15',
            'outline-none',
            className,
          )}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-soft-foreground">
            <Settings2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {triggerLabel}
              </span>
              {typeof activeCount === 'number' && activeCount > 0 && (
                <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-soft px-1 text-[10.5px] font-semibold text-brand-soft-foreground">
                  {activeCount}
                </span>
              )}
            </div>
            {summary ? (
              <div className="mt-1 text-xs text-muted-foreground">
                {summary}
              </div>
            ) : (
              description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </p>
              )
            )}
          </div>
          <span className="flex-shrink-0 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            Abrir →
          </span>
        </button>
      )}

      {triggerVariant === 'button' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className={className}
        >
          <Settings2 className="mr-1.5 h-3.5 w-3.5" />
          {triggerLabel}
          {typeof activeCount === 'number' && activeCount > 0 && (
            <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-soft px-1 text-[10.5px] font-semibold text-brand-soft-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      )}

      {triggerVariant === 'icon' && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen(true)}
          aria-label={triggerLabel}
          className={className}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      )}

      {/* SHEET */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" size={size}>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <SheetBody>{children(close)}</SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ── ConfigSummaryChips — helper para mostrar resumen en el bar trigger ──────

export interface ConfigSummaryItem {
  label: string;
  value?: ReactNode;
}

interface ConfigSummaryChipsProps {
  items: ConfigSummaryItem[];
  maxVisible?: number;
}

/**
 * Muestra una lista compacta horizontal: "Granularidad: Mensual · Año: 2024 …"
 * Se inserta en el `summary` prop de ConfigSheet.
 */
export function ConfigSummaryChips({
  items,
  maxVisible = 4,
}: ConfigSummaryChipsProps) {
  const filled = items.filter((i) => i.value !== undefined && i.value !== null && i.value !== '');
  const visible = filled.slice(0, maxVisible);
  const extra = filled.length - visible.length;

  if (filled.length === 0) {
    return <span className="italic">Sin configuración aplicada</span>;
  }

  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      {visible.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/40">·</span>}
          <span className="text-muted-foreground/70">{item.label}:</span>
          <span className="font-medium text-foreground">{item.value}</span>
        </span>
      ))}
      {extra > 0 && (
        <span className="text-muted-foreground/70">+{extra} más</span>
      )}
    </span>
  );
}
