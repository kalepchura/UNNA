import type { LucideIcon } from 'lucide-react';
import { StatCard, type StatTone } from '@/components/shared/stat-card';
import { NivelAlertaColor } from '@/lib/types/common';

/**
 * KpiCard — wrapper retro-compatible sobre <StatCard/>.
 *
 * Mantiene la API original (titulo/valor/color/subtitulo/icono/loading) pero
 * delega el render a StatCard, que aplica el nuevo lenguaje visual:
 * - Sin borde lateral coloreado.
 * - Icono en chip de fondo suave del tono semántico.
 * - Valor grande con tabular-nums.
 *
 * Para nuevos KPI, prefiere usar <StatCard/> directamente — ofrece más
 * features (delta, helper, onClick) y un tono más granular.
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
  icono,
  loading,
}: KpiCardProps) {
  return (
    <StatCard
      label={titulo}
      value={valor ?? '—'}
      helper={subtitulo}
      icon={icono}
      tone={mapColorToTone(color)}
      loading={loading}
    />
  );
}

function mapColorToTone(color?: NivelAlertaColor): StatTone {
  switch (color) {
    case NivelAlertaColor.VERDE:    return 'success';
    case NivelAlertaColor.AMARILLO: return 'warning';
    case NivelAlertaColor.ROJO:     return 'destructive';
    case NivelAlertaColor.GRIS:     return 'neutral';
    default:                        return 'neutral';
  }
}
