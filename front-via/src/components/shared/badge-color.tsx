import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { NivelAlertaColor } from '@/lib/types/common';

interface BadgeColorProps {
  color: NivelAlertaColor;
  /** Texto a mostrar en el badge. Si no se pasa, muestra el color. */
  texto?: string;
  className?: string;
}

/**
 * Badge con colores semáforo del dominio.
 * Usa los colores `alerta-*` definidos en tailwind.config.js.
 */
export function BadgeColor({ color, texto, className }: BadgeColorProps) {
  const label = texto ?? capitalizar(color);
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', colorClass(color), className)}
    >
      <span
        className={cn('mr-1.5 inline-block h-2 w-2 rounded-full', dotClass(color))}
      />
      {label}
    </Badge>
  );
}

function colorClass(color: NivelAlertaColor): string {
  switch (color) {
    case NivelAlertaColor.VERDE:    return 'border-alerta-verde text-alerta-verde bg-green-50';
    case NivelAlertaColor.AMARILLO: return 'border-alerta-amarillo text-alerta-amarillo bg-yellow-50';
    case NivelAlertaColor.ROJO:     return 'border-alerta-rojo text-alerta-rojo bg-red-50';
    case NivelAlertaColor.GRIS:     return 'border-alerta-gris text-alerta-gris bg-gray-50';
  }
}

function dotClass(color: NivelAlertaColor): string {
  switch (color) {
    case NivelAlertaColor.VERDE:    return 'bg-alerta-verde';
    case NivelAlertaColor.AMARILLO: return 'bg-alerta-amarillo';
    case NivelAlertaColor.ROJO:     return 'bg-alerta-rojo';
    case NivelAlertaColor.GRIS:     return 'bg-alerta-gris';
  }
}

function capitalizar(texto: string): string {
  return texto.charAt(0) + texto.slice(1).toLowerCase();
}