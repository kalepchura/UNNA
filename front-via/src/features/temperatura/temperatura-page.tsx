import { useState, useEffect } from 'react';
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
  // ============================================================
  // KPIs
  // ============================================================
  const { data: kpisData, isLoading: kpisLoading } = useApiQuery({
    queryKey: queryKeys.temperatura.kpis(),
    queryFn: () => temperaturaApi.analytics.kpis(),
  });

  // ============================================================
  // GRÁFICO 1
  // ============================================================
  const [grafico1Config, setGrafico1Config] = useState<Grafico1TempFiltros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO1),
  );
  const [grafico1ConfigAplicada, setGrafico1ConfigAplicada] =
    useState<Grafico1TempFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO1));

  const { data: grafico1Data, isLoading: grafico1Loading } = useApiQuery({
    queryKey: queryKeys.temperatura.grafico1(grafico1ConfigAplicada),
    queryFn: () => temperaturaApi.analytics.grafico1(grafico1ConfigAplicada),
  });

  useEffect(() => {
    if (grafico1Data?.configAplicada && esConfigVacia(grafico1Config)) {
      setGrafico1Config(grafico1Data.configAplicada);
      setGrafico1ConfigAplicada(grafico1Data.configAplicada);
      sessionStorage.setItem(STORAGE_KEYS.GRAFICO1, JSON.stringify(grafico1Data.configAplicada));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico1Data]);

  const handleAplicarGrafico1 = () => {
    setGrafico1ConfigAplicada(grafico1Config);
    sessionStorage.setItem(STORAGE_KEYS.GRAFICO1, JSON.stringify(grafico1Config));
  };

  // ============================================================
  // GRÁFICO 2
  // ============================================================
  const [grafico2Config, setGrafico2Config] = useState<Grafico2TempFiltros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO2),
  );
  const [grafico2ConfigAplicada, setGrafico2ConfigAplicada] =
    useState<Grafico2TempFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO2));

  const { data: grafico2Data, isLoading: grafico2Loading } = useApiQuery({
    queryKey: queryKeys.temperatura.grafico2(grafico2ConfigAplicada),
    queryFn: () => temperaturaApi.analytics.grafico2(grafico2ConfigAplicada),
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
  const [grafico3Config, setGrafico3Config] = useState<Grafico3TempFiltros>(() =>
    leerConfig(STORAGE_KEYS.GRAFICO3),
  );
  const [grafico3ConfigAplicada, setGrafico3ConfigAplicada] =
    useState<Grafico3TempFiltros>(() => leerConfig(STORAGE_KEYS.GRAFICO3));

  const { data: grafico3Data, isLoading: grafico3Loading } = useApiQuery({
    queryKey: queryKeys.temperatura.grafico3(grafico3ConfigAplicada),
    queryFn: () => temperaturaApi.analytics.grafico3(grafico3ConfigAplicada),
  });

  useEffect(() => {
    if (grafico3Data?.configAplicada && esConfigVacia(grafico3Config)) {
      setGrafico3Config(grafico3Data.configAplicada);
      setGrafico3ConfigAplicada(grafico3Data.configAplicada);
      sessionStorage.setItem(STORAGE_KEYS.GRAFICO3, JSON.stringify(grafico3Data.configAplicada));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grafico3Data]);

  const handleAplicarGrafico3 = () => {
    setGrafico3ConfigAplicada(grafico3Config);
    sessionStorage.setItem(STORAGE_KEYS.GRAFICO3, JSON.stringify(grafico3Config));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Análisis de Temperatura</h1>
        <p className="text-sm text-muted-foreground">
          Indicadores y gráficos de temperatura
        </p>
      </div>

      {/* KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Indicadores</h2>
        <KpisTemperatura data={kpisData || null} isLoading={kpisLoading} />
      </div>

      {/* Gráfico 1 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Gráfico 1 — Evolución Temporal por Tramo
        </h2>
        <FiltrosGrafico1Temp
          config={grafico1Config}
          onChange={setGrafico1Config}
          onAplicar={handleAplicarGrafico1}
          isLoading={grafico1Loading}
        />
        <Grafico1TempSerieTemporal
          data={grafico1Data || null}
          isLoading={grafico1Loading}
        />
      </div>

      {/* Gráfico 2 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Gráfico 2 — Comparación entre Tramos
        </h2>
        <FiltrosGrafico2Temp
          config={grafico2Config}
          onChange={setGrafico2Config}
          onAplicar={handleAplicarGrafico2}
          isLoading={grafico2Loading}
        />
        <Grafico2TempComparacion
          data={grafico2Data || null}
          isLoading={grafico2Loading}
        />
      </div>

      {/* Gráfico 3 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Gráfico 3 — Patrón Horario
        </h2>
        <FiltrosGrafico3Temp
          config={grafico3Config}
          onChange={setGrafico3Config}
          onAplicar={handleAplicarGrafico3}
          isLoading={grafico3Loading}
        />
        <Grafico3TempPatronHorario
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