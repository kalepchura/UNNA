/**
 * Sección colapsable de "Filtros avanzados" para los 3 gráficos.
 *
 * Centraliza el patrón de mostrar/ocultar filtros menos usados
 * (los enums de Fase 2.D: tipoDefecto, elementoAfectado, etc.).
 *
 * Por defecto está colapsada: el ingeniero solo ve los filtros
 * básicos (fechas, tramos, curvas). Si quiere filtrar por
 * caracterización del defecto, expande la sección.
 *
 * Muestra un badge con la cantidad de filtros avanzados activos
 * para que el usuario sepa que hay filtros aplicados aunque esté
 * colapsado.
 */

import { useState, type ReactNode } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FiltrosAvanzadosSeccionProps {
  /** Cantidad de filtros avanzados activos (para el badge). */
  cantidadActivos: number;
  /** Contenido de la sección (los selectores avanzados). */
  children: ReactNode;
  /** Si arranca expandida. Default: false. */
  defaultOpen?: boolean;
  /** Título personalizable. */
  titulo?: string;
}

export function FiltrosAvanzadosSeccion({
  cantidadActivos,
  children,
  defaultOpen = false,
  titulo = 'Filtros avanzados (riel)',
}: FiltrosAvanzadosSeccionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-3 border-t pt-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="w-full justify-between text-sm font-medium hover:bg-muted/50"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {titulo}
          {cantidadActivos > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {cantidadActivos}
            </Badge>
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </Button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}