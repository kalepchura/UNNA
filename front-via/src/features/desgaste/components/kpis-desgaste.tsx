import { AlertOctagon, Activity, ClipboardX } from 'lucide-react';

import { StatCard, type StatTone } from '@/components/shared/stat-card';
import { KpisDesgasteResponse } from '../types/kpis-desgaste.types';

interface Props {
  data: KpisDesgasteResponse | null;
  isLoading: boolean;
}

/**
 * KPIs del módulo de Desgaste — usa <StatCard/> canónico.
 *
 * - Zona roja → tone destructive
 * - Mayor desgaste → tone según data.color (verde/amarillo/rojo)
 * - Sin medición → tone warning
 */
export function KpisDesgaste({ data, isLoading }: Props) {
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
      {/* KPI 1 — Elementos en zona roja */}
      <StatCard
        label="Elementos en zona roja"
        value={data.zonaRoja.cantidad}
        unit="elem."
        helper="Último trimestre"
        icon={AlertOctagon}
        tone={mapColorToTone(data.zonaRoja.color)}
      />

      {/* KPI 2 — Mayor desgaste actual */}
      <StatCard
        label="Mayor desgaste"
        value={
          data.mayorDesgaste.codigoElemento !== null
            ? data.mayorDesgaste.valorMm
            : '—'
        }
        unit={data.mayorDesgaste.codigoElemento !== null ? 'mm' : undefined}
        helper={
          data.mayorDesgaste.codigoElemento !== null
            ? `E${data.mayorDesgaste.codigoElemento} · ${data.mayorDesgaste.punto} · Tramo ${data.mayorDesgaste.tramoCodigo} · ${data.mayorDesgaste.trimestre}T${data.mayorDesgaste.anio}`
            : undefined
        }
        icon={Activity}
        tone={mapColorToTone(data.mayorDesgaste.color)}
      />

      {/* KPI 3 — Elementos sin medición */}
      <StatCard
        label={`Sin medición en ${data.sinMedicionUltimoAnio.anioReferencia || '…'}`}
        value={data.sinMedicionUltimoAnio.cantidad}
        unit="elem."
        helper={
          data.sinMedicionUltimoAnio.primerosElementos.length > 0
            ? data.sinMedicionUltimoAnio.primerosElementos
                .map((e) => `E${e.codigoElemento}`)
                .join(', ')
            : undefined
        }
        icon={ClipboardX}
        tone={mapColorToTone(data.sinMedicionUltimoAnio.color)}
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
