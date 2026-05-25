'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Sheet — drawer/panel lateral que se desliza desde el borde.
 *
 * Variante moderna del Dialog para formularios y vistas de detalle largas.
 * Usa Radix Dialog primitive (la misma base que `dialog.tsx`), pero con
 * animación de slide y ancho fijo según `side`.
 *
 * Uso:
 *   <Sheet open={open} onOpenChange={setOpen}>
 *     <SheetContent side="right" size="lg">
 *       <SheetHeader>
 *         <SheetTitle>Nueva falla</SheetTitle>
 *         <SheetDescription>Complete los datos para registrar.</SheetDescription>
 *       </SheetHeader>
 *       <SheetBody>{contenido}</SheetBody>
 *       <SheetFooter>...</SheetFooter>
 *     </SheetContent>
 *   </Sheet>
 */

// ── Root primitives ──────────────────────────────────────────────────────────

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

// ── Overlay ──────────────────────────────────────────────────────────────────

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-foreground/15 backdrop-blur-[1px]',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'duration-150',
        className,
      )}
      {...props}
    />
  );
}

// ── Content ──────────────────────────────────────────────────────────────────

type SheetSide = 'right' | 'left' | 'top' | 'bottom';
type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

interface SheetContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  side?: SheetSide;
  size?: SheetSize;
  showCloseButton?: boolean;
}

function SheetContent({
  className,
  children,
  side = 'right',
  size = 'md',
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  const sideBase: Record<SheetSide, string> = {
    right:
      'inset-y-0 right-0 h-full border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
    left:
      'inset-y-0 left-0 h-full border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
    top:
      'inset-x-0 top-0 w-full border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
    bottom:
      'inset-x-0 bottom-0 w-full border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
  };

  const horizontalSize: Record<SheetSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-full',
  };
  const verticalSize: Record<SheetSize, string> = {
    sm: 'max-h-[40vh]',
    md: 'max-h-[60vh]',
    lg: 'max-h-[80vh]',
    xl: 'max-h-[90vh]',
    '2xl': 'max-h-[95vh]',
    full: 'max-h-full',
  };

  const isHorizontal = side === 'left' || side === 'right';
  const sizeClass = isHorizontal
    ? `w-full ${horizontalSize[size]}`
    : `h-full ${verticalSize[size]}`;

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 flex flex-col bg-card text-foreground shadow-lg outline-none',
          'duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          sideBase[side],
          sizeClass,
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-3 top-3 z-10"
              aria-label="Cerrar"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

// ── Header / Body / Footer ───────────────────────────────────────────────────

function SheetHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        'flex flex-col gap-1 border-b border-border bg-card px-6 py-5 pr-12',
        className,
      )}
      {...props}
    />
  );
}

function SheetBody({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        'flex-1 overflow-y-auto bg-background px-6 py-5',
        className,
      )}
      {...props}
    />
  );
}

function SheetFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        'flex items-center justify-end gap-2 border-t border-border bg-card px-6 py-4',
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        'text-lg font-semibold tracking-tight text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
