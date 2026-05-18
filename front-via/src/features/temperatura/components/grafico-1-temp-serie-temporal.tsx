import { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartExportButtons } from '@/components/charts/chart-export-buttons';
import {
  exportPNG,
  exportSVG,
  exportCSV,
} from '@/utils/exports/chart-export.utils';

import type {
  Grafico1TempResponse,
  Grafico1TempFiltros,
} from '../types/grafico-1.types';

interface Props {
  data: Grafico1TempResponse | null;
  isLoading: boolean;
  height?: number;
}

type TipoValor = 'min' | 'avg' | 'max';

const COLORES_POR_TRAMO = [
  '#0284c7',
  '#e11d48',
  '#16a34a',
  '#d97706',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

export function Grafico1TempSerieTemporal({
  data,
  isLoading,
  height = 350,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);

  const [tiposActivos, setTiposActivos] = useState<TipoValor[]>(['avg']);

  const filename = `grafico-temperatura-${Date.now()}`;

  // Exportaciones
  const handlePNG = () =>
    exportPNG(chartInstanceRef.current, filename);

  const handleSVG = () =>
    exportSVG(chartContainerRef.current, filename);

  const handleCSV = () => {
    if (!data) return;

    const tipos =
      tiposActivos.length > 0 ? tiposActivos : ['avg'];

    const filas: (string | number)[][] = [];

    data.series.forEach((serie) => {
      tipos.forEach((tipo) => {
        filas.push([
          `${serie.nombre} - ${tipo.toUpperCase()}`,
          ...serie.valores[
            tipo as keyof typeof serie.valores
          ].map((v) => v ?? 0),
        ]);
      });
    });

    exportCSV(
      ['Tramo / Tipo', ...data.categorias],
      filas,
      filename,
    );
  };

  // Crear / actualizar gráfico
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const series =
      data?.series?.flatMap((serie) =>
        tiposActivos.map((tipo) => ({
          name: `${serie.nombre} — ${
            tipo === 'min'
              ? 'Mín'
              : tipo === 'avg'
              ? 'Prom'
              : 'Máx'
          }`,
          data: serie.valores[
            tipo as keyof typeof serie.valores
          ],
        }))
      ) ?? [];

    const options: ApexCharts.ApexOptions = {
      series,

      chart: {
        type: 'line',
        height,
        width: '100%',
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },

      colors: series.map(
        (_, i) =>
          COLORES_POR_TRAMO[
            i % COLORES_POR_TRAMO.length
          ]
      ),

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
        text: 'Evolución de Temperatura por Tramo',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
      },

      subtitle: {
        text: data
          ? getSubtitle(data.configAplicada)
          : 'Sin datos',
        align: 'center',
      },

      xaxis: {
        categories: data?.categorias ?? [],
        title: {
          text: 'Fecha',
          style: {
            fontWeight: 'bold',
          },
        },
      },

      yaxis: {
        title: {
          text: 'Temperatura (°C)',
          style: {
            fontWeight: 'bold',
          },
        },
        decimalsInFloat: 1,
        tickAmount: 5,
      },

      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (value: number) =>
            value !== null
              ? `${value.toFixed(1)} °C`
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
      options,
    );

    chartInstanceRef.current.render();

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [data, height, tiposActivos]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Evolución de Temperatura por Tramo
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle>
            Evolución de Temperatura por Tramo
          </CardTitle>

          <div className="flex items-center gap-4">
            {/* Checkboxes */}
            <div className="flex items-center gap-3 text-sm">
              {(
                ['min', 'avg', 'max'] as TipoValor[]
              ).map((tipo) => (
                <label
                  key={tipo}
                  className="flex items-center gap-1 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={tiposActivos.includes(tipo)}
                    onChange={() => {
                      setTiposActivos((prev) =>
                        prev.includes(tipo)
                          ? prev.filter((t) => t !== tipo)
                          : [...prev, tipo]
                      );
                    }}
                    className="rounded"
                  />

                  {tipo === 'min'
                    ? 'Mínimo'
                    : tipo === 'avg'
                    ? 'Promedio'
                    : 'Máximo'}
                </label>
              ))}
            </div>

            <ChartExportButtons
              onPNG={handlePNG}
              onSVG={handleSVG}
              onCSV={handleCSV}
            />
          </div>
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

// Helper subtítulo
function getSubtitle(
  config: Grafico1TempFiltros,
): string {
  const granularidad =
    config.granularidad ?? 'MENSUAL';

  const tramoIds = config.tramoIds ?? [];

  const tramosText =
    tramoIds.length === 0
      ? 'Todos los tramos'
      : `${tramoIds.length} tramo(s)`;

  if (
    granularidad === 'DIARIA' &&
    config.fechaDesde &&
    config.fechaHasta
  ) {
    return `${tramosText} | ${config.fechaDesde} – ${config.fechaHasta}`;
  }

  if (granularidad === 'MENSUAL') {
    return `${tramosText} | Año ${
      config.anio ?? '??'
    }`;
  }

  return `${tramosText} | ${
    config.anioInicio ?? '?'
  } – ${config.anioFin ?? '?'}`;
}