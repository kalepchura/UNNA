import { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartExportButtons } from '@/components/charts/chart-export-buttons';
import { exportPNG, exportSVG, exportCSV } from '@/utils/exports/chart-export.utils';
import type { Grafico3DesgasteResponse } from '../types/grafico-3.types';

// Paleta amplia para soportar muchas líneas (multi-escenario + multi-elemento)
const COLORES = [
  '#0284c7', '#e11d48', '#16a34a', '#d97706', '#8b5cf6',
  '#ec4899', '#0891b2', '#65a30d', '#dc2626', '#7c3aed',
  '#0369a1', '#be185d', '#15803d', '#b45309', '#6d28d9',
];

interface Props {
  data: Grafico3DesgasteResponse | null;
  isLoading: boolean;
  height?: number;
}

export function Grafico3DesgasteProyeccion({ data, isLoading, height = 400 }: Props) {
  const chartRef          = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef  = useRef<ApexCharts | null>(null);

  const filename = `grafico-desgaste-3-${Date.now()}`;

  const handlePNG = () => exportPNG(chartInstanceRef.current, filename);
  const handleSVG = () => exportSVG(chartContainerRef.current, filename);
  const handleCSV = () => {
    if (!data) return;
    const filas = data.series.flatMap((serie) =>
      serie.puntos.map((p) => [
        serie.nombre,
        p.anio,
        `T${p.trimestre}`,
        p.x,
        p.y,
      ]),
    );
    exportCSV(
      ['Serie', 'Año', 'Trimestre', 'MTB acumulado', 'Desgaste (mm)'],
      filas,
      filename,
    );
  };

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstanceRef.current?.destroy();

    // Construir mapa anio → trimestre para el tooltip
    // (cada serie puede tener años distintos si los escenarios difieren)
    const seriesApex = (data?.series ?? []).map((serie) => ({
      name: serie.nombre,
      data: serie.puntos.map((p) => ({
        x: p.x,
        y: p.y,
        // Guardamos metadatos extras en el punto para el custom tooltip
        meta: { anio: p.anio, trimestre: p.trimestre },
      })),
    }));

    // Título dinámico: nombres de escenarios únicos
    const escenariosNombres = data?.metadata.escenarios.map((e) => e.nombre) ?? [];
    const titulo = escenariosNombres.length > 0
      ? `Proyección de Desgaste — ${escenariosNombres.join(' · ')}`
      : 'Proyección de Desgaste';

    const options: ApexCharts.ApexOptions = {
      series: seriesApex,
      chart: {
        type: 'line',
        height,
        width: '100%',
        zoom: { enabled: true, type: 'xy' },
        toolbar: { show: false },
        animations: { enabled: false },
      },
      colors: COLORES,
      stroke: { curve: 'smooth', width: 2.5 },
      markers: { size: 4, hover: { size: 6 } },
      title: {
        text: titulo,
        align: 'center',
        style: { fontSize: '15px', fontWeight: 'bold' },
      },
      xaxis: {
        type: 'numeric',
        title: {
          text: 'MTB Acumulado (millones de toneladas)',
          style: { fontWeight: 'bold', fontSize: '12px' },
        },
        labels: {
          formatter: (val: string) => Number(val).toFixed(1),
        },
      },
      yaxis: {
        title: {
          text: 'Desgaste (mm)',
          style: { fontWeight: 'bold', fontSize: '12px' },
        },
        // No forzamos min: 0 porque los valores pueden ser negativos
        labels: {
          formatter: (val: number) => `${val.toFixed(2)}`,
        },
      },
      tooltip: {
        shared: false,
        intersect: true,
        custom: ({ seriesIndex, dataPointIndex, w }) => {
          const serie     = data?.series[seriesIndex];
          const punto     = serie?.puntos[dataPointIndex];
          const serieNombre = w.globals.seriesNames[seriesIndex] ?? '';
          if (!punto) return '';

          return `
            <div style="padding:8px 12px;font-size:12px;line-height:1.6">
              <div style="font-weight:600;margin-bottom:4px">${serieNombre}</div>
              <div><b>Año:</b> ${punto.anio} · T${punto.trimestre}</div>
              <div><b>MTB:</b> ${punto.x.toFixed(3)} Mt</div>
              <div><b>Desgaste:</b> ${punto.y.toFixed(2)} mm</div>
            </div>
          `;
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        markers: { size: 6 },
        itemMargin: { horizontal: 8 },
      },
      grid: {
        borderColor: '#e2e8f0',
        row: { colors: ['#f8fafc', 'transparent'], opacity: 0.4 },
      },
      noData: {
        text: 'No hay datos con los filtros seleccionados',
        align: 'center',
        verticalAlign: 'middle',
        style: { fontSize: '14px', color: '#666' },
      },
    };

    // Línea de tolerancia máxima
    if (data) {
      options.annotations = {
        yaxis: [
          {
            y: data.metadata.toleranciaMm,
            borderColor: '#e11d48',
            borderWidth: 2,
            strokeDashArray: 6,
            label: {
              text: `Tolerancia (${data.metadata.toleranciaMm} mm)`,
              position: 'right',
              style: { color: '#e11d48', fontSize: '11px', background: '#fff1f2' },
            },
          },
        ],
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
        <CardContent><Skeleton className={`h-[${height}px] w-full`} /></CardContent>
      </Card>
    );
  }

  // Info de escenarios presentes (para el sub-header del card)
  const escenariosInfo = data?.metadata.escenarios ?? [];
  const configsSinDatos = data?.metadata.configsSinDatos ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <CardTitle>Proyección de Desgaste</CardTitle>
            {escenariosInfo.length > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {escenariosInfo.map((e) => (
                  <span key={e.id} className="mr-3">
                    <span className="font-medium">{e.nombre}</span>
                    {' '}({e.anioInicio}–{e.anioFin}, hasta {e.mtbMaximo.toFixed(1)} Mt)
                  </span>
                ))}
              </p>
            )}
          </div>
          <ChartExportButtons onPNG={handlePNG} onSVG={handleSVG} onCSV={handleCSV} />
        </div>

        {/* Aviso si alguna config no devolvió datos */}
        {configsSinDatos.length > 0 && (
          <p className="mt-1 text-xs text-amber-600">
            ⚠ La(s) configuración(es) {configsSinDatos.map((i) => i + 1).join(', ')} no
            devolvieron datos. Revisá los filtros.
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div ref={chartContainerRef}>
          <div ref={chartRef} />
        </div>

        {/* Estadísticas de la respuesta */}
        {data && (
          <p className="mt-2 text-right text-[11px] text-muted-foreground">
            {data.metadata.totalLineas} línea{data.metadata.totalLineas !== 1 ? 's' : ''} ·{' '}
            {data.metadata.totalMediciones} medición{data.metadata.totalMediciones !== 1 ? 'es' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}