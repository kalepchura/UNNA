import { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ChartExportButtons } from '@/components/charts/chart-export-buttons';

import {
  exportPNG,
  exportSVG,
  exportCSV,
} from '@/utils/exports/chart-export.utils';

import type { Grafico2DesgasteResponse } from '../types/grafico-2.types';

interface Props {
  data: Grafico2DesgasteResponse | null;
  isLoading: boolean;
  height?: number;
}

export function Grafico2DesgasteCrecimientoTrafico({
  data,
  isLoading,
  height = 350,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const chartInstanceRef = useRef<ApexCharts | null>(null);

  const filename = `grafico-desgaste-2-${Date.now()}`;

  // EXPORTAR PNG
  const handlePNG = () =>
    exportPNG(chartInstanceRef.current, filename);

  // EXPORTAR SVG
  const handleSVG = () =>
    exportSVG(chartContainerRef.current, filename);

  // EXPORTAR CSV
  const handleCSV = () => {
    if (!data) return;

    const filas: (string | number)[][] = data.series.map(
      (serie) => [
        serie.nombre,

        ...serie.datos.map((valor) =>
          valor !== null ? valor : ''
        ),
      ]
    );

    exportCSV(
      ['Escenario', ...data.categorias],
      filas,
      filename
    );
  };

  // CREAR / ACTUALIZAR GRÁFICO
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const series =
      data?.series?.map((serie) => ({
        name: serie.nombre,
        data: serie.datos,
      })) ?? [];

    const options: ApexCharts.ApexOptions = {
      series,

      chart: {
        type: 'line',
        height,
        width: '100%',
        zoom: { enabled: true },
        toolbar: { show: false },
      },

      colors: [
        '#0284c7',
        '#e11d48',
        '#16a34a',
        '#d97706',
        '#8b5cf6',
        '#ec4899',
      ],

      stroke: {
        curve: 'smooth',
        width: 3,
      },

      markers: {
        size: 4,
        hover: {
          size: 6,
        },
      },

      title: {
        text: 'Crecimiento del Tráfico por Escenario',
        align: 'center',

        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
      },

      subtitle: {
        text: data
          ? `${data.metadata.totalEscenarios} escenario(s)`
          : 'Sin datos',

        align: 'center',
      },

      xaxis: {
        categories: data?.categorias ?? [],

        title: {
          text: 'Año',

          style: {
            fontWeight: 'bold',
          },
        },
      },

      yaxis: {
        title: {
          text: 'MTB Acumulado',

          style: {
            fontWeight: 'bold',
          },
        },

        decimalsInFloat: 3,
        tickAmount: 5,
      },

      tooltip: {
        shared: true,
        intersect: false,

        y: {
          formatter: (val: number) =>
            val !== null
              ? `${val.toFixed(3)} MTB`
              : '—',
        },
      },

      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
      },

      grid: {
        borderColor: '#e2e8f0',

        row: {
          colors: ['#f8fafc', 'transparent'],
          opacity: 0.5,
        },
      },

      noData: {
        text: 'No hay datos con los filtros seleccionados',

        align: 'center',
        verticalAlign: 'middle',

        style: {
          fontSize: '14px',
          color: '#666',
        },
      },
    };

    chartInstanceRef.current = new ApexCharts(
      chartRef.current,
      options
    );

    chartInstanceRef.current.render();

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [data, height]);

  // LOADING
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Crecimiento del Tráfico por Escenario
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // UI
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle>
            Crecimiento del Tráfico por Escenario
          </CardTitle>

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