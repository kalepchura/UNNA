// frontend/src/features/fallas/components/grafico-3-velocidad.tsx

import { useEffect, useRef, useCallback } from 'react';
import ApexCharts from 'apexcharts';
import { toPng, toSvg } from 'html-to-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartExportButtons } from '@/components/charts/chart-export-buttons';
import { Grafico3Response, Grafico3Filtros } from '../types/grafico-3.types';

export type { Grafico3Response, Grafico3Filtros };

interface Props {
  data: Grafico3Response | null;
  isLoading: boolean;
  height?: number;
}

export function Grafico3Velocidad({ data, isLoading, height = 350 }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);

  const exportarPNG = useCallback(async () => {
    if (chartContainerRef.current) {
      try {
        const dataUrl = await toPng(chartContainerRef.current, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
        });
        const link = document.createElement('a');
        link.download = `grafico-velocidad-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error al exportar PNG:', error);
      }
    }
  }, []);

  const exportarSVG = useCallback(async () => {
    if (chartContainerRef.current) {
      try {
        const dataUrl = await toSvg(chartContainerRef.current, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
        });
        const link = document.createElement('a');
        link.download = `grafico-velocidad-${Date.now()}.svg`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error al exportar SVG:', error);
      }
    }
  }, []);

  const exportarCSV = useCallback(() => {
    if (!data) return;

    let csvContent = "Velocidad";
    data.series.forEach((serie) => {
      csvContent += `,${serie.nombre}`;
    });
    csvContent += "\n";

    for (let i = 0; i < data.categorias.length; i++) {
      csvContent += data.categorias[i];
      data.series.forEach((serie) => {
        csvContent += `,${serie.datos[i]}`;
      });
      csvContent += "\n";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `grafico-velocidad-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (!data || data.series.length === 0 || data.categorias.length === 0) return;

    const series = data.series.map((serie) => ({
      name: serie.nombre,
      data: serie.datos,
    }));

    const isApilado = data.configAplicada.apilarPorTipo === true;
    const isSoloUnaSerie = series.length === 1;

    const options: ApexCharts.ApexOptions = {
      series: series,
      chart: {
        type: 'bar',
        height: height,
        width: '100%',
        toolbar: { show: false },
        ...(isApilado && !isSoloUnaSerie ? { stacked: true } : {}),
      },
      colors: ['#0284c7', '#e11d48', '#16a34a', '#d97706', '#8b5cf6'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: '70%',
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val} fallas`,
        offsetY: -20,
      },
      title: {
        text: 'Fallas por Velocidad',
        align: 'center',
        style: { fontSize: '16px', fontWeight: 'bold' },
      },
      subtitle: {
        text: getSubtitleText(data.configAplicada),
        align: 'center',
      },
      xaxis: {
        categories: data.categorias,
        title: {
          text: 'Velocidad (km/h)',
          style: { fontWeight: 'bold' },
        },
      },
      yaxis: {
        title: { text: 'Cantidad de Fallas', style: { fontWeight: 'bold' } },
        min: 0,
        tickAmount: 5,
      },
      tooltip: {
        y: { formatter: (value: number) => `${value} fallas` },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
      },
      grid: {
        borderColor: '#e2e8f0',
        row: { colors: ['#f8fafc', 'transparent'], opacity: 0.5 },
      },
      noData: {
        text: 'No hay datos con los filtros seleccionados',
        align: 'center',
        verticalAlign: 'middle',
        style: { fontSize: '14px', color: '#666' },
      },
    };

    chartInstanceRef.current = new ApexCharts(chartRef.current, options);
    chartInstanceRef.current.render();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, height]);

  const getSubtitleText = (config: Grafico3Filtros): string => {
    const tipoFallaText = {
      RIEL: 'Solo Riel',
      SOLDADURA: 'Solo Soldadura',
      AMBAS: 'Riel + Soldadura',
    }[config.tipoFalla || 'AMBAS'] || config.tipoFalla;

    const tipoViaText = {
      PAR: 'Solo Vía Par',
      IMPAR: 'Solo Vía Impar',
      AMBAS: 'Ambas Vías',
    }[config.tipoVia || 'AMBAS'] || config.tipoVia;

    const apilamientoText = config.apilarPorTipo ? 'Riel + Soldadura (apilado)' : 'Total combinado';
    const tramosText = (config.tramoIds || []).length === 0
      ? 'Todos los tramos'
      : `${config.tramoIds?.length} tramo(s) seleccionado(s)`;

    const fechaInicio = config.fechaDesde ? new Date(config.fechaDesde).toLocaleDateString('es-PE') : '...';
    const fechaFin = config.fechaHasta ? new Date(config.fechaHasta).toLocaleDateString('es-PE') : '...';

    return `${tipoFallaText} | ${tipoViaText} | ${apilamientoText} | ${tramosText} | ${fechaInicio} - ${fechaFin}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fallas por Velocidad</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.series.length === 0 || data.categorias.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fallas por Velocidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
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
          <CardTitle>Fallas por Velocidad</CardTitle>
          <ChartExportButtons
            onPNG={exportarPNG}
            onSVG={exportarSVG}
            onCSV={exportarCSV}
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