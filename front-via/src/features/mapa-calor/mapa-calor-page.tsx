import { useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { mapaCalorApi } from '@/lib/api/mapa-calor.api';
import { FiltrosTemperatura } from './filtros-temperatura';
import { FiltrosDesgasteGeneral } from './filtros-desgaste-general';
import { FiltrosDesgasteIndice } from './filtros-desgaste-indice';
import { FiltrosFallas } from './filtros-fallas';
import { MapaCalorSVG } from './mapa-calor-svg';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  MapaTemperaturaFiltros,
  MapaDesgasteGeneralFiltros,
  MapaDesgasteIndiceFiltros,
  MapaFallasFiltros,
} from './types/mapa-calor.types';

// Helpers de fecha (defaults)
const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const inicioAnioISO = () => `${new Date().getFullYear()}-01-01`;
const hace12MesesISO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 12);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Claves de sessionStorage
const STORAGE_KEYS = {
  TEMPERATURA: 'mapa_calor_temperatura_config',
  DESGASTE_GENERAL: 'mapa_calor_desgaste_general_config',
  DESGASTE_INDICE: 'mapa_calor_desgaste_indice_config',
  FALLAS: 'mapa_calor_fallas_config',
};

// Helpers para leer/escribir sessionStorage
function leerDeStorage<T>(key: string, defaults: T): T {
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
  } catch {
    // ignorar errores de parseo
  }
  return defaults;
}

function guardarEnStorage(key: string, valor: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(valor));
  } catch {
    // ignorar errores de storage
  }
}

// Defaults fijos de cada capa
const DEFAULTS_TEMPERATURA: MapaTemperaturaFiltros = {
  fechaDesde: inicioAnioISO(),
  fechaHasta: hoyISO(),
  tipoValor: 'PROMEDIO',
};

const DEFAULTS_DESGASTE_GENERAL: MapaDesgasteGeneralFiltros = {
  fechaCorte: hoyISO(),
  puntoW: 'W1',
};

const DEFAULTS_DESGASTE_INDICE: MapaDesgasteIndiceFiltros = {
  fechaCorte: hoyISO(),
  puntoWA: 'W1',
  puntoWB: 'W2',
};

const DEFAULTS_FALLAS: MapaFallasFiltros = {
  fechaDesde: hace12MesesISO(),
  fechaHasta: hoyISO(),
  segmentacion: 'TRAMO',
};

export function MapaCalorPage() {
  const [capaActiva, setCapaActiva] = useState<string>('temperatura');

  // Esquema base (cacheado 5 min en backend)
  const { data: esquema, isLoading: esquemaLoading } = useApiQuery({
    queryKey: ['mapa-calor', 'esquema-base'],
    queryFn: mapaCalorApi.esquemaBase,
    staleTime: 5 * 60 * 1000,
  });

  // ==========================================================
  // Estados de filtros (editables) → se inicializan desde storage o defaults
  // Estados de filtros aplicados → ídem
  // ==========================================================

  // TEMPERATURA
  const [fTemperatura, setFTemperatura] = useState<MapaTemperaturaFiltros>(
    () => leerDeStorage(STORAGE_KEYS.TEMPERATURA, DEFAULTS_TEMPERATURA)
  );
  const [fTemperaturaAplicados, setFTemperaturaAplicados] = useState<MapaTemperaturaFiltros>(
    () => leerDeStorage(STORAGE_KEYS.TEMPERATURA, DEFAULTS_TEMPERATURA)
  );

  const { data: dataTemperatura, isLoading: loadingTemperatura } = useApiQuery({
    queryKey: ['mapa-calor', 'temperatura', fTemperaturaAplicados],
    queryFn: () => mapaCalorApi.temperatura(fTemperaturaAplicados),
    enabled: capaActiva === 'temperatura',
  });

  // DESGASTE GENERAL
  const [fDesgasteGeneral, setFDesgasteGeneral] = useState<MapaDesgasteGeneralFiltros>(
    () => leerDeStorage(STORAGE_KEYS.DESGASTE_GENERAL, DEFAULTS_DESGASTE_GENERAL)
  );
  const [fDesgasteGeneralAplicados, setFDesgasteGeneralAplicados] = useState<MapaDesgasteGeneralFiltros>(
    () => leerDeStorage(STORAGE_KEYS.DESGASTE_GENERAL, DEFAULTS_DESGASTE_GENERAL)
  );

  const { data: dataDesgasteGeneral, isLoading: loadingDesgasteGeneral } = useApiQuery({
    queryKey: ['mapa-calor', 'desgaste-general', fDesgasteGeneralAplicados],
    queryFn: () => mapaCalorApi.desgasteGeneral(fDesgasteGeneralAplicados),
    enabled: capaActiva === 'desgaste-general',
  });

  // DESGASTE ÍNDICE
  const [fDesgasteIndice, setFDesgasteIndice] = useState<MapaDesgasteIndiceFiltros>(
    () => leerDeStorage(STORAGE_KEYS.DESGASTE_INDICE, DEFAULTS_DESGASTE_INDICE)
  );
  const [fDesgasteIndiceAplicados, setFDesgasteIndiceAplicados] = useState<MapaDesgasteIndiceFiltros>(
    () => leerDeStorage(STORAGE_KEYS.DESGASTE_INDICE, DEFAULTS_DESGASTE_INDICE)
  );

  const { data: dataDesgasteIndice, isLoading: loadingDesgasteIndice } = useApiQuery({
    queryKey: ['mapa-calor', 'desgaste-indice', fDesgasteIndiceAplicados],
    queryFn: () => mapaCalorApi.desgasteIndice(fDesgasteIndiceAplicados),
    enabled: capaActiva === 'desgaste-indice',
  });

  // FALLAS
  const [fFallas, setFFallas] = useState<MapaFallasFiltros>(
    () => leerDeStorage(STORAGE_KEYS.FALLAS, DEFAULTS_FALLAS)
  );
  const [fFallasAplicados, setFFallasAplicados] = useState<MapaFallasFiltros>(
    () => leerDeStorage(STORAGE_KEYS.FALLAS, DEFAULTS_FALLAS)
  );

  const { data: dataFallas, isLoading: loadingFallas } = useApiQuery({
    queryKey: ['mapa-calor', 'fallas', fFallasAplicados],
    queryFn: () => mapaCalorApi.fallas(fFallasAplicados),
    enabled: capaActiva === 'fallas',
  });

  // ==========================================================
  // Handlers de aplicar: copian estado editable → aplicado y persisten
  // ==========================================================
  const handleAplicarTemperatura = () => {
    setFTemperaturaAplicados({ ...fTemperatura });
    guardarEnStorage(STORAGE_KEYS.TEMPERATURA, fTemperatura);
  };

  const handleAplicarDesgasteGeneral = () => {
    setFDesgasteGeneralAplicados({ ...fDesgasteGeneral });
    guardarEnStorage(STORAGE_KEYS.DESGASTE_GENERAL, fDesgasteGeneral);
  };

  const handleAplicarDesgasteIndice = () => {
    setFDesgasteIndiceAplicados({ ...fDesgasteIndice });
    guardarEnStorage(STORAGE_KEYS.DESGASTE_INDICE, fDesgasteIndice);
  };

  const handleAplicarFallas = () => {
    setFFallasAplicados({ ...fFallas });
    guardarEnStorage(STORAGE_KEYS.FALLAS, fFallas);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mapa de Calor</h1>
        <p className="text-sm text-muted-foreground">
          Visualización geográfica de temperatura, desgaste y fallas
        </p>
      </div>

      <Tabs value={capaActiva} onValueChange={setCapaActiva}>
        <TabsList>
          <TabsTrigger value="temperatura">Temperatura</TabsTrigger>
          <TabsTrigger value="desgaste-general">Desgaste General</TabsTrigger>
          <TabsTrigger value="desgaste-indice">Desgaste Índice</TabsTrigger>
          <TabsTrigger value="fallas">Fallas</TabsTrigger>
        </TabsList>

        {/* Capa Temperatura */}
        <TabsContent value="temperatura" className="space-y-4">
          <FiltrosTemperatura
            filtros={fTemperatura}
            onChange={setFTemperatura}
            onAplicar={handleAplicarTemperatura}
            isLoading={loadingTemperatura}
          />
          <MapaCalorSVG
            esquema={esquema}
            capa="temperatura"
            datos={dataTemperatura}
            isLoading={esquemaLoading || loadingTemperatura}
          />
        </TabsContent>

        {/* Capa Desgaste General */}
        <TabsContent value="desgaste-general" className="space-y-4">
          <FiltrosDesgasteGeneral
            filtros={fDesgasteGeneral}
            onChange={setFDesgasteGeneral}
            onAplicar={handleAplicarDesgasteGeneral}
            isLoading={loadingDesgasteGeneral}
          />
          <MapaCalorSVG
            esquema={esquema}
            capa="desgaste-general"
            datos={dataDesgasteGeneral}
            isLoading={esquemaLoading || loadingDesgasteGeneral}
          />
        </TabsContent>

        {/* Capa Desgaste Índice */}
        <TabsContent value="desgaste-indice" className="space-y-4">
          <FiltrosDesgasteIndice
            filtros={fDesgasteIndice}
            onChange={setFDesgasteIndice}
            onAplicar={handleAplicarDesgasteIndice}
            isLoading={loadingDesgasteIndice}
          />
          <MapaCalorSVG
            esquema={esquema}
            capa="desgaste-indice"
            datos={dataDesgasteIndice}
            isLoading={esquemaLoading || loadingDesgasteIndice}
          />
        </TabsContent>

        {/* Capa Fallas */}
        <TabsContent value="fallas" className="space-y-4">
          <FiltrosFallas
            filtros={fFallas}
            onChange={setFFallas}
            onAplicar={handleAplicarFallas}
            isLoading={loadingFallas}
          />
          <MapaCalorSVG
            esquema={esquema}
            capa="fallas"
            datos={dataFallas}
            isLoading={esquemaLoading || loadingFallas}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}