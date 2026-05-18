import { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartExportButtons } from '@/components/charts/chart-export-buttons';
import { exportPNG, exportSVG, exportCSV } from '@/utils/exports/chart-export.utils';
import type { Grafico3DesgasteResponse } from '../types/grafico-3.types';

interface Props {
  data: Grafico3DesgasteResponse | null;
  isLoading: boolean;
  height?: number;
}

export function Grafico3DesgasteProyeccion({
  data,
  isLoading,
  height = 350,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);

  const filename = `grafico-desgaste-3-${Date.now()}`;

  const handlePNG = () => exportPNG(chartInstanceRef.current, filename);
  const handleSVG = () => exportSVG(chartContainerRef.current, filename);
  const handleCSV = () => {
    if (!data) return;
    const filas = data.series.flatMap((serie) =>
      serie.puntos.map((p) => [serie.nombre, p.anio, p.x, p.y])
    );
    exportCSV(['Serie', 'Año', 'MTB acumulado', 'Desgaste (mm)'], filas, filename);
  };

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const series = data?.series?.map((serie) => ({
      name: serie.nombre,
      data: serie.puntos.map((p) => ({ x: p.x, y: p.y })),
    })) ?? [];

    const options: ApexCharts.ApexOptions = {
      series,
      chart: { type: 'line', height, width: '100%', zoom: { enabled: true }, toolbar: { show: false } },
      colors: ['#0284c7', '#e11d48', '#16a34a', '#d97706', '#8b5cf6', '#ec4899'],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 4, hover: { size: 6 } },
      title: {
        text: `Proyección de Desgaste — ${data?.metadata?.escenarioNombre ?? ''}`,
        align: 'center',
        style: { fontSize: '16px', fontWeight: 'bold' },
      },
      xaxis: {
        type: 'numeric',
        title: { text: 'MTB Acumulado (millones de toneladas)', style: { fontWeight: 'bold' } },
      },
      yaxis: { title: { text: 'Desgaste (mm)', style: { fontWeight: 'bold' } }, min: 0 },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (val: number) => `${val.toFixed(2)} mm` },
      },
      legend: { position: 'top', horizontalAlign: 'left', fontSize: '12px' },
      grid: { borderColor: '#e2e8f0', row: { colors: ['#f8fafc', 'transparent'], opacity: 0.5 } },
      noData: { text: 'No hay datos con los filtros seleccionados', align: 'center', verticalAlign: 'middle', style: { fontSize: '14px', color: '#666' } },
    };

    if (data) {
      options.annotations = {
        yaxis: [{
            y: data.metadata.toleranciaMm,
            borderColor: '#e11d48',
            borderWidth: 2,
            strokeDashArray: 6,
          label: {
            text: `Tolerancia (${data.metadata.toleranciaMm} mm)`,
            position: 'right',
            style: { color: '#e11d48', fontSize: '12px' },
          },
        }],
      };
    }

    chartInstanceRef.current = new ApexCharts(chartRef.current, options);
    chartInstanceRef.current.render();

    return () => { chartInstanceRef.current?.destroy(); };
  }, [data, height]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Proyección de Desgaste</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle>Proyección de Desgaste</CardTitle>
          <ChartExportButtons onPNG={handlePNG} onSVG={handleSVG} onCSV={handleCSV} />
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef}><div ref={chartRef} /></div>
      </CardContent>
    </Card>
  );
}