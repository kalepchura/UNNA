// frontend/src/features/fallas/components/grafico-3-velocidad.tsx

/**
 * G3 — Fallas por velocidad.
 *
 * Diseño:
 *  - Botones custom de zoom (+/-, reset) arriba del gráfico, VISIBLES.
 *  - Menú ☰ de ApexCharts solo conserva descargas (PNG/SVG/CSV).
 *  - Tooltip apilado: shared:false + intersect:true.
 *  - columnWidth dinámico.
 */

import { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { ZoomIn, ZoomOut, RotateCcw, MoveHorizontal } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import type { Grafico3Response, Grafico3Filtros } from '../types/grafico-3.types';
import { TipoFallaFiltro } from '@/lib/types/enums/fallas.enum';
import {
  LABEL_NIVEL,
  LABEL_VIA_FALLAS,
  TipoViaFiltroFallas,
} from '@/lib/types/enums/fallas-graficos.enum';

interface Props {
  data: Grafico3Response | null;
  config: Grafico3Filtros;
  isLoading: boolean;
  height?: number;
}

const LABEL_TIPO_FALLA: Record<string, string> = {
  RIEL: 'Solo Riel',
  SOLDADURA: 'Solo Soldadura',
  AMBAS: 'Riel + Soldadura',
};

function calcularColumnWidth(cantidadCategorias: number): string {
  if (cantidadCategorias <= 1) return '25%';
  if (cantidadCategorias <= 3) return '40%';
  if (cantidadCategorias <= 7) return '55%';
  return '70%';
}

export function Grafico3Velocidad({
  data,
  config,
  isLoading,
  height = 420,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number } | null>(null);

  const hasData =
    !!data && data.series.some((s) => s.datos.some((n) => n > 0));

  // ── Handlers de zoom ──────────────────────────────────────
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
    if (!data || !hasData) return;

    setZoomRange(null);

    const isApilado = config.apilarPorTipo === true && data.series.length > 1;
    const columnWidth = calcularColumnWidth(data.categorias.length);
    const filename = `grafico-velocidad-${Date.now()}`;

    const options: ApexCharts.ApexOptions = {
      series: data.series.map((s) => ({ name: s.nombre, data: s.datos })),

      chart: {
        type: 'bar',
        height,
        width: '100%',
        stacked: isApilado,
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
            csv: { filename, columnDelimiter: ',', headerCategory: 'Velocidad' },
            svg: { filename },
            png: { filename },
          },
        },
        zoom: { enabled: true, type: 'x', autoScaleYaxis: true },
        animations: { enabled: true, speed: 400 },
      },

      colors: ['#0284c7', '#e11d48', '#16a34a', '#d97706', '#8b5cf6'],

      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth,
          borderRadius: 8,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last',
          distributed: !isApilado && data.series.length === 1,
          dataLabels: {
            total: isApilado
              ? {
                  enabled: true,
                  style: { fontSize: '12px', fontWeight: 700, color: '#0f172a' },
                  offsetY: -4,
                }
              : { enabled: false },
            position: 'top',
          },
        },
      },

      dataLabels: {
        enabled: true,
        offsetY: isApilado ? 0 : -22,
        style: {
          fontSize: '12px',
          fontWeight: 700,
          colors: isApilado ? ['#ffffff'] : ['#0f172a'],
        },
        formatter: (val: number) => (val > 0 ? `${val}` : ''),
      },

      title: {
        text: 'Fallas por Velocidad',
        align: 'center',
        style: { fontSize: '16px', fontWeight: 'bold' },
      },

      subtitle: {
        text: getSubtitle(config, data?.metadata?.totalFallas ?? 0),
        align: 'center',
        style: { fontSize: '12px', color: '#64748b' },
      },

      xaxis: {
        categories: data.categorias,
        title: { text: 'Velocidad (km/h)', style: { fontWeight: 'bold', fontSize: '12px' } },
        labels: { style: { fontSize: '11.5px' } },
      },

      yaxis: {
        title: { text: 'Cantidad de Fallas', style: { fontWeight: 'bold', fontSize: '12px' } },
        min: 0,
        tickAmount: 5,
      },

      tooltip: {
        shared: false,
        intersect: true,
        y: { formatter: (v: number) => `${v} fallas` },
      },

      legend: {
        show: data.series.length > 1,
        position: 'top',
        horizontalAlign: 'center',
      },

      grid: {
        borderColor: '#e2e8f0',
        strokeDashArray: 3,
        yaxis: { lines: { show: true } },
      },

      fill: { opacity: 1 },

      responsive: [
        {
          breakpoint: 640,
          options: {
            legend: { position: 'bottom' },
            plotOptions: { bar: { columnWidth: '70%' } },
            dataLabels: { style: { fontSize: '10px' } },
          },
        },
      ],

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
  }, [data, height, config, hasData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Fallas por Velocidad</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[420px] w-full" /></CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader className="pb-2"><CardTitle>Fallas por Velocidad</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[420px] text-muted-foreground text-center px-4">
            {data?.metadata?.mensaje ?? 'No hay datos con los filtros seleccionados'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle>Fallas por Velocidad</CardTitle>
          <ChartToolbar
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            hasZoom={zoomRange !== null}
          />
        </div>
      </CardHeader>
      <CardContent>
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

function getSubtitle(config: Grafico3Filtros, total: number): string {
  if (!config.nivel) return 'Configura los filtros';

  const nivelText = LABEL_NIVEL[config.nivel];
  const viaText = LABEL_VIA_FALLAS[config.tipoVia ?? TipoViaFiltroFallas.TODAS];
  const tfText = LABEL_TIPO_FALLA[config.tipoFalla ?? TipoFallaFiltro.AMBAS];
  const apilText = config.apilarPorTipo ? 'Apilado Riel + Soldadura' : 'Total combinado';
  const elementos = config.elementoIds?.length ?? 0;
  const elText = elementos === 0 ? 'sin selección' : `${elementos} elemento(s)`;

  const fIni = config.fechaDesde
    ? new Date(config.fechaDesde).toLocaleDateString('es-PE')
    : '—';
  const fFin = config.fechaHasta
    ? new Date(config.fechaHasta).toLocaleDateString('es-PE')
    : '—';

  return `${nivelText} | ${viaText} | ${tfText} | ${apilText} | ${elText} | ${fIni} – ${fFin} | Total: ${total}`;
}