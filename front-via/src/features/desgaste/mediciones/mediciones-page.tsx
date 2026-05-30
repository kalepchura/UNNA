import { useState, useMemo, useEffect } from 'react';
import { Save, ChevronLeft, ChevronRight } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useInvalidate } from '@/hooks/use-invalidate';
import { desgasteApi } from '@/lib/api/desgaste.api';

import { PageHeader } from '@/components/layout/page-header';
import {
  DataCard,
  DataToolbar,
  DataPagination,
} from '@/components/shared/data-card';
import { Button } from '@/components/ui/button';

import { FiltrosMediciones } from './filtros-mediciones';
import { GrillaDesgaste } from './grilla-desgaste';
import type {
  CargarGrillaFiltros,
  CeldaModificadaDto,
  GrillaResponse,
} from '../types/mediciones.types';

const LIMIT = 10;
const STORAGE_KEY = 'mediciones_filtros';

function leerFiltrosGuardados(): CargarGrillaFiltros | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as CargarGrillaFiltros;
  } catch { /* ignore */ }
  return null;
}

function guardarFiltros(filtros: CargarGrillaFiltros) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtros));
  } catch { /* ignore */ }
}

export function MedicionesPage() {
  const invalidate = useInvalidate();

  // ── Cargar lista de escenarios para detectar el REAL ──────────────────────
  const { data: escenariosData } = useApiQuery({
    queryKey: ['desgaste', 'escenarios', 'selector'],
    queryFn: () => desgasteApi.escenarios.buscar({ page: 1, limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  // ID del escenario REAL (esReal = true)
  const idEscenarioReal = useMemo(
    () => escenariosData?.data?.find((e) => e.esReal && !e.eliminado)?.id ?? null,
    [escenariosData],
  );

  // ── Estado de filtros ─────────────────────────────────────────────────────
  // Inicializa desde sessionStorage si existe, sino vacío
  const [filtros, setFiltros] = useState<CargarGrillaFiltros>(
    () => leerFiltrosGuardados() ?? {},
  );
  const [filtrosAplicados, setFiltrosAplicados] = useState<CargarGrillaFiltros>(
    () => leerFiltrosGuardados() ?? {},
  );

  // ── Auto-carga del escenario REAL al entrar ───────────────────────────────
  // Solo si no hay filtros guardados en sesión (primera visita o sesión nueva)
  useEffect(() => {
    if (!idEscenarioReal) return;
    // Si ya hay un escenario seleccionado (guardado en sesión), no sobreescribir
    if (filtrosAplicados.escenarioId) return;

    const filtrosIniciales: CargarGrillaFiltros = { escenarioId: idEscenarioReal };
    setFiltros(filtrosIniciales);
    setFiltrosAplicados(filtrosIniciales);
    guardarFiltros(filtrosIniciales);
  }, [idEscenarioReal]); // eslint-disable-line react-hooks/exhaustive-deps

  const [celdasModificadas, setCeldasModificadas] = useState<CeldaModificadaDto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  // ── Query de grilla ───────────────────────────────────────────────────────
  const { data, isLoading } = useApiQuery({
    queryKey: ['desgaste', 'mediciones', 'grilla', filtrosAplicados],
    queryFn: () => desgasteApi.mediciones.cargarGrilla(filtrosAplicados),
    enabled: !!filtrosAplicados.escenarioId,
  });

  // ── Filtrado local por búsqueda ───────────────────────────────────────────
  const filasFiltradas = useMemo(() => {
    if (!data?.filas) return [];
    if (!busqueda.trim()) return data.filas;
    const q = busqueda.toLowerCase();
    return data.filas.filter(
      (f) =>
        String(f.codigoElemento).toLowerCase().includes(q) ||
        String(f.progresiva).includes(q) ||
        f.via.toLowerCase().includes(q) ||
        f.riel.toLowerCase().includes(q),
    );
  }, [data?.filas, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / LIMIT));
  const filasPagina  = filasFiltradas.slice((pagina - 1) * LIMIT, pagina * LIMIT);

  const grillaPaginada: GrillaResponse | undefined = data
    ? { ...data, filas: filasPagina }
    : undefined;

  // ── Guardar cambios ───────────────────────────────────────────────────────
  const guardarMut = useApiMutation({
    mutationFn: () =>
      desgasteApi.mediciones.guardarCambios({
        escenarioId: filtrosAplicados.escenarioId!,
        cambios: celdasModificadas,
      }),
    onSuccess: () => {
      invalidate(['desgaste', 'mediciones', 'grilla']);
      setCeldasModificadas([]);
    },
    mensajeExito: 'Cambios guardados correctamente',
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAplicar = () => {
    const filtrosExpandidos: CargarGrillaFiltros = { ...filtros };

    if (filtros.anios && filtros.anios.length >= 2) {
      const desde = filtros.anios[0];
      const hasta = filtros.anios[1];
      const aniosExpandidos: number[] = [];
      for (let a = desde; a <= hasta; a++) aniosExpandidos.push(a);
      filtrosExpandidos.anios = aniosExpandidos;
    }

    setFiltrosAplicados(filtrosExpandidos);
    guardarFiltros(filtrosExpandidos); // ← persiste durante la navegación
    setPagina(1);
    setBusqueda('');
    setCeldasModificadas([]);
  };

  const handleBusqueda = (v: string) => {
    setBusqueda(v);
    setPagina(1);
  };

  const handleCeldaChange = (celda: CeldaModificadaDto) => {
    setCeldasModificadas((prev) => {
      const idx = prev.findIndex(
        (c) =>
          c.elementoId === celda.elementoId &&
          c.anio === celda.anio &&
          c.trimestre === celda.trimestre &&
          c.punto === celda.punto,
      );
      if (idx >= 0) {
        const nueva = [...prev];
        if (celda.valor === null) nueva.splice(idx, 1);
        else nueva[idx] = celda;
        return nueva;
      }
      return celda.valor === null ? prev : [...prev, celda];
    });
  };

  const hasCambios = celdasModificadas.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Carga de Mediciones"
        subtitle="Filtra por tramo y año, y edita las celdas directamente."
        breadcrumb={[{ label: 'Desgaste' }, { label: 'Mediciones' }]}
        actions={
          hasCambios ? (
            <Button
              size="sm"
              onClick={() => guardarMut.mutate(undefined)}
              disabled={guardarMut.isPending}
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {guardarMut.isPending
                ? 'Guardando…'
                : `Guardar ${celdasModificadas.length} cambio${celdasModificadas.length === 1 ? '' : 's'}`}
            </Button>
          ) : undefined
        }
      />

      <FiltrosMediciones
        filtros={filtros}
        onChange={setFiltros}
        onAplicar={handleAplicar}
        busqueda={busqueda}
        onBusquedaChange={handleBusqueda}
        isLoading={isLoading}
      />

      {!filtrosAplicados.escenarioId && (
        <div className="text-sm text-muted-foreground text-center py-8">
          Cargando escenario…
        </div>
      )}

      {grillaPaginada && filtrosAplicados.escenarioId && (
        <DataCard>
          <DataToolbar>
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground tabular-nums">
                {filasFiltradas.length}
              </span>{' '}
              elementos
              {busqueda && (
                <span className="text-muted-foreground/70">
                  {' '}· filtrando por "{busqueda}"
                </span>
              )}
            </span>
          </DataToolbar>

          <div className="px-4 py-4">
            <GrillaDesgaste
              grilla={grillaPaginada}
              celdasModificadas={celdasModificadas}
              onCeldaChange={handleCeldaChange}
            />
          </div>

          {totalPaginas > 1 && (
            <DataPagination>
              <span className="text-muted-foreground">
                Página{' '}
                <span className="font-medium text-foreground tabular-nums">
                  {pagina}
                </span>{' '}
                de{' '}
                <span className="font-medium text-foreground tabular-nums">
                  {totalPaginas}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina <= 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina >= totalPaginas}
                >
                  Siguiente
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </DataPagination>
          )}
        </DataCard>
      )}
    </div>
  );
}