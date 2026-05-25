// frontend/src/features/catalogos/tabs/curvas-verticales-tab.tsx

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type CurvaVertical } from '@/lib/api/catalogos.api';
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

// ── Celdas helper ────────────────────────────────────────────────────────────

function NumCell({
  valor,
  sufijo = '',
  align = 'right',
  decimal = false,
}: {
  valor: number | null | undefined;
  sufijo?: string;
  align?: 'left' | 'right' | 'center';
  decimal?: boolean;
}) {
  const alignClass =
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left';

  if (valor === null || valor === undefined) {
    return (
      <span className={`block ${alignClass} text-xs italic text-muted-foreground/70`}>
        N.A.
      </span>
    );
  }
  return (
    <span className={`block ${alignClass} tabular-nums text-muted-foreground`}>
      {decimal ? valor : formatearEntero(valor)}
      {sufijo}
    </span>
  );
}

// ── Columnas ─────────────────────────────────────────────────────────────────

const columnas: ColumnDef<CurvaVertical>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => (
      <span
        className="
          inline-block rounded-md border border-border bg-muted/50
          px-1.5 py-0.5 font-mono text-[12px] font-medium text-foreground
        "
      >
        {row.original.nombre}
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
    accessorKey: 'inicioM',
    header: () => <span className="block text-right">Inicio</span>,
    cell: ({ row }) => <NumCell valor={row.original.inicioM} sufijo=" m" />,
  },
  {
    accessorKey: 'finM',
    header: () => <span className="block text-right">Fin</span>,
    cell: ({ row }) => <NumCell valor={row.original.finM} sufijo=" m" />,
  },
  {
    accessorKey: 'pkVertice',
    header: () => <span className="block text-right">PK Vértice</span>,
    cell: ({ row }) => <NumCell valor={row.original.pkVertice} sufijo=" m" />,
  },
  {
    accessorKey: 'pendienteEntrada',
    header: () => <span className="block text-right">Pendiente entrada</span>,
    cell: ({ row }) => (
      <NumCell valor={row.original.pendienteEntrada} sufijo="‰" decimal />
    ),
  },
  {
    accessorKey: 'pendienteSalida',
    header: () => <span className="block text-right">Pendiente salida</span>,
    cell: ({ row }) => (
      <NumCell valor={row.original.pendienteSalida} sufijo="‰" decimal />
    ),
  },
  {
    accessorKey: 'radio',
    header: () => <span className="block text-right">Radio</span>,
    cell: ({ row }) => <NumCell valor={row.original.radio} sufijo=" m" />,
  },
];

// ── Tab ──────────────────────────────────────────────────────────────────────

export function CurvasVerticalesTab() {
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina = 20;

  const { data: todos, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.curvasVerticalesTabla,
    queryFn: () =>
      catalogosApi.curvasVerticales.listarParaTabla({ limit: 1000 }),
  });

  const datosFiltrados = useMemo(() => {
    if (!todos) return [];
    if (!filtro) return todos;
    const q = filtro.toLowerCase();
    return todos.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.via.toLowerCase().includes(q),
    );
  }, [todos, filtro]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(datosFiltrados.length / itemsPorPagina),
  );
  const inicio = (pagina - 1) * itemsPorPagina;
  const datosPagina = datosFiltrados.slice(
    inicio,
    inicio + itemsPorPagina,
  );

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
          placeholder="Buscar por nombre o vía…"
          minWidth={280}
        />
      </DataToolbar>

      <DataTable
        bare
        columns={columnas}
        data={datosPagina}
        loading={isLoading}
        mensajeVacio="No hay curvas verticales que coincidan con los filtros."
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
            curvas
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
