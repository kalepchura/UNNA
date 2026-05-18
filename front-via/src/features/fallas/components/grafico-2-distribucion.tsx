/**
 * Gráfico 2 — Distribución de fallas por categoría.
 *
 * Renderizado como DONUT chart con ApexCharts.
 * Muestra el total de fallas en el centro.
 * Tooltip al hacer hover (etiquetas no se sobreponen visualmente).
 */

import { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  exportPNG,
  exportSVG,
  exportCSV,
} from '@/utils/exports/chart-export.utils';

import { ChartExportButtons } from '@/components/charts/chart-export-buttons';

import { Grafico2Response, Grafico2Filtros } from '../types/grafico-2.types';

export type { Grafico2Response, Grafico2Filtros };

interface Props {
  data: Grafico2Response | null;
  isLoading: boolean;
  height?: number;
}

// Paleta de colores para las rebanadas
const COLORES_DONUT = [
  '#0284c7', // azul
  '#e11d48', // rojo
  '#16a34a', // verde
  '#d97706', // naranja
  '#8b5cf6', // morado
  '#ec4899', // rosa
  '#14b8a6', // teal
  '#f43f5e', // coral
];

export function Grafico2Distribucion({
  data,
  isLoading,
  height = 400,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);

  const hasData = !!data?.barras?.length;

  // ============================================================
  // EXPORTACIONES
  // ============================================================
  const filename = `grafico-distribucion-${Date.now()}`;

  const handlePNG = () => exportPNG(chartInstanceRef.current, filename);
  const handleSVG = () => exportSVG(chartContainerRef.current, filename);
  const handleCSV = () => {
    if (!data?.barras?.length) return;
    exportCSV(
      ['Categoría', 'Total de Fallas'],
      data.barras.map((b) => [b.categoria, b.total]),
      filename,
    );
  };

  // ============================================================
  // CHART (Donut con ApexCharts)
  // ============================================================
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (!hasData) return;

    const series = data!.barras.map((b) => b.total);
    const labels = data!.barras.map((b) => b.categoria);
    const totalFallas = data!.metadata.totalFallas;

    const options: ApexCharts.ApexOptions = {
      series,
      labels,

      chart: {
        type: 'donut',
        height,
        width: '100%',
        toolbar: { show: false },
      },

      colors: COLORES_DONUT,

      // ⭐ Donut con total en el centro
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                color: '#64748b',
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#0f172a',
                offsetY: 5,
                formatter: (val: string) => `${val}`,
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total de fallas',
                fontSize: '14px',
                color: '#64748b',
                formatter: () => `${totalFallas}`,
              },
            },
          },
        },
      },

      // 🚫 Etiquetas NO encima de rebanadas (como pediste)
      dataLabels: {
        enabled: false,
      },

      title: {
        text: 'Distribución de Fallas por Categoría',
        align: 'center',
        style: { fontSize: '16px', fontWeight: 'bold' },
      },

      subtitle: {
        text: data ? getSubtitleText(data.configAplicada) : 'Sin datos',
        align: 'center',
      },

      // ⭐ Tooltip al hover
      tooltip: {
        enabled: true,
        y: {
          formatter: (value: number) => {
            const porcentaje = totalFallas > 0
              ? ((value / totalFallas) * 100).toFixed(1)
              : '0';
            return `${value} fallas (${porcentaje}%)`;
          },
        },
      },

      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '13px',
        formatter: (
  seriesName: string,
  opts?: {
    seriesIndex: number;
    w: {
      globals: {
        series: number[];
            };};}
        ) => {
        const valor = opts?.w.globals.series[opts.seriesIndex] ?? 0;

        return `${seriesName}: ${valor}`;
        },
      },

      noData: {
        text: 'No hay datos con los filtros seleccionados',
        align: 'center',
        verticalAlign: 'middle',
        style: { fontSize: '14px', color: '#666' },
      },

      // Responsive: en pantallas chicas, ajustar tamaños
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: { height: 300 },
            legend: { position: 'bottom' },
          },
        },
      ],
    };

    chartInstanceRef.current = new ApexCharts(chartRef.current, options);
    chartInstanceRef.current.render();

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [data, height, hasData]);

  // ============================================================
  // HELPERS
  // ============================================================
  const getSubtitleText = (config: Grafico2Filtros): string => {
    const tipoFalla = config.tipoFalla ?? 'AMBAS';
    const tipoVia = config.tipoVia ?? 'AMBAS';
    const tramoIds = config.tramoIds ?? [];
    const categoria = config.categoria ?? 'ACCION';
    const fechaDesde = config.fechaDesde ?? '';
    const fechaHasta = config.fechaHasta ?? '';

    const tipoFallaText = {
      RIEL: 'Solo Riel',
      SOLDADURA: 'Solo Soldadura',
      AMBAS: 'Riel + Soldadura',
    }[tipoFalla] ?? tipoFalla;

    const tipoViaText = {
      PAR: 'Solo Vía Par',
      IMPAR: 'Solo Vía Impar',
      AMBAS: 'Ambas Vías',
    }[tipoVia] ?? tipoVia;

    const categoriaText = {
      ACCION: 'Acción',
      CARRIL: 'Carril',
      UBICACION_FALLA: 'Ubicación de Falla',
      VIA: 'Vía',
    }[categoria] ?? categoria;

    const tramosText =
      tramoIds.length === 0
        ? 'Todos los tramos'
        : `${tramoIds.length} tramo(s) seleccionado(s)`;

    const fechaInicio = fechaDesde
      ? new Date(fechaDesde).toLocaleDateString('es-PE')
      : '—';
    const fechaFin = fechaHasta
      ? new Date(fechaHasta).toLocaleDateString('es-PE')
      : '—';

    return `${categoriaText} | ${tipoFallaText} | ${tipoViaText} | ${tramosText} | ${fechaInicio} - ${fechaFin}`;
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Fallas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <CardTitle>Distribución de Fallas</CardTitle>
            <ChartExportButtons
              onPNG={handlePNG}
              onSVG={handleSVG}
              onCSV={handleCSV}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No hay datos con los filtros seleccionados
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle>Distribución de Fallas</CardTitle>
          <ChartExportButtons
            onPNG={handlePNG}
            onSVG={handleSVG}
            onCSV={handleCSV}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef}>
          <div ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}