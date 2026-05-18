// frontend/src/features/catalogos/tabs/curvas-horizontales-tab.tsx

import { useState, useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type CurvaHorizontal } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import { DataTable } from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { formatearEntero } from '@/lib/format';
import type { ColumnDef } from '@tanstack/react-table';

// Celda genérica para valores opcionales numéricos
function CeldaOpcional({ valor, sufijo = '' }: { valor: number | null | undefined; sufijo?: string }) {
  if (valor === null || valor === undefined) {
    return <span className="text-muted-foreground text-xs">N.A.</span>;
  }
  return <span className="tabular-nums">{formatearEntero(valor)}{sufijo}</span>;
}

const columnas: ColumnDef<CurvaHorizontal>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => <span className="font-mono font-medium">{row.original.nombre}</span>,
  },
  {
    accessorKey: 'via',
    header: 'Vía',
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide bg-muted text-muted-foreground">
        {row.original.via}
      </span>
    ),
  },
  {
    accessorKey: 'radio',
    header: 'Radio',
    cell: ({ row }) => <CeldaOpcional valor={row.original.radio} sufijo=" m" />,
  },
  {
    accessorKey: 'inicioM',
    header: 'Inicio (m)',
    cell: ({ row }) => <span className="tabular-nums">{formatearEntero(row.original.inicioM)} m</span>,
  },
  {
    accessorKey: 'finM',
    header: 'Fin (m)',
    cell: ({ row }) => <span className="tabular-nums">{formatearEntero(row.original.finM)} m</span>,
  },
  {
    accessorKey: 'peralte',
    header: 'Peralte',
    cell: ({ row }) => <CeldaOpcional valor={row.original.peralte} sufijo=" mm" />,
  },
];

export function CurvasHorizontalesTab() {
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina = 20;

  const { data: todos, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.curvasHorizontalesTabla,
    queryFn: () => catalogosApi.curvasHorizontales.listarParaTabla({ limit: 1000 }),
  });

  const datosFiltrados = useMemo(() => {
    if (!todos) return [];
    if (!filtro) return todos;
    const busqueda = filtro.toLowerCase();
    return todos.filter(c =>
      c.nombre.toLowerCase().includes(busqueda) ||
      c.via.toLowerCase().includes(busqueda)
    );
  }, [todos, filtro]);

  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const inicio = (pagina - 1) * itemsPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, inicio + itemsPorPagina);

  const handleFiltro = (valor: string) => {
    setFiltro(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-3">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nombre o vía..."
          value={filtro}
          onChange={(e) => handleFiltro(e.target.value)}
          className="pl-9 rounded-md border-border bg-background shadow-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <DataTable
        columns={columnas}
        data={datosPagina}
        loading={isLoading}
        mensajeVacio="No hay curvas horizontales"
      />

      {totalPaginas > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-muted-foreground">
            Mostrando {inicio + 1}–{Math.min(inicio + itemsPorPagina, datosFiltrados.length)} de{' '}
            {datosFiltrados.length} curvas
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina(p => p - 1)}
              disabled={pagina === 1}
              className="rounded-md"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="px-3 py-1 text-sm text-muted-foreground">
              {pagina} / {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina(p => p + 1)}
              disabled={pagina === totalPaginas}
              className="rounded-md"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}