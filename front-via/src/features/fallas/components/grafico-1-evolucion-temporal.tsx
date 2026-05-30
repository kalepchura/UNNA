// frontend/src/features/fallas/components/grafico-1-evolucion-temporal.tsx

/**
 * G1 — Evolución temporal por elemento.
 *
 * Diseño tipo "Basic Line Chart" del demo de ApexCharts:
 *  - Líneas suaves de 3px.
 *  - Sin markers en cada punto (solo al hacer hover).
 *  - Fondo blanco limpio, sin franjas alternas.
 *  - Cada línea con un color diferente de la paleta.
 *
 * Toolbar custom:
 *  - Botones zoom +/-/reset arriba del gráfico, visibles siempre.
 *  - El menú ☰ de ApexCharts conserva las descargas (PNG/SVG/CSV).
 */

import { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { ZoomIn, ZoomOut, RotateCcw, MoveHorizontal } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import type { Grafico1Response, Grafico1Filtros } from '../types/grafico-1.types';
import { GranularidadTemporal, TipoFallaFiltro } from '@/lib/types/enums/fallas.enum';
import {
  LABEL_NIVEL,
  LABEL_VIA_FALLAS,
  TipoViaFiltroFallas,
} from '@/lib/types/enums/fallas-graficos.enum';

interface Props {
  data: Grafico1Response | null;
  config: Grafico1Filtros;
  isLoading: boolean;
  height?: number;
}

const LABEL_TIPO_FALLA: Record<string, string> = {
  RIEL: 'Solo Riel',
  SOLDADURA: 'Solo Soldadura',
  AMBAS: 'Riel + Soldadura',
};

// Paleta de colores fija — cada línea tendrá su color de esta lista.
const COLORES_LINEAS = [
  '#0284c7', '#e11d48', '#16a34a', '#d97706',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e',
  '#a855f7', '#06b6d4', '#f59e0b', '#10b981',
];

export function Grafico1EvolucionTemporal({
  data,
  config,
  isLoading,
  height = 380,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number } | null>(null);

  // ── Handlers de zoom (botones custom) ──────────────────────
  const handleZoomIn = () => {
    if (!chartInstanceRef.current || !data) return;
    const total = data.categorias.length;
    const range = zoomRange ?? { min: 0, max: total - 1 };
    const newSize = Math.max(1, Math.floor((range.max - range.min) * 0.7));
    const center = Math.floor((range.min + range.max) / 2);
    const newMin = Math.max(0, center - Math.floor(newSize / 2));
    const newMax = Math.min(total - 1, newMin + newSize);
    setZoomRange({ min: newMin, max: newMax });
    chartInstanceRef.current.zoomX(newMin, newMax);
  };

  const handleZoomOut = () => {
    if (!chartInstanceRef.current || !data) return;
    const total = data.categorias.length;
    const range = zoomRange ?? { min: 0, max: total - 1 };
    const newSize = Math.min(total - 1, Math.ceil((range.max - range.min) / 0.7));
    const center = Math.floor((range.min + range.max) / 2);
    const newMin = Math.max(0, center - Math.floor(newSize / 2));
    const newMax = Math.min(total - 1, newMin + newSize);
    if (newMin === 0 && newMax === total - 1) {
      handleReset();
      return;
    }
    setZoomRange({ min: newMin, max: newMax });
    chartInstanceRef.current.zoomX(newMin, newMax);
  };

  const handleReset = () => {
    if (!chartInstanceRef.current || !data) return;
    setZoomRange(null);
    chartInstanceRef.current.zoomX(0, data.categorias.length - 1);
  };

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    setZoomRange(null);

    const series =
      data?.series?.map((s) => ({
        name: s.nombre,
        data: s.datos,
      })) ?? [];

    const filename = `grafico-evolucion-${Date.now()}`;

    const options: ApexCharts.ApexOptions = {
      series,

      chart: {
        type: 'line',
        height,
        width: '100%',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
          export: {
            csv: { filename, columnDelimiter: ',', headerCategory: 'Periodo' },
            svg: { filename },
            png: { filename },
          },
        },
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: true,
        },
        animations: { enabled: true, speed: 400 },
      },

      colors: COLORES_LINEAS,

      // ── Estilo "Basic Line Chart" del demo ────────────────
      stroke: {
        curve: 'smooth',
        width: 3,
      },

      // Sin markers visibles permanentes. Solo aparecen al hacer hover.
      markers: {
        size: 0,
        strokeWidth: 0,
        hover: {
          size: 6,
          sizeOffset: 3,
        },
      },

      // Sin franjas alternas. Fondo limpio.
      grid: {
        show: true,
        borderColor: '#e2e8f0',
        strokeDashArray: 0,
        position: 'back',
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 20, bottom: 0, left: 10 },
      },

      title: {
        text: 'Evolución de Fallas',
        align: 'center',
        style: { fontSize: '15px', fontWeight: 700, color: '#0f172a' },
      },

      subtitle: {
        text: getSubtitle(config, data),
        align: 'center',
        style: { fontSize: '12px', color: '#64748b' },
      },

      xaxis: {
        categories: data?.categorias ?? [],
        title: {
          text: getEjeXTitulo(config),
          style: { fontWeight: 'bold', fontSize: '12px' },
        },
        labels: { style: { fontSize: '11.5px' } },
        axisBorder: { show: true, color: '#e2e8f0' },
        axisTicks: { show: false },
      },

      yaxis: {
        title: {
          text: 'Cantidad de Fallas',
          style: { fontWeight: 'bold', fontSize: '12px' },
        },
        min: 0,
        labels: {
          formatter: (v: number) => Math.round(v).toString(),
        },
        tickAmount: 5,
      },

      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (v: number) => `${Math.round(v)} fallas` },
      },

      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        markers: {
          size: 10,
          shape: 'circle',
          strokeWidth: 0,
        },
        itemMargin: { horizontal: 8, vertical: 4 },
      },

      noData: {
        text: data?.metadata?.mensaje ?? 'No hay datos con los filtros seleccionados',
        align: 'center',
        verticalAlign: 'middle',
        style: { fontSize: '14px', color: '#666' },
      },
    };

    chartInstanceRef.current = new ApexCharts(chartRef.current, options);
    chartInstanceRef.current.render();

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [data, height, config]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Evolución de Fallas</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[380px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle>Evolución de Fallas</CardTitle>
          <ChartToolbar
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            hasZoom={zoomRange !== null}
          />
        </div>
      </CardHeader>
      <CardContent>
        {data?.metadata?.mensaje && data.series.length === 0 && (
          <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {data.metadata.mensaje}
          </div>
        )}
        <div ref={chartRef} />
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Toolbar custom
// ─────────────────────────────────────────────────────────────

interface ChartToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  hasZoom: boolean;
}

function ChartToolbar({
  onZoomIn,
  onZoomOut,
  onReset,
  hasZoom,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-card px-1 py-0.5">
      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onZoomIn} title="Acercar">
        <ZoomIn className="h-3.5 w-3.5" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onZoomOut} title="Alejar">
        <ZoomOut className="h-3.5 w-3.5" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onReset} disabled={!hasZoom} title="Restablecer vista">
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
      <div className="ml-1 px-2 text-[10px] text-muted-foreground hidden sm:flex items-center gap-1">
        <MoveHorizontal className="h-3 w-3" />
        Arrastra el gráfico para mover
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getEjeXTitulo(config: Grafico1Filtros): string {
  return config.granularidad === GranularidadTemporal.MENSUAL
    ? `Meses del ${config.anio ?? '—'}`
    : 'Años';
}

function getSubtitle(config: Grafico1Filtros, data: Grafico1Response | null): string {
  if (!config.nivel) return 'Configura los filtros';

  const nivelText = LABEL_NIVEL[config.nivel];
  const viaText = LABEL_VIA_FALLAS[config.tipoVia ?? TipoViaFiltroFallas.TODAS];
  const tfText = LABEL_TIPO_FALLA[config.tipoFalla ?? TipoFallaFiltro.AMBAS];
  const elementos = config.elementoIds?.length ?? 0;
  const elText = elementos === 0 ? 'sin selección' : `${elementos} seleccionado(s)`;
  const periodo =
    config.granularidad === GranularidadTemporal.MENSUAL
      ? `Año ${config.anio ?? '—'}`
      : `${config.anioInicio ?? '—'}–${config.anioFin ?? '—'}`;
  const total = data?.metadata?.totalFallas ?? 0;

  return `${nivelText} | ${viaText} | ${tfText} | ${elText} | ${periodo} | Total: ${total}`;
}