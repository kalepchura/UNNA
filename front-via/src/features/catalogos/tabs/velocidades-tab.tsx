// frontend/src/features/catalogos/tabs/velocidades-tab.tsx

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Gauge } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type Velocidad } from '@/lib/api/catalogos.api';
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

const columnas: ColumnDef<Velocidad>[] = [
  {
    accessorKey: 'velocidadKmh',
    header: 'Velocidad',
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2 font-medium text-foreground">
        <Gauge className="h-3.5 w-3.5 text-brand" />
        <span className="tabular-nums">{formatearEntero(row.original.velocidadKmh)}</span>
        <span className="text-xs font-normal text-muted-foreground">km/h</span>
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
        {formatearEntero(
          row.original.progresivaFin - row.original.progresivaInicio,
        )}{' '}
        m
      </span>
    ),
  },
];

export function VelocidadesTab() {
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina = 20;

  const { data: todos, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.velocidadesTabla,
    queryFn: () => catalogosApi.velocidades.listarParaTabla({ limit: 1000 }),
  });

  const datosFiltrados = useMemo(() => {
    if (!todos) return [];
    if (!filtro) return todos;
    return todos.filter((v) => String(v.velocidadKmh).includes(filtro));
  }, [todos, filtro]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(datosFiltrados.length / itemsPorPagina),
  );
  const inicio = (pagina - 1) * itemsPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, inicio + itemsPorPagina);

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
          placeholder="Buscar por velocidad…"
        />
      </DataToolbar>

      <DataTable
        bare
        columns={columnas}
        data={datosPagina}
        loading={isLoading}
        mensajeVacio="No hay velocidades que coincidan con los filtros."
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
            velocidades
            {filtro && (
              <span className="ml-1 text-muted-foreground/70">(filtradas)</span>
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
