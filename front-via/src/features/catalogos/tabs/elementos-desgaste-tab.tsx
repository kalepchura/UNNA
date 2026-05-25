// frontend/src/features/catalogos/tabs/elementos-desgaste-tab.tsx

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type ElementoDesgaste } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import { formatearEntero } from '@/lib/format';

import { DataTable } from '@/components/tables/data-table';
import {
  DataCard,
  DataToolbar,
  DataPagination,
} from '@/components/shared/data-card';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';

type ElementoDesgasteConNombres = ElementoDesgaste & {
  tramoCodigo: string;
  curvaHorizontalNombre: string;
  curvaVerticalNombre: string;
};

// ── Helpers de celda ─────────────────────────────────────────────────────────

function CeldaCurva({ nombre }: { nombre: string }) {
  if (nombre === '—' || !nombre) {
    return (
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
        Tangente
      </span>
    );
  }
  return <span className="text-foreground">{nombre}</span>;
}

function CeldaCarrilCurva({ valor }: { valor: string | null | undefined }) {
  if (!valor || valor === 'N.A' || valor === 'N.A.') {
    return (
      <span className="text-xs italic text-muted-foreground/70">N.A.</span>
    );
  }
  return (
    <span
      className="
        inline-flex items-center rounded-md border border-border bg-card
        px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide
        text-foreground
      "
    >
      {valor}
    </span>
  );
}

// ── Columnas ─────────────────────────────────────────────────────────────────

function buildColumnas(): ColumnDef<ElementoDesgasteConNombres>[] {
  return [
    {
      accessorKey: 'codigoElemento',
      header: 'Código',
      cell: ({ row }) => (
        <span
          className="
            inline-block rounded-md border border-border bg-muted/50
            px-1.5 py-0.5 font-mono text-[12px] font-medium tabular-nums text-foreground
          "
        >
          {row.original.codigoElemento}
        </span>
      ),
    },
    {
      accessorKey: 'progresiva',
      header: () => <span className="block text-right">Progresiva</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums font-medium text-foreground">
          {formatearEntero(row.original.progresiva)} m
        </span>
      ),
    },
    {
      accessorKey: 'via',
      header: 'Vía',
      cell: ({ row }) => (
        <span
          className="
            inline-flex items-center rounded-full bg-muted px-2 py-0.5
            text-[11px] font-semibold uppercase tracking-wide text-muted-foreground
          "
        >
          {row.original.via}
        </span>
      ),
    },
    {
      id: 'tramo',
      header: 'Tramo',
      cell: ({ row }) => (
        <span className="font-mono text-[12px] text-muted-foreground">
          {row.original.tramoCodigo}
        </span>
      ),
    },
    {
      id: 'curvaHorizontal',
      header: 'Curva horizontal',
      cell: ({ row }) => (
        <CeldaCurva nombre={row.original.curvaHorizontalNombre} />
      ),
    },
    {
      id: 'curvaVertical',
      header: 'Curva vertical',
      cell: ({ row }) => (
        <CeldaCurva nombre={row.original.curvaVerticalNombre} />
      ),
    },
    {
      accessorKey: 'riel',
      header: 'Riel',
      cell: ({ row }) => {
        const esIzq = row.original.riel === 'IZQUIERDA';
        return (
          <span
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5',
              'text-[11px] font-semibold uppercase tracking-wide',
              esIzq
                ? 'bg-info-soft text-info-soft-foreground'
                : 'bg-warning-soft text-warning-soft-foreground',
            ].join(' ')}
          >
            <span
              className={[
                'h-1.5 w-1.5 rounded-full',
                esIzq ? 'bg-info' : 'bg-warning',
              ].join(' ')}
            />
            {row.original.riel}
          </span>
        );
      },
    },
    {
      accessorKey: 'perfil',
      header: 'Perfil',
      cell: ({ row }) => (
        <span
          className="
            inline-flex items-center rounded-md border border-border bg-card
            px-2 py-0.5 font-mono text-[12px] font-medium text-foreground
          "
        >
          {row.original.perfil}
        </span>
      ),
    },
    {
      accessorKey: 'carrilCurva',
      header: 'Carril curva',
      cell: ({ row }) => <CeldaCarrilCurva valor={row.original.carrilCurva} />,
    },
  ];
}

// ── Componente principal ─────────────────────────────────────────────────────

export function ElementosDesgasteTab() {
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina = 20;

  const { data: todos, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.elementosDesgasteTabla,
    queryFn: () =>
      catalogosApi.elementosDesgaste.listarParaTabla({ limit: 1000 }),
  });

  const { data: tramos } = useApiQuery({
    queryKey: queryKeys.catalogos.tramosSelector,
    queryFn: () => catalogosApi.tramos.listarParaSelector(),
  });

  const { data: curvasH } = useApiQuery({
    queryKey: queryKeys.catalogos.curvasHorizontalesSelector,
    queryFn: () => catalogosApi.curvasHorizontales.listarParaSelector(),
  });

  const { data: curvasV } = useApiQuery({
    queryKey: queryKeys.catalogos.curvasVerticalesSelector,
    queryFn: () => catalogosApi.curvasVerticales.listarParaSelector(),
  });

  const tramosPorId = useMemo(() => {
    const map = new Map<number, string>();
    tramos?.forEach((t) => map.set(t.id, t.codigo));
    return map;
  }, [tramos]);

  const curvasHPorId = useMemo(() => {
    const map = new Map<number, string>();
    curvasH?.forEach((c) => map.set(c.id, c.nombre));
    return map;
  }, [curvasH]);

  const curvasVPorId = useMemo(() => {
    const map = new Map<number, string>();
    curvasV?.forEach((c) => map.set(c.id, c.nombre));
    return map;
  }, [curvasV]);

  const datosFiltrados = useMemo(() => {
    if (!todos) return [];
    if (!filtro) return todos;
    const q = filtro.toLowerCase();
    return todos.filter(
      (e) =>
        String(e.codigoElemento).includes(q) ||
        String(e.progresiva).includes(q) ||
        e.via.toLowerCase().includes(q) ||
        e.riel.toLowerCase().includes(q) ||
        e.perfil.toLowerCase().includes(q) ||
        (tramosPorId.get(e.tramoId)?.toLowerCase().includes(q) ?? false) ||
        (curvasHPorId
          .get(e.curvaHorizontalId ?? 0)
          ?.toLowerCase()
          .includes(q) ??
          false) ||
        (curvasVPorId
          .get(e.curvaVerticalId ?? 0)
          ?.toLowerCase()
          .includes(q) ??
          false),
    );
  }, [todos, filtro, tramosPorId, curvasHPorId, curvasVPorId]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(datosFiltrados.length / itemsPorPagina),
  );
  const inicio = (pagina - 1) * itemsPorPagina;

  const datosConNombres: ElementoDesgasteConNombres[] = useMemo(
    () =>
      datosFiltrados
        .slice(inicio, inicio + itemsPorPagina)
        .map((e) => ({
          ...e,
          tramoCodigo: tramosPorId.get(e.tramoId) || '—',
          curvaHorizontalNombre: e.curvaHorizontalId
            ? curvasHPorId.get(e.curvaHorizontalId) ||
              `ID: ${e.curvaHorizontalId}`
            : '—',
          curvaVerticalNombre: e.curvaVerticalId
            ? curvasVPorId.get(e.curvaVerticalId) ||
              `ID: ${e.curvaVerticalId}`
            : '—',
        })),
    [datosFiltrados, inicio, tramosPorId, curvasHPorId, curvasVPorId],
  );

  const columnas = useMemo(() => buildColumnas(), []);

  const setFiltroConReset = (v: string) => {
    setFiltro(v);
    setPagina(1);
  };

  return (
    <DataCard>
      <DataToolbar>
        <SearchInput
          value={filtro}
          onChange={setFiltroConReset}
          placeholder="Buscar por código, progresiva, vía, riel, perfil, tramo o curva…"
          minWidth={420}
        />
      </DataToolbar>

      <DataTable
        bare
        columns={columnas}
        data={datosConNombres}
        loading={isLoading}
        mensajeVacio="No hay elementos de desgaste que coincidan con los filtros."
      />

      {!isLoading && datosFiltrados.length > 0 && (
        <DataPagination>
          <span className="text-muted-foreground">
            Mostrando{' '}
            <span className="font-medium text-foreground tabular-nums">
              {inicio + 1}–
              {Math.min(inicio + itemsPorPagina, datosFiltrados.length)}
            </span>{' '}
            de{' '}
            <span className="font-medium text-foreground tabular-nums">
              {datosFiltrados.length}
            </span>{' '}
            elementos
            {filtro && (
              <span className="ml-1 text-muted-foreground/70">(filtrados)</span>
            )}
          </span>

          {totalPaginas > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagina((p) => p - 1)}
                disabled={pagina === 1}
                className="h-8"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </Button>
              <span className="px-2 text-sm tabular-nums text-muted-foreground">
                Página {pagina} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagina((p) => p + 1)}
                disabled={pagina === totalPaginas}
                className="h-8"
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </DataPagination>
      )}
    </DataCard>
  );
}
