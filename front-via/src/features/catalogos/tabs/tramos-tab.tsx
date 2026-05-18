// frontend/src/features/catalogos/tabs/tramos-tab.tsx
//
// Plantilla CANÓNICA para tabs de Catálogos.
// Misma estructura para todos los demás tabs (Estaciones, Curvas, etc.):
//   1. Hook de datos (useApiQuery)
//   2. Filtros + paginación en frontend (useMemo)
//   3. <DataCard>  ── envoltura única con borde
//        <DataToolbar>     ── búsqueda + acciones
//        <DataTable bare>  ── tabla sin su propio borde (lo provee el card)
//        <DataPagination>  ── pie con info + controles
//      </DataCard>

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type Tramo } from '@/lib/api/catalogos.api';
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

// ── Columnas ─────────────────────────────────────────────────────────────────

const columnas: ColumnDef<Tramo>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
    cell: ({ row }) => (
      <span
        className="
          inline-block rounded-md border border-border bg-muted/50
          px-1.5 py-0.5 font-mono text-[12px] font-medium text-foreground
        "
      >
        {row.original.codigo}
      </span>
    ),
  },
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.nombre}
      </span>
    ),
  },
  {
    accessorKey: 'progresivaInicio',
    header: () => <span className="block text-right">Prog. Inicio</span>,
    cell: ({ row }) => (
      <span className="block text-right tabular-nums text-muted-foreground">
        {formatearEntero(row.original.progresivaInicio)} m
      </span>
    ),
  },
  {
    accessorKey: 'progresivaFin',
    header: () => <span className="block text-right">Prog. Fin</span>,
    cell: ({ row }) => (
      <span className="block text-right tabular-nums text-muted-foreground">
        {formatearEntero(row.original.progresivaFin)} m
      </span>
    ),
  },
  {
    id: 'longitud',
    header: () => <span className="block text-right">Longitud</span>,
    cell: ({ row }) => (
      <span className="block text-right tabular-nums font-medium text-foreground">
        {formatearEntero(row.original.progresivaFin - row.original.progresivaInicio)} m
      </span>
    ),
  },
  {
    accessorKey: 'orden',
    header: () => <span className="block text-center">Orden</span>,
    cell: ({ row }) => (
      <span className="block text-center tabular-nums text-muted-foreground">
        {row.original.orden}
      </span>
    ),
  },
];

// ── Tab ──────────────────────────────────────────────────────────────────────

export function TramosTab() {
  const [pagina, setPagina] = useState(1);
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const itemsPorPagina = 20;

  // 1. Carga (una sola llamada al backend)
  const { data: todosLosTramos, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.tramosTabla,
    queryFn: () => catalogosApi.tramos.listarParaTabla({ limit: 1000 }),
  });

  // 2. Filtros en cliente
  const tramosFiltrados = useMemo(() => {
    if (!todosLosTramos) return [];
    return todosLosTramos.filter((t) => {
      const matchCodigo =
        !filtroCodigo ||
        t.codigo.toLowerCase().includes(filtroCodigo.toLowerCase());
      const matchNombre =
        !filtroNombre ||
        t.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
      return matchCodigo && matchNombre;
    });
  }, [todosLosTramos, filtroCodigo, filtroNombre]);

  // 3. Paginación en cliente
  const totalPaginas = Math.max(
    1,
    Math.ceil(tramosFiltrados.length / itemsPorPagina),
  );
  const inicio = (pagina - 1) * itemsPorPagina;
  const tramosPagina = tramosFiltrados.slice(
    inicio,
    inicio + itemsPorPagina,
  );

  // Resetear paginación al filtrar
  const setCodigoConReset = (v: string) => {
    setFiltroCodigo(v);
    setPagina(1);
  };
  const setNombreConReset = (v: string) => {
    setFiltroNombre(v);
    setPagina(1);
  };

  return (
    <DataCard>
      <DataToolbar>
        <SearchInput
          value={filtroCodigo}
          onChange={setCodigoConReset}
          placeholder="Filtrar por código…"
        />
        <SearchInput
          value={filtroNombre}
          onChange={setNombreConReset}
          placeholder="Filtrar por nombre…"
          minWidth={260}
        />
      </DataToolbar>

      <DataTable
        bare
        columns={columnas}
        data={tramosPagina}
        loading={isLoading}
        mensajeVacio="No hay tramos que coincidan con los filtros."
      />

      {!isLoading && tramosFiltrados.length > 0 && (
        <DataPagination>
          <span className="text-muted-foreground">
            Mostrando{' '}
            <span className="font-medium text-foreground tabular-nums">
              {inicio + 1}–
              {Math.min(inicio + itemsPorPagina, tramosFiltrados.length)}
            </span>{' '}
            de{' '}
            <span className="font-medium text-foreground tabular-nums">
              {tramosFiltrados.length}
            </span>{' '}
            tramos
            {(filtroCodigo || filtroNombre) && (
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
