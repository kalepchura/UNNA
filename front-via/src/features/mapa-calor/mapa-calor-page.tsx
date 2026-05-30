/**
 * mapa-calor-page.tsx
 *
 * CAMBIOS respecto a la versión anterior:
 * - Desgaste general e índice: se añade <LeyendaViasDesgaste> debajo de
 *   la leyenda de semáforo para identificar los 4 carriles por color.
 * - Fallas: se añade <LeyendaViasFallas segmentacion={...}> que solo
 *   aparece cuando la segmentación NO es TRAMO (CAMBIAVIA, CURVA_*).
 */

import { useMemo, useState } from 'react';

import { useApiQuery } from '@/hooks/use-api-query';
import { mapaCalorApi } from '@/lib/api/mapa-calor.api';

import { PageHeader } from '@/components/layout/page-header';
import {
  SectionTabs,
  SectionTabPanel,
  type SectionTabItem,
} from '@/components/shared/section-tabs';

import { FiltrosTemperatura } from './filtros-temperatura';
import { FiltrosDesgasteGeneral } from './filtros-desgaste-general';
import { FiltrosDesgasteIndice } from './filtros-desgaste-indice';
import { FiltrosFallas } from './filtros-fallas';

import { EsquemaBase } from './components/esquema-base';
import { CapaTemperatura } from './components/capa-temperatura';
import { CapaFallas, LeyendaViasFallas } from './components/capa-fallas';
import {
  CapaDesgasteGeneral,
  LeyendaViasDesgaste,
} from './components/capa-desgaste-general';
import { CapaDesgasteIndice } from './components/capa-desgaste-indice';
import { Leyenda } from './components/leyenda';
import {
  LEYENDA_TEMPERATURA,
  LEYENDA_DESGASTE_GENERAL,
  LEYENDA_DESGASTE_INDICE,
  LEYENDA_FALLAS,
} from './components/leyenda';
import { ListaDetalle } from './components/lista-detalle';

import {
  cargaFallas,
  cargaDesgasteGeneral,
  cargaDesgasteIndice,
} from './components/utils-carga-tramos';

import type {
  MapaTemperaturaFiltros,
  MapaDesgasteGeneralFiltros,
  MapaDesgasteIndiceFiltros,
  MapaFallasFiltros,
} from './types/mapa-calor.types';

const ALTO_PANEL = 720;
const GRID_LG    = '5fr 7fr';

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

const STORAGE_KEYS = {
  TEMPERATURA:      'mapa_calor_temperatura_config',
  DESGASTE_GENERAL: 'mapa_calor_desgaste_general_config',
  DESGASTE_INDICE:  'mapa_calor_desgaste_indice_config',
  FALLAS:           'mapa_calor_fallas_config',
};

function leerDeStorage<T>(key: string, defaults: T): T {
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
  } catch { /* ignore */ }
  return defaults;
}

function guardarEnStorage(key: string, valor: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(valor));
  } catch { /* ignore */ }
}

const DEFAULTS_TEMPERATURA: MapaTemperaturaFiltros = {
  fechaDesde: inicioAnioISO(),
  fechaHasta: hoyISO(),
  tipoValor:  'PROMEDIO',
};
const DEFAULTS_DESGASTE_GENERAL: MapaDesgasteGeneralFiltros = {
  fechaCorte: hoyISO(),
  puntoW:     'W1',
};
const DEFAULTS_DESGASTE_INDICE: MapaDesgasteIndiceFiltros = {
  fechaCorte: hoyISO(),
  puntoWA:    'W1',
  puntoWB:    'W2',
};
const DEFAULTS_FALLAS: MapaFallasFiltros = {
  fechaDesde:   hace12MesesISO(),
  fechaHasta:   hoyISO(),
  segmentacion: 'TRAMO',
};

const TABS: SectionTabItem[] = [
  { value: 'temperatura',      label: 'Temperatura'      },
  { value: 'desgaste-general', label: 'Desgaste general' },
  { value: 'desgaste-indice',  label: 'Desgaste índice'  },
  { value: 'fallas',           label: 'Fallas'           },
];

export function MapaCalorPage() {
  const [capaActiva, setCapaActiva] = useState<string>('temperatura');

  const { data: esquema, isLoading: esquemaLoading } = useApiQuery({
    queryKey: ['mapa-calor', 'esquema-base'],
    queryFn:  mapaCalorApi.esquemaBase,
    staleTime: 5 * 60 * 1000,
  });

  // ── Temperatura ──────────────────────────────────────────────────────────
  const [fTemperatura, setFTemperatura] = useState<MapaTemperaturaFiltros>(
    () => leerDeStorage(STORAGE_KEYS.TEMPERATURA, DEFAULTS_TEMPERATURA),
  );
  const [fTemperaturaAplicados, setFTemperaturaAplicados] =
    useState<MapaTemperaturaFiltros>(() =>
      leerDeStorage(STORAGE_KEYS.TEMPERATURA, DEFAULTS_TEMPERATURA),
    );
  const { data: dataTemperatura, isLoading: loadingTemperatura } = useApiQuery({
    queryKey: ['mapa-calor', 'temperatura', fTemperaturaAplicados],
    queryFn:  () => mapaCalorApi.temperatura(fTemperaturaAplicados),
    enabled:  capaActiva === 'temperatura',
  });

  // ── Desgaste general ─────────────────────────────────────────────────────
  const [fDesgasteGeneral, setFDesgasteGeneral] =
    useState<MapaDesgasteGeneralFiltros>(() =>
      leerDeStorage(STORAGE_KEYS.DESGASTE_GENERAL, DEFAULTS_DESGASTE_GENERAL),
    );
  const [fDesgasteGeneralAplicados, setFDesgasteGeneralAplicados] =
    useState<MapaDesgasteGeneralFiltros>(() =>
      leerDeStorage(STORAGE_KEYS.DESGASTE_GENERAL, DEFAULTS_DESGASTE_GENERAL),
    );
  const { data: dataDesgasteGeneral, isLoading: loadingDesgasteGeneral } =
    useApiQuery({
      queryKey: ['mapa-calor', 'desgaste-general', fDesgasteGeneralAplicados],
      queryFn:  () => mapaCalorApi.desgasteGeneral(fDesgasteGeneralAplicados),
      enabled:  capaActiva === 'desgaste-general',
    });

  // ── Desgaste índice ──────────────────────────────────────────────────────
  const [fDesgasteIndice, setFDesgasteIndice] =
    useState<MapaDesgasteIndiceFiltros>(() =>
      leerDeStorage(STORAGE_KEYS.DESGASTE_INDICE, DEFAULTS_DESGASTE_INDICE),
    );
  const [fDesgasteIndiceAplicados, setFDesgasteIndiceAplicados] =
    useState<MapaDesgasteIndiceFiltros>(() =>
      leerDeStorage(STORAGE_KEYS.DESGASTE_INDICE, DEFAULTS_DESGASTE_INDICE),
    );
  const { data: dataDesgasteIndice, isLoading: loadingDesgasteIndice } =
    useApiQuery({
      queryKey: ['mapa-calor', 'desgaste-indice', fDesgasteIndiceAplicados],
      queryFn:  () => mapaCalorApi.desgasteIndice(fDesgasteIndiceAplicados),
      enabled:  capaActiva === 'desgaste-indice',
    });

  // ── Fallas ───────────────────────────────────────────────────────────────
  const [fFallas, setFFallas] = useState<MapaFallasFiltros>(() =>
    leerDeStorage(STORAGE_KEYS.FALLAS, DEFAULTS_FALLAS),
  );
  const [fFallasAplicados, setFFallasAplicados] = useState<MapaFallasFiltros>(
    () => leerDeStorage(STORAGE_KEYS.FALLAS, DEFAULTS_FALLAS),
  );
  const { data: dataFallas, isLoading: loadingFallas } = useApiQuery({
    queryKey: ['mapa-calor', 'fallas', fFallasAplicados],
    queryFn:  () => mapaCalorApi.fallas(fFallasAplicados),
    enabled:  capaActiva === 'fallas',
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
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

  // ── Datos del esquema ─────────────────────────────────────────────────────
  const estaciones = esquema?.estaciones ?? [];
  const tramos     = esquema?.tramos     ?? [];

  // ── Carga por tramo (para expandir el SVG cuando hay mucha densidad) ─────
  const cargaFallasMap = useMemo(
    () => cargaFallas(
      dataFallas?.lineas ?? [],
      fFallasAplicados.segmentacion ?? 'TRAMO',
      estaciones,
      tramos,
    ),
    [dataFallas, fFallasAplicados.segmentacion, estaciones, tramos],
  );
  const cargaDesgasteGenMap = useMemo(
    () => cargaDesgasteGeneral(dataDesgasteGeneral?.lineas ?? [], estaciones, tramos),
    [dataDesgasteGeneral, estaciones, tramos],
  );
  const cargaDesgasteIndMap = useMemo(
    () => cargaDesgasteIndice(dataDesgasteIndice?.lineas ?? [], estaciones, tramos),
    [dataDesgasteIndice, estaciones, tramos],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mapa de Calor"
        subtitle="Visualización geográfica de temperatura, desgaste y fallas"
        breadcrumb={[{ label: 'Operaciones' }, { label: 'Mapa de calor' }]}
      />

      <SectionTabs
        items={TABS}
        value={capaActiva}
        onValueChange={setCapaActiva}
      >
        {/* ── TEMPERATURA ─────────────────────────────────────────────── */}
        <SectionTabPanel value="temperatura">
          <div className="flex flex-col gap-4">
            <FiltrosTemperatura
              filtros={fTemperatura}
              onChange={setFTemperatura}
              onAplicar={handleAplicarTemperatura}
              isLoading={loadingTemperatura}
            />
            {esquemaLoading || loadingTemperatura ? (
              <SkeletonMapaLista />
            ) : (
              <LayoutMapaLista
                mapa={
                  <>
                    <div className="mb-3 shrink-0">
                      <Leyenda titulo="Temperatura promedio" items={LEYENDA_TEMPERATURA} />
                    </div>
                    <div className="flex-1 min-h-0">
                      <EsquemaBase estaciones={estaciones} tramos={tramos}>
                        {(utils) => (
                          <CapaTemperatura
                            tramos={dataTemperatura?.tramos ?? []}
                            unidad="°C"
                            utils={utils}
                          />
                        )}
                      </EsquemaBase>
                    </div>
                  </>
                }
                lista={
                  dataTemperatura?.tramos ? (
                    <ListaDetalle
                      capa={{ tipo: 'temperatura', tramos: dataTemperatura.tramos }}
                      unidad="°C"
                    />
                  ) : null
                }
              />
            )}
          </div>
        </SectionTabPanel>

        {/* ── DESGASTE GENERAL ────────────────────────────────────────── */}
        <SectionTabPanel value="desgaste-general">
          <div className="flex flex-col gap-4">
            <FiltrosDesgasteGeneral
              filtros={fDesgasteGeneral}
              onChange={setFDesgasteGeneral}
              onAplicar={handleAplicarDesgasteGeneral}
              isLoading={loadingDesgasteGeneral}
            />
            {esquemaLoading || loadingDesgasteGeneral ? (
              <SkeletonMapaLista />
            ) : (
              <LayoutMapaLista
                mapa={
                  <>
                    {/* Leyenda semáforo (verde/amarillo/rojo) */}
                    <div className="mb-2 shrink-0">
                      <Leyenda titulo="Desgaste lateral" items={LEYENDA_DESGASTE_GENERAL} />
                    </div>
                    {/* Leyenda de carriles por color de vía+riel */}
                    <div className="mb-3 shrink-0">
                      <LeyendaViasDesgaste />
                    </div>
                    <div className="flex-1 min-h-0">
                      <EsquemaBase
                        estaciones={estaciones}
                        tramos={tramos}
                        cargaPorTramo={cargaDesgasteGenMap}
                      >
                        {(utils) => (
                          <CapaDesgasteGeneral
                            lineas={dataDesgasteGeneral?.lineas ?? []}
                            utils={utils}
                          />
                        )}
                      </EsquemaBase>
                    </div>
                  </>
                }
                lista={
                  dataDesgasteGeneral?.lineas ? (
                    <ListaDetalle
                      capa={{ tipo: 'desgaste-general', lineas: dataDesgasteGeneral.lineas }}
                      unidad="mm"
                    />
                  ) : null
                }
              />
            )}
          </div>
        </SectionTabPanel>

        {/* ── DESGASTE ÍNDICE ──────────────────────────────────────────── */}
        <SectionTabPanel value="desgaste-indice">
          <div className="flex flex-col gap-4">
            <FiltrosDesgasteIndice
              filtros={fDesgasteIndice}
              onChange={setFDesgasteIndice}
              onAplicar={handleAplicarDesgasteIndice}
              isLoading={loadingDesgasteIndice}
            />
            {esquemaLoading || loadingDesgasteIndice ? (
              <SkeletonMapaLista />
            ) : (
              <LayoutMapaLista
                mapa={
                  <>
                    {/* Leyenda semáforo */}
                    <div className="mb-2 shrink-0">
                      <Leyenda titulo="Índice comparativo" items={LEYENDA_DESGASTE_INDICE} />
                    </div>
                    {/* Leyenda de carriles por color de vía+riel */}
                    <div className="mb-3 shrink-0">
                      <LeyendaViasDesgaste />
                    </div>
                    <div className="flex-1 min-h-0">
                      <EsquemaBase
                        estaciones={estaciones}
                        tramos={tramos}
                        cargaPorTramo={cargaDesgasteIndMap}
                      >
                        {(utils) => (
                          <CapaDesgasteIndice
                            lineas={dataDesgasteIndice?.lineas ?? []}
                            utils={utils}
                          />
                        )}
                      </EsquemaBase>
                    </div>
                  </>
                }
                lista={
                  dataDesgasteIndice?.lineas ? (
                    <ListaDetalle
                      capa={{ tipo: 'desgaste-indice', lineas: dataDesgasteIndice.lineas }}
                      unidad=""
                    />
                  ) : null
                }
              />
            )}
          </div>
        </SectionTabPanel>

        {/* ── FALLAS ───────────────────────────────────────────────────── */}
        <SectionTabPanel value="fallas">
          <div className="flex flex-col gap-4">
            <FiltrosFallas
              filtros={fFallas}
              onChange={setFFallas}
              onAplicar={handleAplicarFallas}
              isLoading={loadingFallas}
            />
            {esquemaLoading || loadingFallas ? (
              <SkeletonMapaLista />
            ) : (
              <LayoutMapaLista
                mapa={
                  <>
                    {/* Leyenda semáforo */}
                    <div className="mb-2 shrink-0">
                      <Leyenda titulo="Fallas" items={LEYENDA_FALLAS} />
                    </div>
                    {/*
                      Leyenda de vías — solo visible cuando la segmentación
                      es CAMBIAVIA o CURVA_*. En modo TRAMO no hay carriles.
                    */}
                    {fFallasAplicados.segmentacion !== 'TRAMO' && (
                      <div className="mb-3 shrink-0">
                        <LeyendaViasFallas
                          segmentacion={fFallasAplicados.segmentacion ?? 'TRAMO'}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-h-0">
                      <EsquemaBase
                        estaciones={estaciones}
                        tramos={tramos}
                        cargaPorTramo={cargaFallasMap}
                      >
                        {(utils) => (
                          <CapaFallas
                            lineas={dataFallas?.lineas ?? []}
                            segmentacion={fFallasAplicados.segmentacion ?? 'TRAMO'}
                            utils={utils}
                          />
                        )}
                      </EsquemaBase>
                    </div>
                  </>
                }
                lista={
                  dataFallas?.lineas ? (
                    <ListaDetalle
                      capa={{ tipo: 'fallas', lineas: dataFallas.lineas }}
                      unidad="fallas"
                    />
                  ) : null
                }
              />
            )}
          </div>
        </SectionTabPanel>
      </SectionTabs>
    </div>
  );
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

function LayoutMapaLista({
  mapa,
  lista,
}: {
  mapa:  React.ReactNode;
  lista: React.ReactNode;
}) {
  return (
    <div
      className="grid gap-4 lg:[grid-template-columns:var(--cols-lg)]"
      style={{ '--cols-lg': GRID_LG } as React.CSSProperties}
    >
      <div
        className="flex flex-col rounded-lg border bg-card p-4 min-w-0"
        style={{ height: ALTO_PANEL }}
      >
        {mapa}
      </div>
      <div
        className="flex flex-col rounded-lg border bg-card p-4 min-w-0"
        style={{ height: ALTO_PANEL }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">{lista}</div>
      </div>
    </div>
  );
}

function SkeletonMapaLista() {
  return (
    <div
      className="grid gap-4 lg:[grid-template-columns:var(--cols-lg)]"
      style={{ '--cols-lg': GRID_LG } as React.CSSProperties}
    >
      <div
        className="rounded-lg border bg-card p-4 animate-pulse"
        style={{ height: ALTO_PANEL }}
      >
        <div className="mb-3 h-4 w-48 rounded bg-muted" />
        <div className="h-full rounded bg-muted/60" />
      </div>
      <div
        className="rounded-lg border bg-card p-4 animate-pulse"
        style={{ height: ALTO_PANEL }}
      >
        <div className="mb-3 h-4 w-32 rounded bg-muted" />
        <div className="h-full rounded bg-muted/60" />
      </div>
    </div>
  );
}