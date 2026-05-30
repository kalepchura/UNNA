// frontend/src/components/shared/config-sheet.tsx

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
  title: string;
  description?: string;
  triggerLabel?: string;
  triggerVariant?: 'bar' | 'button' | 'icon';
  summary?: ReactNode;
  size?: SheetSize;
  children: (close: () => void) => ReactNode;
  activeCount?: number;
  className?: string;
  /** Control externo del estado open. Si no se pasa, usa estado interno. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  open: openExterno,
  onOpenChange: onOpenChangeExterno,
}: ConfigSheetProps) {
  const [openInterno, setOpenInterno] = useState(false);

  // Si se pasan props externas, usar esas; si no, usar estado interno
  const esControlado = openExterno !== undefined;
  const open = esControlado ? openExterno : openInterno;

  const setOpen = (value: boolean) => {
    if (esControlado) {
      onOpenChangeExterno?.(value);
    } else {
      setOpenInterno(value);
    }
  };

  const close = () => setOpen(false);

  return (
    <>
      {/* TRIGGER — solo se renderiza si NO es controlado externamente */}
      {!esControlado && triggerVariant === 'bar' && (
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
              <div className="mt-1 text-xs text-muted-foreground">{summary}</div>
            ) : (
              description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              )
            )}
          </div>
          <span className="flex-shrink-0 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            Abrir →
          </span>
        </button>
      )}

      {!esControlado && triggerVariant === 'button' && (
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

      {!esControlado && triggerVariant === 'icon' && (
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

// ── ConfigSummaryChips ───────────────────────────────────────────────────────

export interface ConfigSummaryItem {
  label: string;
  value?: ReactNode;
}

interface ConfigSummaryChipsProps {
  items: ConfigSummaryItem[];
  maxVisible?: number;
}

export function ConfigSummaryChips({
  items,
  maxVisible = 4,
}: ConfigSummaryChipsProps) {
  const filled = items.filter(
    (i) => i.value !== undefined && i.value !== null && i.value !== '',
  );
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