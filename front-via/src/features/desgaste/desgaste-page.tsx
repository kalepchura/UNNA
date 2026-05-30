import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/shared/chart-card';
import {
  ConfigSheet,
  ConfigSummaryChips,
} from '@/components/shared/config-sheet';

import { KpisDesgaste } from './components/kpis-desgaste';
import { FiltrosGrafico2Desgaste } from './components/grafico-2-filtros';
import { Grafico2DesgasteCrecimientoTrafico } from './components/grafico-2-crecimiento-trafico';
import { WizardDesgasteG3, crearBloquePorDefecto } from './components/wizard-desgaste-g3';
import { Grafico3DesgasteProyeccion } from './components/grafico-3-proyeccion-desgaste';

import type { Grafico2DesgasteFiltros } from './types/grafico-2.types';
import type { Grafico3DesgasteRequest, WizardG3Block } from './types/grafico-3.types';

import { queryKeys } from '@/lib/query-keys';
import { useApiQuery } from '@/hooks/use-api-query';
import { desgasteApi } from '@/lib/api/desgaste.api';

// ─── Persistencia en sessionStorage ─────────────────────────────────────────

const STORAGE_KEYS = {
  GRAFICO2:      'desgaste_grafico2_config',
  GRAFICO3:      'desgaste_grafico3_config',
  WIZARD_BLOQUES: 'desgaste_wizard_g3_bloques',
};

function leerConfig<T>(key: string): T | null {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : null;
  } catch {
    return null;
  }
}

function guardarConfig(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ─── Página ──────────────────────────────────────────────────────────────────

export function DesgastePage() {
  // ── KPIs ──────────────────────────────────────────────────────────────────
  const { data: kpisData, isLoading: kpisLoading } = useApiQuery({
    queryKey: queryKeys.desgaste.kpis(),
    queryFn: () => desgasteApi.analytics.kpis(),
  });

  // ── Gráfico 2 ─────────────────────────────────────────────────────────────
  const [grafico2Config, setGrafico2Config] =
    useState<Grafico2DesgasteFiltros>(
      () => leerConfig<Grafico2DesgasteFiltros>(STORAGE_KEYS.GRAFICO2) ?? {},
    );
  const [grafico2ConfigAplicada, setGrafico2ConfigAplicada] =
    useState<Grafico2DesgasteFiltros>(
      () => leerConfig<Grafico2DesgasteFiltros>(STORAGE_KEYS.GRAFICO2) ?? {},
    );

  const { data: grafico2Data, isLoading: grafico2Loading } = useApiQuery({
    queryKey: ['desgaste', 'grafico-2', grafico2ConfigAplicada],
    queryFn: () => desgasteApi.analytics.grafico2(grafico2ConfigAplicada),
    enabled: Object.keys(grafico2ConfigAplicada).length > 0,
  });

  const handleAplicarGrafico2 = () => {
    setGrafico2ConfigAplicada(grafico2Config);
    guardarConfig(STORAGE_KEYS.GRAFICO2, grafico2Config);
  };

  // ── Gráfico 3 — Wizard G3 ─────────────────────────────────────────────────
  // El estado del wizard vive aquí para sobrevivir al desmonte del Sheet.
  // También se persiste en sessionStorage para sobrevivir a navegación.
  const [wizardBloques, setWizardBloques] = useState<WizardG3Block[]>(
    () => leerConfig<WizardG3Block[]>(STORAGE_KEYS.WIZARD_BLOQUES) ?? [crearBloquePorDefecto()],
  );
  const [wizardBloqueActivo, setWizardBloqueActivo] = useState(0);

  // Persistir bloques cada vez que cambian
  const handleSetWizardBloques: React.Dispatch<React.SetStateAction<WizardG3Block[]>> = (
    action,
  ) => {
    setWizardBloques((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      guardarConfig(STORAGE_KEYS.WIZARD_BLOQUES, next);
      return next;
    });
  };

  // Gráfico 3 — request aplicado
  const [grafico3Request, setGrafico3Request] =
    useState<Grafico3DesgasteRequest | null>(
      () => leerConfig<Grafico3DesgasteRequest>(STORAGE_KEYS.GRAFICO3),
    );

  const { data: grafico3Data, isLoading: grafico3Loading } = useApiQuery({
    queryKey: ['desgaste', 'grafico-3', grafico3Request],
    queryFn: () => desgasteApi.analytics.grafico3(grafico3Request!),
    enabled: grafico3Request !== null,
  });

  const handleAplicarGrafico3 = (request: Grafico3DesgasteRequest) => {
    setGrafico3Request(request);
    guardarConfig(STORAGE_KEYS.GRAFICO3, request);
  };

  // ── Resumen G3 para el ConfigSummaryChips ────────────────────────────────
  const g3Configs = grafico3Request?.configuraciones ?? [];
  const g3ResumenItems = g3Configs.length === 0
    ? [{ label: 'Estado', value: undefined }]
    : [
        {
          label: 'Configs',
          value: `${g3Configs.length} configuración${g3Configs.length === 1 ? '' : 'es'}`,
        },
        {
          label: 'Escenarios',
          value: (() => {
            const ids = [...new Set(g3Configs.flatMap((c) => c.escenarioIds ?? []))];
            return ids.length > 0 ? `${ids.length} escenario${ids.length === 1 ? '' : 's'}` : undefined;
          })(),
        },
        {
          label: 'Puntos',
          value: (() => {
            const puntos = [...new Set(g3Configs.flatMap((c) => c.puntosW ?? []))];
            return puntos.length > 0 ? puntos.join(' · ') : undefined;
          })(),
        },
      ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Análisis de Desgaste"
        subtitle="Indicadores y análisis de desgaste por tramo y escenario"
        breadcrumb={[{ label: 'Desgaste' }, { label: 'Análisis' }]}
      />

      <KpisDesgaste data={kpisData ?? null} isLoading={kpisLoading} />

      {/* ── Gráfico 2 — Crecimiento del tráfico ────────────────────────── */}
      <ChartCard
        eyebrow="Gráfico 1"
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
            data={grafico2Data ?? null}
            isLoading={grafico2Loading}
          />
        </div>
      </ChartCard>

      {/* ── Gráfico 3 — Análisis de desgaste por escenario ─────────────── */}
      <ChartCard
        eyebrow="Gráfico 2"
        title="Evolución del desgaste por escenario MTB"
        description="Desgaste medido (mm) en función del tráfico acumulado (Mt) según el escenario seleccionado."
        loading={grafico3Loading && !grafico3Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar análisis de desgaste"
          description="Compará la evolución del desgaste de distintos elementos, puntos de medición y escenarios de tráfico."
          triggerLabel="Configurar análisis"
          size="2xl"
          summary={<ConfigSummaryChips items={g3ResumenItems} />}
        >
          {(close) => (
            <WizardDesgasteG3
              bloques={wizardBloques}
              setBloques={handleSetWizardBloques}
              bloqueActivo={wizardBloqueActivo}
              setBloqueActivo={setWizardBloqueActivo}
              onConfigurar={(request) => {
                handleAplicarGrafico3(request);
                close();
              }}
            />
          )}
        </ConfigSheet>

        <div className="mt-4">
          {grafico3Request === null ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <p className="text-sm font-medium">Sin configuración aplicada</p>
              <p className="mt-1 text-xs">
                Usá el botón{' '}
                <span className="font-semibold">Configurar análisis</span> para
                definir los parámetros del gráfico.
              </p>
            </div>
          ) : (
            <Grafico3DesgasteProyeccion
              data={grafico3Data ?? null}
              isLoading={grafico3Loading}
            />
          )}
        </div>
      </ChartCard>
    </div>
  );
}