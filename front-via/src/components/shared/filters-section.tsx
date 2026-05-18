import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FiltersSectionProps {
  /** Contenido de los filtros (inputs, combos, etc.). */
  children: ReactNode;
  /** Cantidad de filtros activos. Se muestra como badge en el header. */
  cantidadActivos?: number;
  /** Acciones del lado derecho (ej: botón "Limpiar filtros"). */
  acciones?: ReactNode;
  /** Si arranca abierto. Default: false (colapsado). */
  defaultOpen?: boolean;
}

/**
 * Sección de filtros plegable.
 *
 * El header muestra "Filtros (N)" con badge de filtros activos.
 * Click en el header → expande/colapsa.
 *
 * Cuando NO hay filtros activos, el badge no aparece.
 */
export function FiltersSection({
  children,
  cantidadActivos = 0,
  acciones,
  defaultOpen = false,
}: FiltersSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Filtros</span>
          {cantidadActivos > 0 && (
            <Badge variant="default" className="h-5 text-xs px-1.5">
              {cantidadActivos}
            </Badge>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <CardContent
        className={cn(
          'pt-0 overflow-hidden transition-all',
          open ? 'pb-4 max-h-[1000px]' : 'max-h-0 py-0',
        )}
      >
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {children}
          </div>
          {acciones && (
            <div className="flex items-center justify-end gap-2 mt-4">
              {acciones}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}