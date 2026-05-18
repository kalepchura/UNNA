import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { NivelAlertaColor } from '@/lib/types/common';
import type { LucideIcon } from 'lucide-react';

/**
 * KpiCard genérico para todos los módulos.
 *
 * Props:
 *  - titulo: encabezado del KPI
 *  - valor: principal número/dato a destacar (puede ser string para texto)
 *  - color: opcional, asigna un borde de color semáforo (verde/amarillo/rojo/gris)
 *  - subtitulo: línea secundaria opcional (ej: "Sobre 5 fallas")
 *  - icono: opcional, lucide icon
 *  - loading: muestra skeleton mientras carga
 *
 * Diseño: card con borde lateral coloreado a la izquierda según `color`.
 * Si no hay color, queda neutral (sin acento).
 */
interface KpiCardProps {
  titulo: string;
  valor: string | number | null;
  color?: NivelAlertaColor;
  subtitulo?: string;
  icono?: LucideIcon;
  loading?: boolean;
}

export function KpiCard({
  titulo,
  valor,
  color,
  subtitulo,
  icono: Icon,
  loading,
}: KpiCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', borderClass(color))}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{titulo}</p>
            <p className="text-2xl font-bold">
              {valor ?? <span className="text-muted-foreground">—</span>}
            </p>
            {subtitulo && (
              <p className="text-xs text-muted-foreground truncate">{subtitulo}</p>
            )}
          </div>
          {Icon && (
            <div className={cn('rounded-md p-2 flex-shrink-0', iconBgClass(color))}>
              <Icon className={cn('h-5 w-5', iconColorClass(color))} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ----- Helpers de estilos -----

function borderClass(color?: NivelAlertaColor): string {
  switch (color) {
    case NivelAlertaColor.VERDE:    return 'border-l-4 border-l-alerta-verde';
    case NivelAlertaColor.AMARILLO: return 'border-l-4 border-l-alerta-amarillo';
    case NivelAlertaColor.ROJO:     return 'border-l-4 border-l-alerta-rojo';
    case NivelAlertaColor.GRIS:     return 'border-l-4 border-l-alerta-gris';
    default: return '';
  }
}

function iconBgClass(color?: NivelAlertaColor): string {
  switch (color) {
    case NivelAlertaColor.VERDE:    return 'bg-green-50';
    case NivelAlertaColor.AMARILLO: return 'bg-yellow-50';
    case NivelAlertaColor.ROJO:     return 'bg-red-50';
    case NivelAlertaColor.GRIS:     return 'bg-gray-50';
    default: return 'bg-secondary';
  }
}

function iconColorClass(color?: NivelAlertaColor): string {
  switch (color) {
    case NivelAlertaColor.VERDE:    return 'text-alerta-verde';
    case NivelAlertaColor.AMARILLO: return 'text-alerta-amarillo';
    case NivelAlertaColor.ROJO:     return 'text-alerta-rojo';
    case NivelAlertaColor.GRIS:     return 'text-alerta-gris';
    default: return 'text-muted-foreground';
  }
}