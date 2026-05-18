// frontend/src/features/catalogos/tabs/estaciones-tab.tsx
//
// Sigue exactamente la misma estructura que tramos-tab.tsx (plantilla canónica).

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type Estacion } from '@/lib/api/catalogos.api';
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

// Tipo extendido con el código del tramo decodificado
type EstacionConTramo = Estacion & {
  tramoCodigo: string;
};

const columnas: ColumnDef<EstacionConTramo>[] = [
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
      <span className="text-muted-foreground">
        {row.original.tramoCodigo}
      </span>
    ),
  },
];

export function EstacionesTab() {
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina = 20;

  const { data: estaciones, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.estacionesTabla,
    queryFn: () => catalogosApi.estaciones.listarParaTabla({ limit: 1000 }),
  });

  const { data: tramos } = useApiQuery({
    queryKey: queryKeys.catalogos.tramosSelector,
    queryFn: () => catalogosApi.tramos.listarParaSelector(),
  });

  const tramosPorId = useMemo(() => {
    const map = new Map<number, string>();
    tramos?.forEach((t) => map.set(t.id, t.codigo));
    return map;
  }, [tramos]);

  const datosFiltrados = useMemo(() => {
    if (!estaciones) return [];
    if (!filtro) return estaciones;
    const q = filtro.toLowerCase();
    return estaciones.filter((e) => {
      const tramoCod = tramosPorId.get(e.tramoId)?.toLowerCase() ?? '';
      return (
        e.codigo.toLowerCase().includes(q) ||
        e.nombre.toLowerCase().includes(q) ||
        tramoCod.includes(q)
      );
    });
  }, [estaciones, filtro, tramosPorId]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(datosFiltrados.length / itemsPorPagina),
  );
  const inicio = (pagina - 1) * itemsPorPagina;

  const datosConTramo: EstacionConTramo[] = useMemo(
    () =>
      datosFiltrados
        .slice(inicio, inicio + itemsPorPagina)
        .map((e) => ({
          ...e,
          tramoCodigo: tramosPorId.get(e.tramoId) || '—',
        })),
    [datosFiltrados, inicio, tramosPorId],
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
          placeholder="Buscar por código, nombre o tramo…"
          minWidth={320}
        />
      </DataToolbar>

      <DataTable
        bare
        columns={columnas}
        data={datosConTramo}
        loading={isLoading}
        mensajeVacio="No hay estaciones que coincidan con los filtros."
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
            estaciones
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
