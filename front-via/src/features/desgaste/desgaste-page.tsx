import { useState, useEffect } from 'react';
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

export function DesgastePage() {
  // ============================================================
  // KPIs
  // ============================================================
  const { data: kpisData, isLoading: kpisLoading } = useApiQuery({
    queryKey: queryKeys.desgaste.kpis(),
    queryFn: () => desgasteApi.analytics.kpis(),
  });

  // ============================================================
  // GRÁFICO 1
  // ============================================================
  const [grafico1Config, setGrafico1Config] = useState<Grafico1DesgasteFiltros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO1),
  );
  const [grafico1ConfigAplicada, setGrafico1ConfigAplicada] =
    useState<Grafico1DesgasteFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO1));

  const { data: grafico1Data, isLoading: grafico1Loading } = useApiQuery({
    queryKey: ['desgaste', 'grafico-1', grafico1ConfigAplicada],
    queryFn: () => desgasteApi.analytics.grafico1(grafico1ConfigAplicada),
    enabled: Object.keys(grafico1ConfigAplicada).length > 0,
  });

  useEffect(() => {
    if (grafico1Data?.configAplicada && esConfigVacia(grafico1Config)) {
      setGrafico1Config(grafico1Data.configAplicada);
      setGrafico1ConfigAplicada(grafico1Data.configAplicada);
      sessionStorage.setItem(STORAGE_KEYS.GRAFICO1, JSON.stringify(grafico1Data.configAplicada));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico1Data]);

  const handleAplicarGrafico1 = (config: Grafico1DesgasteFiltros) => {
    setGrafico1ConfigAplicada(config);
    setGrafico1Config(config);
    sessionStorage.setItem(STORAGE_KEYS.GRAFICO1, JSON.stringify(config));
  };

  // ============================================================
  // GRÁFICO 2
  // ============================================================
  const [grafico2Config, setGrafico2Config] = useState<Grafico2DesgasteFiltros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO2),
  );
  const [grafico2ConfigAplicada, setGrafico2ConfigAplicada] =
    useState<Grafico2DesgasteFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO2));

  const { data: grafico2Data, isLoading: grafico2Loading } = useApiQuery({
    queryKey: ['desgaste', 'grafico-2', grafico2ConfigAplicada],
    queryFn: () => desgasteApi.analytics.grafico2(grafico2ConfigAplicada),
    enabled: Object.keys(grafico2ConfigAplicada).length > 0,
  });

  useEffect(() => {
    if (grafico2Data?.configAplicada && esConfigVacia(grafico2Config)) {
      setGrafico2Config(grafico2Data.configAplicada);
      setGrafico2ConfigAplicada(grafico2Data.configAplicada);
      sessionStorage.setItem(STORAGE_KEYS.GRAFICO2, JSON.stringify(grafico2Data.configAplicada));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico2Data]);

  const handleAplicarGrafico2 = () => {
    setGrafico2ConfigAplicada(grafico2Config);
    sessionStorage.setItem(STORAGE_KEYS.GRAFICO2, JSON.stringify(grafico2Config));
  };

  // ============================================================
  // GRÁFICO 3
  // ============================================================
  const [grafico3Config, setGrafico3Config] = useState<Grafico3DesgasteFiltros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO3),
  );
  const [grafico3ConfigAplicada, setGrafico3ConfigAplicada] =
    useState<Grafico3DesgasteFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO3));

  const { data: grafico3Data, isLoading: grafico3Loading } = useApiQuery({
    queryKey: ['desgaste', 'grafico-3', grafico3ConfigAplicada],
    queryFn: () => desgasteApi.analytics.grafico3(grafico3ConfigAplicada),
    enabled: Object.keys(grafico3ConfigAplicada).length > 0,
  });

  useEffect(() => {
    if (grafico3Data?.configAplicada && esConfigVacia(grafico3Config)) {
      setGrafico3Config(grafico3Data.configAplicada);
      setGrafico3ConfigAplicada(grafico3Data.configAplicada);
      sessionStorage.setItem(STORAGE_KEYS.GRAFICO3, JSON.stringify(grafico3Data.configAplicada));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico3Data]);

  const handleAplicarGrafico3 = (config: Grafico3DesgasteFiltros) => {
    setGrafico3ConfigAplicada(config);
    setGrafico3Config(config);
    sessionStorage.setItem(STORAGE_KEYS.GRAFICO3, JSON.stringify(config));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Análisis de Desgaste</h1>
        <p className="text-sm text-muted-foreground">
          Indicadores y gráficos de desgaste
        </p>
      </div>

      {/* KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Indicadores</h2>
        <KpisDesgaste data={kpisData || null} isLoading={kpisLoading} />
      </div>

      {/* Gráfico 1 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Gráfico 1 — Evolución del Desgaste Real
        </h2>
        <WizardDesgaste onConfigurar={handleAplicarGrafico1} />
        <Grafico1DesgasteEvolucionReal
          data={grafico1Data || null}
          isLoading={grafico1Loading}
        />
      </div>

      {/* Gráfico 2 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Gráfico 2 — Crecimiento del Tráfico por Escenario
        </h2>
        <FiltrosGrafico2Desgaste
          config={grafico2Config}
          onChange={setGrafico2Config}
          onAplicar={handleAplicarGrafico2}
          isLoading={grafico2Loading}
        />
        <Grafico2DesgasteCrecimientoTrafico
          data={grafico2Data || null}
          isLoading={grafico2Loading}
        />
      </div>

      {/* Gráfico 3 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Gráfico 3 — Proyección de Desgaste por Escenario
        </h2>
        <WizardDesgasteG3 onConfigurar={handleAplicarGrafico3} />
        <Grafico3DesgasteProyeccion
          data={grafico3Data || null}
          isLoading={grafico3Loading}
        />
      </div>
    </div>
  );
}

function esConfigVacia(config: object): boolean {
  return Object.keys(config).length === 0;
}