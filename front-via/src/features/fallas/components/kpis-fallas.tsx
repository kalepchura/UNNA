import { AlertOctagon, Activity, ClipboardX } from 'lucide-react';

import { StatCard, type StatTone } from '@/components/shared/stat-card';
import { KpisFallasResponse } from '../types/kpis-fallas.types';

interface Props {
  data: KpisFallasResponse | null;
  isLoading: boolean;
}

/**
 * KPIs del módulo de Fallas — usa <StatCard/> canónico.
 */
export function KpisFallas({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="" value="" loading />
        <StatCard label="" value="" loading />
        <StatCard label="" value="" loading />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* KPI 1 — Fallas del mes */}
      <StatCard
        label={`Fallas en ${data.totalMesActual.periodo}`}
        value={data.totalMesActual.total}
        unit="fallas"
        icon={AlertOctagon}
        tone={mapColorToTone(data.totalMesActual.color)}
      />

      {/* KPI 2 — Tramo top */}
      <StatCard
        label="Tramo con más fallas"
        value={
          data.tramoTop.tramoCodigo ? (
            <span className="font-mono text-[20px]">
              {data.tramoTop.tramoCodigo}
            </span>
          ) : (
            'Sin datos'
          )
        }
        helper={
          data.tramoTop.tramoCodigo
            ? `${data.tramoTop.cantidadFallas} fallas · ${data.tramoTop.rango}`
            : undefined
        }
        icon={Activity}
        tone="warning"
      />

      {/* KPI 3 — Soldaduras sin acción */}
      <StatCard
        label="Soldaduras sin acción"
        value={data.soldadurasSinAccion.cantidad}
        unit="elem."
        helper={
          data.soldadurasSinAccion.critico
            ? 'Requiere atención inmediata'
            : undefined
        }
        icon={ClipboardX}
        tone={data.soldadurasSinAccion.critico ? 'destructive' : 'neutral'}
      />
    </div>
  );
}

function mapColorToTone(color: string): StatTone {
  switch (color) {
    case 'VERDE':    return 'success';
    case 'AMARILLO': return 'warning';
    case 'ROJO':     return 'destructive';
    case 'GRIS':     return 'neutral';
    default:         return 'neutral';
  }
}
