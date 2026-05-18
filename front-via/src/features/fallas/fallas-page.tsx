/**
 * Página de Análisis de Fallas (KPIs + 3 gráficos).
 *
 * Persistencia de filtros (por gráfico):
 *  - sessionStorage: se mantiene mientras la pestaña esté abierta.
 *  - Logout o cerrar pestaña: se borra → próxima carga muestra la BASE del backend.
 *
 * Flujo:
 *  1. Primera visita en la sesión → sessionStorage vacío → frontend
 *     envía {} al backend → backend devuelve config BASE → se muestra.
 *  2. Usuario aplica filtros → se guarda en sessionStorage.
 *  3. F5 (recargar) → frontend lee de sessionStorage → muestra última config.
 *  4. Logout → AuthContext limpia sessionStorage → siguiente login muestra BASE.
 */

import { useState, useEffect } from 'react';
import { Grafico1EvolucionTemporal } from './components/grafico-1-evolucion-temporal';
import { FiltrosGrafico1 } from './components/grafico-1-filtros';
import { Grafico2Distribucion } from './components/grafico-2-distribucion';
import { FiltrosGrafico2 } from './components/grafico-2-filtros';
import { Grafico3Velocidad } from './components/grafico-3-velocidad';
import { FiltrosGrafico3 } from './components/grafico-3-filtros';
import type { Grafico1Filtros } from './types/grafico-1.types';
import type { Grafico2Filtros } from './types/grafico-2.types';
import type { Grafico3Filtros } from './types/grafico-3.types';
import { queryKeys } from '@/lib/query-keys';
import { useApiQuery } from '@/hooks/use-api-query';
import { fallasApi } from '@/lib/api/fallas.api';
import { KpisFallas } from './components/kpis-fallas';

// ✅ Claves para sessionStorage (se borran al cerrar pestaña o logout)
const STORAGE_KEYS = {
  GRAFICO1: 'fallas_grafico1_config',
  GRAFICO2: 'fallas_grafico2_config',
  GRAFICO3: 'fallas_grafico3_config',
};

/**
 * Helper para leer sessionStorage de forma segura.
 * Si no hay nada o falla el JSON.parse, devuelve {}.
 */
function leerConfig<T>(key: string): T {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : ({} as T);
  } catch {
    return {} as T;
  }
}

export function FallasPage() {
  // ============================================================
  // KPIs
  // ============================================================
  const { data: kpisData, isLoading: kpisLoading } = useApiQuery({
    queryKey: queryKeys.fallas.kpis(),
    queryFn: () => fallasApi.analytics.kpis(),
  });

  // ============================================================
  // GRÁFICO 1
  // ============================================================
  // ✅ Tanto config (filtros visibles) como configAplicada (lo que se envía al backend)
  // arrancan desde sessionStorage. Esto soluciona el bug donde al recargar
  // los filtros mostraban tu última config pero el gráfico se calculaba con {}.
  const [grafico1Config, setGrafico1Config] = useState<Grafico1Filtros>(() =>
    leerConfig<Grafico1Filtros>(STORAGE_KEYS.GRAFICO1),
  );
  const [grafico1ConfigAplicada, setGrafico1ConfigAplicada] =
    useState<Grafico1Filtros>(() =>
      leerConfig<Grafico1Filtros>(STORAGE_KEYS.GRAFICO1),
    );

  // ============================================================
  // GRÁFICO 2
  // ============================================================
  const [grafico2Config, setGrafico2Config] = useState<Grafico2Filtros>(() =>
    leerConfig<Grafico2Filtros>(STORAGE_KEYS.GRAFICO2),
  );
  const [grafico2ConfigAplicada, setGrafico2ConfigAplicada] =
    useState<Grafico2Filtros>(() =>
      leerConfig<Grafico2Filtros>(STORAGE_KEYS.GRAFICO2),
    );

  // ============================================================
  // GRÁFICO 3
  // ============================================================
  const [grafico3Config, setGrafico3Config] = useState<Grafico3Filtros>(() =>
    leerConfig<Grafico3Filtros>(STORAGE_KEYS.GRAFICO3),
  );
  const [grafico3ConfigAplicada, setGrafico3ConfigAplicada] =
    useState<Grafico3Filtros>(() =>
      leerConfig<Grafico3Filtros>(STORAGE_KEYS.GRAFICO3),
    );

  // ============================================================
  // QUERIES
  // ============================================================
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

  // ============================================================
  // SINCRONIZAR CONFIG CON BACKEND (primera vez)
  // ============================================================
  // Cuando el backend responde con `configAplicada`, sincronizamos
  // los filtros visibles para que el usuario vea los defaults.
  // Solo aplica en la primera carga (cuando config está vacío).
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

  // ============================================================
  // HANDLERS APLICAR
  // ============================================================
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Análisis de Fallas</h1>
        <p className="text-sm text-muted-foreground">
          Indicadores y gráficos de fallas de riel y soldadura inox
        </p>
      </div>

      {/* KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Indicadores</h2>
        <KpisFallas data={kpisData || null} isLoading={kpisLoading} />
      </div>

      {/* Gráfico 1 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Gráfico 1 — Evolución Temporal por Tramo
        </h2>
        <FiltrosGrafico1
          config={grafico1Config}
          onChange={setGrafico1Config}
          onAplicar={handleAplicarGrafico1}
          isLoading={grafico1Loading}
        />
        <Grafico1EvolucionTemporal
          data={grafico1Data || null}
          isLoading={grafico1Loading}
        />
      </div>

      {/* Gráfico 2 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Gráfico 2 — Distribución por Categoría
        </h2>
        <FiltrosGrafico2
          config={grafico2Config}
          onChange={setGrafico2Config}
          onAplicar={handleAplicarGrafico2}
          isLoading={grafico2Loading}
        />
        <Grafico2Distribucion
          data={grafico2Data || null}
          isLoading={grafico2Loading}
        />
      </div>

      {/* Gráfico 3 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Gráfico 3 — Fallas por Velocidad
        </h2>
        <FiltrosGrafico3
          config={grafico3Config}
          onChange={setGrafico3Config}
          onAplicar={handleAplicarGrafico3}
          isLoading={grafico3Loading}
        />
        <Grafico3Velocidad
          data={grafico3Data || null}
          isLoading={grafico3Loading}
        />
      </div>
    </div>
  );
}

// ============================================================
// HELPERS LOCALES
// ============================================================

/**
 * Determina si una config está "vacía" (sin filtros aplicados).
 * Usado para sincronizar los filtros visibles con la BASE del backend
 * en la primera carga.
 */
function esConfigVacia(config: object): boolean {
  return Object.keys(config).length === 0;
}