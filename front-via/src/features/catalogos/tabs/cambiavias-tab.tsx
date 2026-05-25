// frontend/src/features/catalogos/tabs/cambiavias-tab.tsx

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type Cambiavia } from '@/lib/api/catalogos.api';
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
import { Badge } from '@/components/ui/badge';

type CambiaviaConTramo = Cambiavia & {
  tramoCodigo: string;
};

export function CambiaviasTab() {
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina = 20;

  const { data: cambiavias, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.cambiaviasTabla,
    queryFn: () => catalogosApi.cambiavias.listarParaTabla({ limit: 1000 }),
  });

  const { data: tramos } = useApiQuery({
    queryKey: queryKeys.catalogos.tramosSelector,
    queryFn: () => catalogosApi.tramos.listarParaSelector(),
  });

  const tramosPorId = useMemo(() => {
    const map = new Map<number, string>();
    tramos?.forEach((tramo) => map.set(tramo.id, tramo.codigo));
    return map;
  }, [tramos]);

  const datosFiltrados = useMemo(() => {
    if (!cambiavias) return [];
    if (!filtro) return cambiavias;
    const q = filtro.toLowerCase();
    return cambiavias.filter(
      (c) =>
        c.codigoBd.toLowerCase().includes(q) ||
        (c.descripcion?.toLowerCase().includes(q) ?? false),
    );
  }, [cambiavias, filtro]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(datosFiltrados.length / itemsPorPagina),
  );
  const inicio = (pagina - 1) * itemsPorPagina;

  const datosConTramo: CambiaviaConTramo[] = useMemo(
    () =>
      datosFiltrados
        .slice(inicio, inicio + itemsPorPagina)
        .map((c) => ({
          ...c,
          tramoCodigo: tramosPorId.get(c.tramoId) || '—',
        })),
    [datosFiltrados, inicio, tramosPorId],
  );

  const columnas: ColumnDef<CambiaviaConTramo>[] = [
    {
      accessorKey: 'codigoBd',
      header: 'Código BD',
      cell: ({ row }) => (
        <span
          className="
            inline-block rounded-md border border-border bg-muted/50
            px-1.5 py-0.5 font-mono text-[12px] font-medium text-foreground
          "
        >
          {row.original.codigoBd}
        </span>
      ),
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) =>
        row.original.descripcion ? (
          <span className="font-medium text-foreground">
            {row.original.descripcion}
          </span>
        ) : (
          <span className="text-xs italic text-muted-foreground/70">N.A.</span>
        ),
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal">
          {row.original.tipo}
        </Badge>
      ),
    },
    {
      accessorKey: 'norma',
      header: 'Norma',
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-normal">
          {row.original.norma}
        </Badge>
      ),
    },
    {
      accessorKey: 'via',
      header: 'Vía',
      cell: ({ row }) => (
        <Badge
          variant={row.original.via === 'PAR' ? 'info' : 'warning'}
          className="font-medium"
        >
          {row.original.via}
        </Badge>
      ),
    },
    {
      accessorKey: 'derivacion',
      header: 'Derivación',
      cell: ({ row }) =>
        row.original.derivacion ? (
          <span className="text-foreground">{row.original.derivacion}</span>
        ) : (
          <span className="text-xs italic text-muted-foreground/70">N.A.</span>
        ),
    },
    {
      accessorKey: 'agujaTipo',
      header: 'Tipo Aguja',
      cell: ({ row }) =>
        row.original.agujaTipo ? (
          <span className="text-muted-foreground">
            {row.original.agujaTipo}
          </span>
        ) : (
          <span className="text-xs italic text-muted-foreground/70">N.A.</span>
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
      id: 'tramo',
      header: 'Tramo',
      cell: ({ row }) => (
        <span className="font-mono text-[12px] text-muted-foreground">
          {row.original.tramoCodigo}
        </span>
      ),
    },
    {
      accessorKey: 'velocidadKmh',
      header: () => <span className="block text-right">Velocidad</span>,
      cell: ({ row }) =>
        row.original.velocidadKmh ? (
          <span className="block text-right tabular-nums text-muted-foreground">
            {row.original.velocidadKmh} km/h
          </span>
        ) : (
          <span className="block text-right text-xs italic text-muted-foreground/70">
            N.A.
          </span>
        ),
    },
  ];

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
          placeholder="Buscar por código BD o descripción…"
          minWidth={320}
        />
      </DataToolbar>

      <DataTable
        bare
        columns={columnas}
        data={datosConTramo}
        loading={isLoading}
        mensajeVacio="No hay cambiavías que coincidan con los filtros."
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
            cambiavías
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
