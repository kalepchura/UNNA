// frontend/src/features/fallas/components/grafico-1-evolucion-temporal.tsx

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

import { ChartExportButtons }
  from '@/components/charts/chart-export-buttons';

import {
  Grafico1Response,
  Grafico1Filtros,
} from '../types/grafico-1.types';

export type {
  Grafico1Response,
  Grafico1Filtros,
};

interface Props {
  data: Grafico1Response | null;
  isLoading: boolean;
  height?: number;
}

export function Grafico1EvolucionTemporal({
  data,
  isLoading,
  height = 350,
}: Props) {

  // =========================
  // REFS
  // =========================
  const chartRef =
    useRef<HTMLDivElement>(null);

  const chartContainerRef =
    useRef<HTMLDivElement>(null);

  const chartInstanceRef =
    useRef<ApexCharts | null>(null);

  // =========================
  // EXPORTACIONES
  // =========================
  const filename =
    `grafico-fallas-${Date.now()}`;

  const handlePNG = () => {
    exportPNG(
      chartInstanceRef.current,
      filename
    );
  };

  const handleSVG = () => {
    exportSVG(
      chartContainerRef.current,
      filename
    );
  };

  const handleCSV = () => {
    if (!data) return;

    exportCSV(
      ['Tramo', ...data.categorias],

      data.series.map((serie) => [
        serie.nombre,
        ...serie.datos,
      ]),

      filename
    );
  };

  // =========================
  // CHART
  // =========================
  useEffect(() => {

    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const series =
      data?.series?.map(
        (
          serie: {
            nombre: string;
            datos: number[];
          }
        ) => ({
          name: serie.nombre,
          data: serie.datos,
        })
      ) || [];

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

      colors: [
        '#0284c7',
        '#e11d48',
        '#16a34a',
        '#d97706',
        '#8b5cf6',
        '#ec4899',
        '#14b8a6',
        '#f43f5e',
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
        text: 'Evolución de Fallas por Tramo',

        align: 'center',

        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
      },

      subtitle: {
        text: data
          ? getSubtitleText(
              data.configAplicada
            )
          : 'Sin datos',

        align: 'center',
      },

      xaxis: {
        categories:
          data?.categorias || [],

        title: {
          text: data
            ? getEjeXTitulo(
                data.configAplicada
              )
            : 'Seleccione filtros',

          style: {
            fontWeight: 'bold',
          },
        },
      },

      yaxis: {
        title: {
          text: 'Cantidad de Fallas',

          style: {
            fontWeight: 'bold',
          },
        },

        min: 0,

        tickAmount: 5,
      },

      tooltip: {
        shared: true,

        intersect: false,

        y: {
          formatter: (
            value: number
          ) => `${value} fallas`,
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
          colors: [
            '#f8fafc',
            'transparent',
          ],

          opacity: 0.5,
        },
      },

      noData: {
        text:
          'No hay datos con los filtros seleccionados',

        align: 'center',

        verticalAlign: 'middle',

        style: {
          fontSize: '14px',
          color: '#666',
        },
      },
    };

    chartInstanceRef.current =
      new ApexCharts(
        chartRef.current,
        options
      );

    chartInstanceRef.current.render();

    return () => {

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

    };

  }, [data, height]);

  // =========================
  // HELPERS CON VALORES POR DEFECTO
  // =========================
  const getEjeXTitulo = (
    config: Grafico1Filtros
  ): string => {
    const granularidad = config.granularidad ?? 'MENSUAL';
    const anio = config.anio ?? new Date().getFullYear();

    if (granularidad === 'MENSUAL') {
      return `Meses del ${anio}`;
    }

    return 'Años';
  };

  const getSubtitleText = (
    config: Grafico1Filtros
  ): string => {
    // Valores por defecto para campos opcionales
    const tipoFalla = config.tipoFalla ?? 'AMBAS';
    const tipoVia = config.tipoVia ?? 'AMBAS';
    const tramoIds = config.tramoIds ?? [];
    const granularidad = config.granularidad ?? 'MENSUAL';
    const anio = config.anio ?? new Date().getFullYear();
    const anioInicio = config.anioInicio ?? 2020;
    const anioFin = config.anioFin ?? new Date().getFullYear();

    const tipoFallaText = {
      RIEL: 'Solo Riel',
      SOLDADURA: 'Solo Soldadura',
      AMBAS: 'Riel + Soldadura',
    }[tipoFalla] || tipoFalla;

    const tipoViaText = {
      PAR: 'Solo Vía Par',
      IMPAR: 'Solo Vía Impar',
      AMBAS: 'Ambas Vías',
    }[tipoVia] || tipoVia;

    const tramosText = tramoIds.length === 0
      ? 'Todos los tramos'
      : `${tramoIds.length} tramo(s) seleccionado(s)`;

    if (granularidad === 'MENSUAL') {
      return `${tipoFallaText} | ${tipoViaText} | ${tramosText} | Año ${anio}`;
    }

    return `${tipoFallaText} | ${tipoViaText} | ${tramosText} | ${anioInicio} - ${anioFin}`;
  };

  // =========================
  // LOADING
  // =========================
  if (isLoading) {

    return (
      <Card>

        <CardHeader>
          <CardTitle>
            Evolución de Fallas
            por Tramo
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>

      </Card>
    );
  }

  // =========================
  // RENDER
  // =========================
  return (

    <Card>

      <CardHeader className="pb-2">

        <div className="flex justify-between items-center flex-wrap gap-2">

          <CardTitle>
            Evolución de Fallas
            por Tramo
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