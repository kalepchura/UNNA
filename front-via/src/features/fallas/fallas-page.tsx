// frontend/src/features/fallas/fallas-page.tsx

import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { ChartCard } from '@/components/shared/chart-card';
import { ConfigSheet, ConfigSummaryChips } from '@/components/shared/config-sheet';

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

import {
  LABEL_NIVEL,
  LABEL_VIA_FALLAS,
} from '@/lib/types/enums/fallas-graficos.enum';
import { LABEL_CATEGORIA_G2, TipoFallaFiltro } from '@/lib/types/enums/fallas.enum';
import type { CategoriaG2 } from '@/lib/types/enums/fallas.enum';

import { queryKeys } from '@/lib/query-keys';
import { useApiQuery } from '@/hooks/use-api-query';
import { fallasApi } from '@/lib/api/fallas.api';

// ============================================================
// STORAGE (sessionStorage — la config persiste durante la sesión)
// ============================================================

const STORAGE_KEYS = {
  GRAFICO1: 'fallas_grafico1_config',
  GRAFICO2: 'fallas_grafico2_config',
  GRAFICO3: 'fallas_grafico3_config',
};

function leerConfig<T extends object>(key: string): T {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : ({} as T);
  } catch {
    return {} as T;
  }
}

function guardarConfig<T extends object>(key: string, config: T): void {
  sessionStorage.setItem(key, JSON.stringify(config));
}

function esConfigVacia(config: object): boolean {
  return Object.keys(config).length === 0;
}

// ============================================================
// HELPERS DE RESUMEN (chips de la config aplicada)
// ============================================================

function chipsG1(c: Grafico1Filtros) {
  return [
    { label: 'Granularidad', value: c.granularidad },
    {
      label: 'Año',
      value:
        c.granularidad === 'MENSUAL'
          ? c.anio
          : c.anioInicio && c.anioFin
            ? `${c.anioInicio}–${c.anioFin}`
            : undefined,
    },
    { label: 'Nivel', value: c.nivel ? LABEL_NIVEL[c.nivel] : undefined },
    { label: 'Vía', value: c.tipoVia ? LABEL_VIA_FALLAS[c.tipoVia] : undefined },
    {
      label: 'Tipo falla',
      value: c.tipoFalla
        ? c.tipoFalla === TipoFallaFiltro.AMBAS
          ? 'Ambas'
          : c.tipoFalla
        : undefined,
    },
    {
      label: 'Elementos',
      value: c.elementoIds?.length ? `${c.elementoIds.length} sel.` : undefined,
    },
  ];
}

function chipsG2(c: Grafico2Filtros) {
  return [
    {
      label: 'Rango',
      value: c.fechaDesde && c.fechaHasta ? `${c.fechaDesde} → ${c.fechaHasta}` : undefined,
    },
    { label: 'Nivel', value: c.nivel ? LABEL_NIVEL[c.nivel] : undefined },
    { label: 'Vía', value: c.tipoVia ? LABEL_VIA_FALLAS[c.tipoVia] : undefined },
    { label: 'Tipo falla', value: c.tipoFalla },
    {
      label: 'Categoría',
      value: c.categoria ? LABEL_CATEGORIA_G2[c.categoria as CategoriaG2] : undefined,
    },
    { label: 'Modo', value: c.modo },
    {
      label: 'Elementos',
      value: c.elementoIds?.length ? `${c.elementoIds.length} sel.` : undefined,
    },
  ];
}

function chipsG3(c: Grafico3Filtros) {
  return [
    {
      label: 'Rango',
      value: c.fechaDesde && c.fechaHasta ? `${c.fechaDesde} → ${c.fechaHasta}` : undefined,
    },
    { label: 'Nivel', value: c.nivel ? LABEL_NIVEL[c.nivel] : undefined },
    { label: 'Vía', value: c.tipoVia ? LABEL_VIA_FALLAS[c.tipoVia] : undefined },
    { label: 'Tipo falla', value: c.tipoFalla },
    { label: 'Apilar', value: c.apilarPorTipo ? 'Sí' : undefined },
    {
      label: 'Elementos',
      value: c.elementoIds?.length ? `${c.elementoIds.length} sel.` : undefined,
    },
  ];
}

// ============================================================
// COMPONENTE
// ============================================================

export function FallasPage() {
  // ── KPIs ──────────────────────────────────────────────────
  const { data: kpisData, isLoading: kpisLoading } = useApiQuery({
    queryKey: queryKeys.fallas.kpis(),
    queryFn: () => fallasApi.analytics.kpis(),
  });

  // ── Estado: una config por gráfico ────────────────────────
  // `*Config` = lo que el usuario está editando (en el panel).
  // `*Aplicada` = lo que se envió al backend (lo que se grafica).
  const [g1Config, setG1Config] = useState<Grafico1Filtros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO1),
  );
  const [g1Aplicada, setG1Aplicada] = useState<Grafico1Filtros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO1),
  );

  const [g2Config, setG2Config] = useState<Grafico2Filtros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO2),
  );
  const [g2Aplicada, setG2Aplicada] = useState<Grafico2Filtros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO2),
  );

  const [g3Config, setG3Config] = useState<Grafico3Filtros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO3),
  );
  const [g3Aplicada, setG3Aplicada] = useState<Grafico3Filtros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO3),
  );

  // ── Queries ────────────────────────────────────────────────
  // Solo se ejecuta si hay config aplicada NO vacía. Así evitamos
  // mandar `{}` al backend (que no respondería nada útil).
  const g1Enabled = !esConfigVacia(g1Aplicada);
  const g2Enabled = !esConfigVacia(g2Aplicada);
  const g3Enabled = !esConfigVacia(g3Aplicada);

  const { data: g1Data, isLoading: g1Loading } = useApiQuery({
    queryKey: queryKeys.fallas.grafico1(g1Aplicada),
    queryFn: () => fallasApi.analytics.grafico1(g1Aplicada),
    enabled: g1Enabled,
  });

  const { data: g2Data, isLoading: g2Loading } = useApiQuery({
    queryKey: queryKeys.fallas.grafico2(g2Aplicada),
    queryFn: () => fallasApi.analytics.grafico2(g2Aplicada),
    enabled: g2Enabled,
  });

  const { data: g3Data, isLoading: g3Loading } = useApiQuery({
    queryKey: queryKeys.fallas.grafico3(g3Aplicada),
    queryFn: () => fallasApi.analytics.grafico3(g3Aplicada),
    enabled: g3Enabled,
  });

  // ── Handlers ───────────────────────────────────────────────
  const aplicarG1 = () => {
    setG1Aplicada(g1Config);
    guardarConfig(STORAGE_KEYS.GRAFICO1, g1Config);
  };
  const aplicarG2 = () => {
    setG2Aplicada(g2Config);
    guardarConfig(STORAGE_KEYS.GRAFICO2, g2Config);
  };
  const aplicarG3 = () => {
    setG3Aplicada(g3Config);
    guardarConfig(STORAGE_KEYS.GRAFICO3, g3Config);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Análisis de Fallas"
        subtitle="Indicadores y gráficos de fallas de riel y soldadura inox"
        breadcrumb={[{ label: 'Fallas' }, { label: 'Análisis' }]}
      />

      <KpisFallas data={kpisData ?? null} isLoading={kpisLoading} />

      {/* ── GRÁFICO 1 ────────────────────────────────────────── */}
      <ChartCard
        eyebrow="Gráfico 1"
        title="Evolución temporal"
        description="Cantidad de fallas a lo largo del tiempo, por elemento del nivel."
        loading={g1Loading && g1Enabled && !g1Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar evolución temporal"
          description="Define granularidad, rango temporal, nivel de análisis y elementos."
          triggerLabel={g1Enabled ? 'Editar configuración' : 'Configurar gráfico'}
          size="xl"
          summary={
            g1Enabled ? <ConfigSummaryChips items={chipsG1(g1Aplicada)} /> : undefined
          }
        >
          {(close) => (
            <FiltrosGrafico1
              config={g1Config}
              onChange={setG1Config}
              onAplicar={() => {
                aplicarG1();
                close();
              }}
              isLoading={g1Loading}
            />
          )}
        </ConfigSheet>

        <div className="mt-4">
          {!g1Enabled ? (
            <div className="flex items-center justify-center h-[350px] text-sm text-muted-foreground italic">
              Configura los filtros y pulsa Aplicar para ver el gráfico.
            </div>
          ) : (
            <Grafico1EvolucionTemporal
              data={g1Data ?? null}
              config={g1Aplicada}
              isLoading={g1Loading}
            />
          )}
        </div>
      </ChartCard>

      {/* ── GRÁFICO 2 ────────────────────────────────────────── */}
      <ChartCard
        eyebrow="Gráfico 2"
        title="Distribución por categoría"
        description="Reparto de fallas por una característica (con dos modos de visualización)."
        loading={g2Loading && g2Enabled && !g2Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar distribución"
          description="Define rango temporal, nivel, categoría y modo de visualización."
          triggerLabel={g2Enabled ? 'Editar configuración' : 'Configurar gráfico'}
          size="xl"
          summary={
            g2Enabled ? <ConfigSummaryChips items={chipsG2(g2Aplicada)} /> : undefined
          }
        >
          {(close) => (
            <FiltrosGrafico2
              config={g2Config}
              onChange={setG2Config}
              onAplicar={() => {
                aplicarG2();
                close();
              }}
              isLoading={g2Loading}
            />
          )}
        </ConfigSheet>

        <div className="mt-4">
          {!g2Enabled ? (
            <div className="flex items-center justify-center h-[400px] text-sm text-muted-foreground italic">
              Configura los filtros y pulsa Aplicar para ver el gráfico.
            </div>
          ) : (
            <Grafico2Distribucion
              data={g2Data ?? null}
              config={g2Aplicada}
              isLoading={g2Loading}
            />
          )}
        </div>
      </ChartCard>

      {/* ── GRÁFICO 3 ────────────────────────────────────────── */}
      <ChartCard
        eyebrow="Gráfico 3"
        title="Fallas por velocidad"
        description="Reparto de fallas por velocidad operacional."
        loading={g3Loading && g3Enabled && !g3Data}
        minHeight={360}
      >
        <ConfigSheet
          title="Configurar fallas por velocidad"
          description="Define rango, nivel y modo de visualización (apilado o total)."
          triggerLabel={g3Enabled ? 'Editar configuración' : 'Configurar gráfico'}
          size="xl"
          summary={
            g3Enabled ? <ConfigSummaryChips items={chipsG3(g3Aplicada)} /> : undefined
          }
        >
          {(close) => (
            <FiltrosGrafico3
              config={g3Config}
              onChange={setG3Config}
              onAplicar={() => {
                aplicarG3();
                close();
              }}
              isLoading={g3Loading}
            />
          )}
        </ConfigSheet>

        <div className="mt-4">
          {!g3Enabled ? (
            <div className="flex items-center justify-center h-[350px] text-sm text-muted-foreground italic">
              Configura los filtros y pulsa Aplicar para ver el gráfico.
            </div>
          ) : (
            <Grafico3Velocidad
              data={g3Data ?? null}
              config={g3Aplicada}
              isLoading={g3Loading}
            />
          )}
        </div>
      </ChartCard>
    </div>
  );
}