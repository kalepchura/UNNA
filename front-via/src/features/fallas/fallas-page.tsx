import { useState, useEffect } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/shared/chart-card';
import {
  ConfigSheet,
  ConfigSummaryChips,
} from '@/components/shared/config-sheet';

import { Grafico1EvolucionTemporal } from './components/grafico-1-evolucion-temporal';
import { FiltrosGrafico1 } from './components/grafico-1-filtros';
import { Grafico2Distribucion } from './components/grafico-2-distribucion';
import { FiltrosGrafico2 } from './components/grafico-2-filtros';
import { Grafico3Velocidad } from './components/grafico-3-velocidad';
import { FiltrosGrafico3 } from './components/grafico-3-filtros';
import { KpisFallas } from './components/kpis-fallas';

import type { Grafico1Filtros } from './types/grafico-1.types';
import type { Grafico2Filtros } from './types/grafico-2.types';
import type { Grafico3Filtros } from './types/grafico-3.types';

import { queryKeys } from '@/lib/query-keys';
import { useApiQuery } from '@/hooks/use-api-query';
import { fallasApi } from '@/lib/api/fallas.api';

const STORAGE_KEYS = {
  GRAFICO1: 'fallas_grafico1_config',
  GRAFICO2: 'fallas_grafico2_config',
  GRAFICO3: 'fallas_grafico3_config',
};

function leerConfig<T>(key: string): T {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : ({} as T);
  } catch {
    return {} as T;
  }
}

export function FallasPage() {
  // ── KPIs ────────────────────────────────────────────────────────────
  const { data: kpisData, isLoading: kpisLoading } = useApiQuery({
    queryKey: queryKeys.fallas.kpis(),
    queryFn: () => fallasApi.analytics.kpis(),
  });

  // ── Estado de los 3 gráficos ────────────────────────────────────────
  const [grafico1Config, setGrafico1Config] = useState<Grafico1Filtros>(
    () => leerConfig(STORAGE_KEYS.GRAFICO1),
  );
  const [grafico1ConfigAplicada, setGrafico1ConfigAplicada] =
    useState<Grafico1Filtros>(() => leerConfig(STORAGE_KEYS.GRAFICO1));

  const [grafico2Config, setGrafico2Config] = useState<Grafico2Filtros>(
    () => leerConfig(STORAGE_KEYS.GRAFICO2),
  );
  const [grafico2ConfigAplicada, setGrafico2ConfigAplicada] =
    useState<Grafico2Filtros>(() => leerConfig(STORAGE_KEYS.GRAFICO2));

  const [grafico3Config, setGrafico3Config] = useState<Grafico3Filtros>(
    () => leerConfig(STORAGE_KEYS.GRAFICO3),
  );
  const [grafico3ConfigAplicada, setGrafico3ConfigAplicada] =
    useState<Grafico3Filtros>(() => leerConfig(STORAGE_KEYS.GRAFICO3));

  const { data: grafico1Data, isLoading: grafico1Loading } = useApiQuery({
    queryKey: ['fallas', 'grafico-1', grafico1ConfigAplicada],
    queryFn: () => fallasApi.analytics.grafico1(grafico1ConfigAplicada),
  });

  const { data: grafico2Data, isLoading: grafico2Loading } = useApiQuery({
    queryKey: ['fallas', 'grafico-2', grafico2ConfigAplicada],
    queryFn: () => fallasApi.analytics.grafico2(grafico2ConfigAplicada),
  });

  const { data: grafico3Data, isLoading: grafico3Loading } = useApiQuery({
    queryKey: ['fallas', 'grafico-3', grafico3ConfigAplicada],
    queryFn: () => fallasApi.analytics.grafico3(grafico3ConfigAplicada),
  });

  useEffect(() => {
    if (grafico1Data?.configAplicada && esConfigVacia(grafico1Config)) {
      setGrafico1Config(grafico1Data.configAplicada);
      setGrafico1ConfigAplicada(grafico1Data.configAplicada);
      sessionStorage.setItem(
        STORAGE_KEYS.GRAFICO1,
        JSON.stringify(grafico1Data.configAplicada),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico1Data]);

  useEffect(() => {
    if (grafico2Data?.configAplicada && esConfigVacia(grafico2Config)) {
      setGrafico2Config(grafico2Data.configAplicada);
      setGrafico2ConfigAplicada(grafico2Data.configAplicada);
      sessionStorage.setItem(
        STORAGE_KEYS.GRAFICO2,
        JSON.stringify(grafico2Data.configAplicada),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico2Data]);

  useEffect(() => {
    if (grafico3Data?.configAplicada && esConfigVacia(grafico3Config)) {
      setGrafico3Config(grafico3Data.configAplicada);
      setGrafico3ConfigAplicada(grafico3Data.configAplicada);
      sessionStorage.setItem(
        STORAGE_KEYS.GRAFICO3,
        JSON.stringify(grafico3Data.configAplicada),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico3Data]);

  const handleAplicarGrafico1 = () => {
    setGrafico1ConfigAplicada(grafico1Config);
    sessionStorage.setItem(
      STORAGE_KEYS.GRAFICO1,
      JSON.stringify(grafico1Config),
    );
  };
  const handleAplicarGrafico2 = () => {
    setGrafico2ConfigAplicada(grafico2Config);
    sessionStorage.setItem(
      STORAGE_KEYS.GRAFICO2,
      JSON.stringify(grafico2Config),
    );
  };
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
        title="Análisis de Fallas"
        subtitle="Indicadores y gráficos de fallas de riel y soldadura inox"
        breadcrumb={[{ label: 'Fallas' }, { label: 'Análisis' }]}
      />

      <KpisFallas data={kpisData || null} isLoading={kpisLoading} />

      {/* GRÁFICO 1 */}
      <ChartCard
        eyebrow="Gráfico 1"
        title="Evolución temporal por tramo"
        description="Cantidad de fallas registradas a lo largo del tiempo, segmentado por tramo."
        loading={grafico1Loading && !grafico1Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar evolución temporal"
          description="Ajusta granularidad, rango temporal y filtros del gráfico."
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
                { label: 'Tipo falla', value: grafico1ConfigAplicada.tipoFalla },
                { label: 'Vía', value: grafico1ConfigAplicada.tipoVia },
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
            <FiltrosGrafico1
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
          <Grafico1EvolucionTemporal
            data={grafico1Data || null}
            isLoading={grafico1Loading}
          />
        </div>
      </ChartCard>

      {/* GRÁFICO 2 */}
      <ChartCard
        eyebrow="Gráfico 2"
        title="Distribución por categoría"
        description="Proporción de fallas agrupadas según la categoría seleccionada."
        loading={grafico2Loading && !grafico2Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar distribución"
          description="Define rango temporal, tipo de falla y categoría de agrupación."
          triggerLabel="Configurar gráfico"
          size="xl"
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
                { label: 'Tipo falla', value: grafico2ConfigAplicada.tipoFalla },
                { label: 'Categoría', value: grafico2ConfigAplicada.categoria },
                { label: 'Vía', value: grafico2ConfigAplicada.tipoVia },
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
            <FiltrosGrafico2
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
          <Grafico2Distribucion
            data={grafico2Data || null}
            isLoading={grafico2Loading}
          />
        </div>
      </ChartCard>

      {/* GRÁFICO 3 */}
      <ChartCard
        eyebrow="Gráfico 3"
        title="Fallas por velocidad"
        description="Correlación entre velocidad operacional y cantidad de fallas."
        loading={grafico3Loading && !grafico3Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar fallas por velocidad"
          description="Ajusta rango, tipos y visualización del gráfico de velocidad."
          triggerLabel="Configurar gráfico"
          size="xl"
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
                { label: 'Tipo falla', value: grafico3ConfigAplicada.tipoFalla },
                { label: 'Vía', value: grafico3ConfigAplicada.tipoVia },
                {
                  label: 'Apilar',
                  value: grafico3ConfigAplicada.apilarPorTipo ? 'Sí' : undefined,
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
            <FiltrosGrafico3
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
          <Grafico3Velocidad
            data={grafico3Data || null}
            isLoading={grafico3Loading}
          />
        </div>
      </ChartCard>
    </div>
  );
}

function esConfigVacia(config: object): boolean {
  return Object.keys(config).length === 0;
}
