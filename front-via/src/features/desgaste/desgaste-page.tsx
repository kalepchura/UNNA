import { useState, useEffect } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/shared/chart-card';
import {
  ConfigSheet,
  ConfigSummaryChips,
} from '@/components/shared/config-sheet';

import { KpisDesgaste } from './components/kpis-desgaste';
import { WizardDesgaste } from './components/wizard-desgaste';
import { Grafico1DesgasteEvolucionReal } from './components/grafico-1-evolucion-real';
import { FiltrosGrafico2Desgaste } from './components/grafico-2-filtros';
import { Grafico2DesgasteCrecimientoTrafico } from './components/grafico-2-crecimiento-trafico';
import { WizardDesgasteG3 } from './components/wizard-desgaste-g3';
import { Grafico3DesgasteProyeccion } from './components/grafico-3-proyeccion-desgaste';

import type { Grafico1DesgasteFiltros } from './types/grafico-1.types';
import type { Grafico2DesgasteFiltros } from './types/grafico-2.types';
import type { Grafico3DesgasteFiltros } from './types/grafico-3.types';

import { queryKeys } from '@/lib/query-keys';
import { useApiQuery } from '@/hooks/use-api-query';
import { desgasteApi } from '@/lib/api/desgaste.api';

const STORAGE_KEYS = {
  GRAFICO1: 'desgaste_grafico1_config',
  GRAFICO2: 'desgaste_grafico2_config',
  GRAFICO3: 'desgaste_grafico3_config',
};

function leerConfig<T>(key: string): T {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : ({} as T);
  } catch {
    return {} as T;
  }
}

const TIPO_AGRUPACION_LABEL: Record<string, string> = {
  TRAMO: 'Tramo',
  CURVA_HORIZONTAL: 'Curva H',
  CURVA_VERTICAL: 'Curva V',
};

export function DesgastePage() {
  // KPIs
  const { data: kpisData, isLoading: kpisLoading } = useApiQuery({
    queryKey: queryKeys.desgaste.kpis(),
    queryFn: () => desgasteApi.analytics.kpis(),
  });

  // ─── GRÁFICO 1 ────────────────────────────────────────────────────────
  const [grafico1ConfigAplicada, setGrafico1ConfigAplicada] =
    useState<Grafico1DesgasteFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO1));

  const { data: grafico1Data, isLoading: grafico1Loading } = useApiQuery({
    queryKey: ['desgaste', 'grafico-1', grafico1ConfigAplicada],
    queryFn: () => desgasteApi.analytics.grafico1(grafico1ConfigAplicada),
    enabled: Object.keys(grafico1ConfigAplicada).length > 0,
  });

  useEffect(() => {
    if (
      grafico1Data?.configAplicada &&
      Object.keys(grafico1ConfigAplicada).length === 0
    ) {
      setGrafico1ConfigAplicada(grafico1Data.configAplicada);
      sessionStorage.setItem(
        STORAGE_KEYS.GRAFICO1,
        JSON.stringify(grafico1Data.configAplicada),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico1Data]);

  const handleAplicarGrafico1 = (config: Grafico1DesgasteFiltros) => {
    setGrafico1ConfigAplicada(config);
    sessionStorage.setItem(STORAGE_KEYS.GRAFICO1, JSON.stringify(config));
  };

  // ─── GRÁFICO 2 ────────────────────────────────────────────────────────
  const [grafico2Config, setGrafico2Config] =
    useState<Grafico2DesgasteFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO2));
  const [grafico2ConfigAplicada, setGrafico2ConfigAplicada] =
    useState<Grafico2DesgasteFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO2));

  const { data: grafico2Data, isLoading: grafico2Loading } = useApiQuery({
    queryKey: ['desgaste', 'grafico-2', grafico2ConfigAplicada],
    queryFn: () => desgasteApi.analytics.grafico2(grafico2ConfigAplicada),
    enabled: Object.keys(grafico2ConfigAplicada).length > 0,
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

  // ─── GRÁFICO 3 ────────────────────────────────────────────────────────
  const [grafico3ConfigAplicada, setGrafico3ConfigAplicada] =
    useState<Grafico3DesgasteFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO3));

  const { data: grafico3Data, isLoading: grafico3Loading } = useApiQuery({
    queryKey: ['desgaste', 'grafico-3', grafico3ConfigAplicada],
    queryFn: () => desgasteApi.analytics.grafico3(grafico3ConfigAplicada),
    enabled: Object.keys(grafico3ConfigAplicada).length > 0,
  });

  useEffect(() => {
    if (
      grafico3Data?.configAplicada &&
      Object.keys(grafico3ConfigAplicada).length === 0
    ) {
      setGrafico3ConfigAplicada(grafico3Data.configAplicada);
      sessionStorage.setItem(
        STORAGE_KEYS.GRAFICO3,
        JSON.stringify(grafico3Data.configAplicada),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico3Data]);

  const handleAplicarGrafico3 = (config: Grafico3DesgasteFiltros) => {
    setGrafico3ConfigAplicada(config);
    sessionStorage.setItem(STORAGE_KEYS.GRAFICO3, JSON.stringify(config));
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Análisis de Desgaste"
        subtitle="Indicadores y proyecciones de desgaste por tramo"
        breadcrumb={[{ label: 'Desgaste' }, { label: 'Análisis' }]}
      />

      <KpisDesgaste data={kpisData || null} isLoading={kpisLoading} />

      {/* GRÁFICO 1 — Wizard de 5 pasos */}
      <ChartCard
        eyebrow="Gráfico 1"
        title="Evolución del desgaste real"
        description="Tendencia histórica de mediciones por elemento."
        loading={grafico1Loading && !grafico1Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Asistente de configuración"
          description="Define los parámetros del gráfico paso a paso."
          triggerLabel="Configurar análisis"
          size="2xl"
          summary={
            <ConfigSummaryChips
              items={[
                {
                  label: 'Agrupación',
                  value:
                    TIPO_AGRUPACION_LABEL[
                      grafico1ConfigAplicada.tipoAgrupacion as string
                    ],
                },
                { label: 'Vía', value: grafico1ConfigAplicada.via },
                {
                  label: 'Puntos',
                  value: grafico1ConfigAplicada.puntosW?.join(' · '),
                },
                {
                  label: 'Elementos',
                  value:
                    grafico1ConfigAplicada.elementoCodigos &&
                    grafico1ConfigAplicada.elementoCodigos.length > 0
                      ? `${grafico1ConfigAplicada.elementoCodigos.length} sel.`
                      : grafico1ConfigAplicada.elementoCodigos
                        ? 'Todos'
                        : undefined,
                },
              ]}
            />
          }
        >
          {(close) => (
            <WizardDesgaste
              onConfigurar={(c) => {
                handleAplicarGrafico1(c);
                close();
              }}
            />
          )}
        </ConfigSheet>

        <div className="mt-4">
          <Grafico1DesgasteEvolucionReal
            data={grafico1Data || null}
            isLoading={grafico1Loading}
          />
        </div>
      </ChartCard>

      {/* GRÁFICO 2 — Filtro simple */}
      <ChartCard
        eyebrow="Gráfico 2"
        title="Crecimiento del tráfico por escenario"
        description="Proyección de tráfico (MGB) bajo escenarios definidos."
        loading={grafico2Loading && !grafico2Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar crecimiento de tráfico"
          description="Selecciona los escenarios a comparar."
          triggerLabel="Configurar gráfico"
          size="lg"
          summary={
            <ConfigSummaryChips
              items={[
                {
                  label: 'Escenarios',
                  value:
                    grafico2ConfigAplicada.escenarioIds &&
                    grafico2ConfigAplicada.escenarioIds.length > 0
                      ? `${grafico2ConfigAplicada.escenarioIds.length} sel.`
                      : 'Todos activos',
                },
              ]}
            />
          }
        >
          {(close) => (
            <FiltrosGrafico2Desgaste
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
          <Grafico2DesgasteCrecimientoTrafico
            data={grafico2Data || null}
            isLoading={grafico2Loading}
          />
        </div>
      </ChartCard>

      {/* GRÁFICO 3 — Wizard de 6 pasos */}
      <ChartCard
        eyebrow="Gráfico 3"
        title="Proyección de desgaste por escenario"
        description="Evolución futura estimada según parámetros del escenario."
        loading={grafico3Loading && !grafico3Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Asistente de proyección"
          description="Configura los parámetros para proyectar el desgaste."
          triggerLabel="Configurar proyección"
          size="2xl"
          summary={
            <ConfigSummaryChips
              items={[
                {
                  label: 'Agrupación',
                  value:
                    TIPO_AGRUPACION_LABEL[
                      grafico3ConfigAplicada.tipoAgrupacion as string
                    ],
                },
                { label: 'Vía', value: grafico3ConfigAplicada.via },
                {
                  label: 'Puntos',
                  value: grafico3ConfigAplicada.puntosW?.join(' · '),
                },
                {
                  label: 'Escenario',
                  value: grafico3ConfigAplicada.escenarioId
                    ? `ID ${grafico3ConfigAplicada.escenarioId}`
                    : undefined,
                },
              ]}
            />
          }
        >
          {(close) => (
            <WizardDesgasteG3
              onConfigurar={(c) => {
                handleAplicarGrafico3(c);
                close();
              }}
            />
          )}
        </ConfigSheet>

        <div className="mt-4">
          <Grafico3DesgasteProyeccion
            data={grafico3Data || null}
            isLoading={grafico3Loading}
          />
        </div>
      </ChartCard>
    </div>
  );
}
