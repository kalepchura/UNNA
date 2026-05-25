import { useState, useEffect } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/shared/chart-card';
import {
  ConfigSheet,
  ConfigSummaryChips,
} from '@/components/shared/config-sheet';

import { KpisTemperatura } from './components/kpis-temperatura';
import { Grafico1TempSerieTemporal } from './components/grafico-1-temp-serie-temporal';
import { FiltrosGrafico1Temp } from './components/grafico-1-temp-filtros';
import { Grafico2TempComparacion } from './components/grafico-2-temp-comparacion';
import { FiltrosGrafico2Temp } from './components/grafico-2-temp-filtros';
import { Grafico3TempPatronHorario } from './components/grafico-3-temp-patron-horario';
import { FiltrosGrafico3Temp } from './components/grafico-3-temp-filtros';

import type { Grafico1TempFiltros } from './types/grafico-1.types';
import type { Grafico2TempFiltros } from './types/grafico-2.types';
import type { Grafico3TempFiltros } from './types/grafico-3.types';

import { queryKeys } from '@/lib/query-keys';
import { useApiQuery } from '@/hooks/use-api-query';
import { temperaturaApi } from '@/lib/api/temperatura.api';

const STORAGE_KEYS = {
  GRAFICO1: 'temperatura_grafico1_config',
  GRAFICO2: 'temperatura_grafico2_config',
  GRAFICO3: 'temperatura_grafico3_config',
};

function leerConfig<T>(key: string): T {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : ({} as T);
  } catch {
    return {} as T;
  }
}

export function TemperaturaPage() {
  const { data: kpisData, isLoading: kpisLoading } = useApiQuery({
    queryKey: queryKeys.temperatura.kpis(),
    queryFn: () => temperaturaApi.analytics.kpis(),
  });

  const [grafico1Config, setGrafico1Config] = useState<Grafico1TempFiltros>(
    () => leerConfig(STORAGE_KEYS.GRAFICO1),
  );
  const [grafico1ConfigAplicada, setGrafico1ConfigAplicada] =
    useState<Grafico1TempFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO1));

  const { data: grafico1Data, isLoading: grafico1Loading } = useApiQuery({
    queryKey: queryKeys.temperatura.grafico1(grafico1ConfigAplicada),
    queryFn: () => temperaturaApi.analytics.grafico1(grafico1ConfigAplicada),
  });

  useEffect(() => {
    if (
      grafico1Data?.configAplicada &&
      Object.keys(grafico1ConfigAplicada).length === 0
    ) {
      setGrafico1Config(grafico1Data.configAplicada);
      setGrafico1ConfigAplicada(grafico1Data.configAplicada);
      sessionStorage.setItem(
        STORAGE_KEYS.GRAFICO1,
        JSON.stringify(grafico1Data.configAplicada),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico1Data]);

  const handleAplicarGrafico1 = () => {
    setGrafico1ConfigAplicada(grafico1Config);
    sessionStorage.setItem(
      STORAGE_KEYS.GRAFICO1,
      JSON.stringify(grafico1Config),
    );
  };

  const [grafico2Config, setGrafico2Config] = useState<Grafico2TempFiltros>(
    () => leerConfig(STORAGE_KEYS.GRAFICO2),
  );
  const [grafico2ConfigAplicada, setGrafico2ConfigAplicada] =
    useState<Grafico2TempFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO2));

  const { data: grafico2Data, isLoading: grafico2Loading } = useApiQuery({
    queryKey: queryKeys.temperatura.grafico2(grafico2ConfigAplicada),
    queryFn: () => temperaturaApi.analytics.grafico2(grafico2ConfigAplicada),
  });

  useEffect(() => {
    if (
      grafico2Data?.configAplicada &&
      Object.keys(grafico2ConfigAplicada).length === 0
    ) {
      setGrafico2Config(grafico2Data.configAplicada);
      setGrafico2ConfigAplicada(grafico2Data.configAplicada);
      sessionStorage.setItem(
        STORAGE_KEYS.GRAFICO2,
        JSON.stringify(grafico2Data.configAplicada),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico2Data]);

  const handleAplicarGrafico2 = () => {
    setGrafico2ConfigAplicada(grafico2Config);
    sessionStorage.setItem(
      STORAGE_KEYS.GRAFICO2,
      JSON.stringify(grafico2Config),
    );
  };

  const [grafico3Config, setGrafico3Config] = useState<Grafico3TempFiltros>(
    () => leerConfig(STORAGE_KEYS.GRAFICO3),
  );
  const [grafico3ConfigAplicada, setGrafico3ConfigAplicada] =
    useState<Grafico3TempFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO3));

  const { data: grafico3Data, isLoading: grafico3Loading } = useApiQuery({
    queryKey: queryKeys.temperatura.grafico3(grafico3ConfigAplicada),
    queryFn: () => temperaturaApi.analytics.grafico3(grafico3ConfigAplicada),
  });

  useEffect(() => {
    if (
      grafico3Data?.configAplicada &&
      Object.keys(grafico3ConfigAplicada).length === 0
    ) {
      setGrafico3Config(grafico3Data.configAplicada);
      setGrafico3ConfigAplicada(grafico3Data.configAplicada);
      sessionStorage.setItem(
        STORAGE_KEYS.GRAFICO3,
        JSON.stringify(grafico3Data.configAplicada),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico3Data]);

  const handleAplicarGrafico3 = () => {
    setGrafico3ConfigAplicada(grafico3Config);
    sessionStorage.setItem(
      STORAGE_KEYS.GRAFICO3,
      JSON.stringify(grafico3Config),
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Análisis de Temperatura"
        subtitle="Indicadores y series temporales de temperatura por tramo"
        breadcrumb={[{ label: 'Temperatura' }, { label: 'Análisis' }]}
      />

      <KpisTemperatura data={kpisData || null} isLoading={kpisLoading} />

      <ChartCard
        eyebrow="Gráfico 1"
        title="Evolución temporal por tramo"
        description="Serie temporal de la temperatura registrada en cada tramo."
        loading={grafico1Loading && !grafico1Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar evolución temporal"
          description="Ajusta granularidad y filtros de la serie."
          triggerLabel="Configurar gráfico"
          size="xl"
          summary={
            <ConfigSummaryChips
              items={[
                { label: 'Granularidad', value: grafico1ConfigAplicada.granularidad },
                {
                  label: 'Año',
                  value:
                    grafico1ConfigAplicada.granularidad === 'MENSUAL'
                      ? grafico1ConfigAplicada.anio
                      : grafico1ConfigAplicada.anioInicio && grafico1ConfigAplicada.anioFin
                        ? `${grafico1ConfigAplicada.anioInicio}–${grafico1ConfigAplicada.anioFin}`
                        : undefined,
                },
                {
                  label: 'Tramos',
                  value: grafico1ConfigAplicada.tramoIds?.length
                    ? `${grafico1ConfigAplicada.tramoIds.length} sel.`
                    : undefined,
                },
              ]}
            />
          }
        >
          {(close) => (
            <FiltrosGrafico1Temp
              config={grafico1Config}
              onChange={setGrafico1Config}
              onAplicar={() => {
                handleAplicarGrafico1();
                close();
              }}
              isLoading={grafico1Loading}
            />
          )}
        </ConfigSheet>

        <div className="mt-4">
          <Grafico1TempSerieTemporal
            data={grafico1Data || null}
            isLoading={grafico1Loading}
          />
        </div>
      </ChartCard>

      <ChartCard
        eyebrow="Gráfico 2"
        title="Comparación entre tramos"
        description="Distribución comparada de temperaturas para los tramos seleccionados."
        loading={grafico2Loading && !grafico2Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar comparación"
          description="Selecciona rango temporal y tramos a comparar."
          triggerLabel="Configurar gráfico"
          size="lg"
          summary={
            <ConfigSummaryChips
              items={[
                {
                  label: 'Rango',
                  value:
                    grafico2ConfigAplicada.fechaDesde && grafico2ConfigAplicada.fechaHasta
                      ? `${grafico2ConfigAplicada.fechaDesde} → ${grafico2ConfigAplicada.fechaHasta}`
                      : undefined,
                },
                {
                  label: 'Tramos',
                  value: grafico2ConfigAplicada.tramoIds?.length
                    ? `${grafico2ConfigAplicada.tramoIds.length} sel.`
                    : undefined,
                },
              ]}
            />
          }
        >
          {(close) => (
            <FiltrosGrafico2Temp
              config={grafico2Config}
              onChange={setGrafico2Config}
              onAplicar={() => {
                handleAplicarGrafico2();
                close();
              }}
              isLoading={grafico2Loading}
            />
          )}
        </ConfigSheet>

        <div className="mt-4">
          <Grafico2TempComparacion
            data={grafico2Data || null}
            isLoading={grafico2Loading}
          />
        </div>
      </ChartCard>

      <ChartCard
        eyebrow="Gráfico 3"
        title="Patrón horario"
        description="Distribución de temperatura promedio por hora del día."
        loading={grafico3Loading && !grafico3Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar patrón horario"
          description="Ajusta rango temporal y tramos del análisis."
          triggerLabel="Configurar gráfico"
          size="lg"
          summary={
            <ConfigSummaryChips
              items={[
                {
                  label: 'Rango',
                  value:
                    grafico3ConfigAplicada.fechaDesde && grafico3ConfigAplicada.fechaHasta
                      ? `${grafico3ConfigAplicada.fechaDesde} → ${grafico3ConfigAplicada.fechaHasta}`
                      : undefined,
                },
                {
                  label: 'Tramos',
                  value: grafico3ConfigAplicada.tramoIds?.length
                    ? `${grafico3ConfigAplicada.tramoIds.length} sel.`
                    : undefined,
                },
              ]}
            />
          }
        >
          {(close) => (
            <FiltrosGrafico3Temp
              config={grafico3Config}
              onChange={setGrafico3Config}
              onAplicar={() => {
                handleAplicarGrafico3();
                close();
              }}
              isLoading={grafico3Loading}
            />
          )}
        </ConfigSheet>

        <div className="mt-4">
          <Grafico3TempPatronHorario
            data={grafico3Data || null}
            isLoading={grafico3Loading}
          />
        </div>
      </ChartCard>
    </div>
  );
}
