import { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartExportButtons } from '@/components/charts/chart-export-buttons';
import { exportPNG, exportSVG, exportCSV } from '@/utils/exports/chart-export.utils';
import type { Grafico2TempResponse, Grafico2TempFiltros } from '../types/grafico-2.types';

interface Props {
  data: Grafico2TempResponse | null;
  isLoading: boolean;
  height?: number;
}

type TipoValor = 'min' | 'avg' | 'max';

export function Grafico2TempComparacion({
  data,
  isLoading,
  height = 350,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);
  const [tiposActivos, setTiposActivos] = useState<TipoValor[]>(['avg']);

  const filename = `grafico-temperatura-2-${Date.now()}`;

  const handlePNG = () => exportPNG(chartInstanceRef.current, filename);
  const handleSVG = () => exportSVG(chartContainerRef.current, filename);
  const handleCSV = () => {
    if (!data) return;
    const filas: (string | number)[][] = data.barras.map((barra) => [
        barra.nombre,
        barra.min ?? 0,
        barra.avg ?? 0,
        barra.max ?? 0,
        barra.cantidadRegistros ?? 0,
    ]);
    exportCSV(
      ['Tramo', 'Mín (°C)', 'Prom (°C)', 'Máx (°C)', 'Registros'],
      filas,
      filename,
    );
  };

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    // Construir una serie por cada tipo de valor activo
    const series = tiposActivos.map((tipo) => ({
      name: tipo === 'min' ? 'Mínimo' : tipo === 'avg' ? 'Promedio' : 'Máximo',
      data: data?.barras.map((barra) => barra[tipo]) ?? [],
    }));

    const categorias = data?.barras.map((b) => b.nombre) ?? [];

    const options: ApexCharts.ApexOptions = {
      series,
      chart: {
        type: 'bar',
        height,
        width: '100%',
        zoom: { enabled: false },
        toolbar: { show: false },
      },
      colors: ['#16a34a', '#0284c7', '#e11d48'], // verde, azul, rojo para min/avg/max
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          dataLabels: { position: 'top' },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => (val !== null ? `${val.toFixed(1)}°` : '—'),
        offsetY: -20,
        style: { fontSize: '10px', colors: ['#333'] },
      },
      title: {
        text: 'Comparación de Temperatura entre Tramos',
        align: 'center',
        style: { fontSize: '16px', fontWeight: 'bold' },
      },
      subtitle: {
        text: data ? getSubtitle(data.configAplicada) : 'Sin datos',
        align: 'center',
      },
      xaxis: {
        categories: categorias,
        title: { text: 'Tramo', style: { fontWeight: 'bold' } },
      },
      yaxis: {
        title: { text: 'Temperatura (°C)', style: { fontWeight: 'bold' } },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (val: number) => (val !== null ? `${val.toFixed(1)} °C` : '—') },
      },
      legend: { position: 'top', horizontalAlign: 'left', fontSize: '12px' },
      grid: { borderColor: '#e2e8f0' },
      noData: {
        text: 'No hay datos con los filtros seleccionados',
        align: 'center',
        verticalAlign: 'middle',
        style: { fontSize: '14px', color: '#666' },
      },
    };

    chartInstanceRef.current = new ApexCharts(chartRef.current, options);
    chartInstanceRef.current.render();

    return () => { chartInstanceRef.current?.destroy(); };
  }, [data, height, tiposActivos]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Comparación de Temperatura entre Tramos</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle>Comparación de Temperatura entre Tramos</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              {(['min', 'avg', 'max'] as TipoValor[]).map((tipo) => (
                <label key={tipo} className="flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tiposActivos.includes(tipo)}
                    onChange={() => {
                      setTiposActivos((prev) =>
                        prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
                      );
                    }}
                    className="rounded"
                  />
                  {tipo === 'min' ? 'Mínimo' : tipo === 'avg' ? 'Promedio' : 'Máximo'}
                </label>
              ))}
            </div>
            <ChartExportButtons onPNG={handlePNG} onSVG={handleSVG} onCSV={handleCSV} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef}><div ref={chartRef} /></div>
      </CardContent>
    </Card>
  );
}

function getSubtitle(config: Grafico2TempFiltros): string {
  const tramoIds = config.tramoIds ?? [];
  const tramosText = tramoIds.length === 0 ? 'Todos los tramos' : `${tramoIds.length} tramo(s)`;
  if (config.fechaDesde && config.fechaHasta) {
    return `${tramosText} | ${config.fechaDesde} – ${config.fechaHasta}`;
  }
  return tramosText;
}