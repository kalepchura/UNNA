// frontend/src/features/catalogos/tabs/elementos-desgaste-tab.tsx

import { useState, useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type ElementoDesgaste } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import { DataTable } from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { formatearEntero } from '@/lib/format';
import type { ColumnDef } from '@tanstack/react-table';

type ElementoDesgasteConNombres = ElementoDesgaste & {
  tramoCodigo: string;
  curvaHorizontalNombre: string;
  curvaVerticalNombre: string;
};

// ── Helpers de celda ──────────────────────────────────────────────────────────

/** Curva horizontal / vertical: si no hay curva → "TANGENTE" en gris */
function CeldaCurva({ nombre }: { nombre: string }) {
  if (nombre === '—' || !nombre) {
    return <span className="text-muted-foreground text-xs font-normal">TANGENTE</span>;
  }
  return <span>{nombre}</span>;
}

/** Carril curva: null / 'N.A' / vacío → "N.A." en gris; si no, badge */
function CeldaCarrilCurva({ valor }: { valor: string | null | undefined }) {
  if (!valor || valor === 'N.A' || valor === 'N.A.') {
    return <span className="text-muted-foreground text-xs font-normal">N.A.</span>;
  }
  return (
    <span className="inline-flex items-center rounded-sm border border-border px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
      {valor}
    </span>
  );
}

// ── Columnas ──────────────────────────────────────────────────────────────────

function buildColumnas(): ColumnDef<ElementoDesgasteConNombres>[] {
  return [
    {
      accessorKey: 'codigoElemento',
      header: 'Código',
      cell: ({ row }) => (
        <span className="font-mono font-medium tabular-nums">
          {row.original.codigoElemento}
        </span>
      ),
    },
    {
      accessorKey: 'progresiva',
      header: 'Progresiva',
      cell: ({ row }) => (
        <span className="tabular-nums">{formatearEntero(row.original.progresiva)} m</span>
      ),
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
      id: 'tramo',
      header: 'Tramo',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.tramoCodigo}</span>,
    },
    {
      id: 'curvaHorizontal',
      header: 'Curva Horizontal',
      cell: ({ row }) => <CeldaCurva nombre={row.original.curvaHorizontalNombre} />,
    },
    {
      id: 'curvaVertical',
      header: 'Curva Vertical',
      cell: ({ row }) => <CeldaCurva nombre={row.original.curvaVerticalNombre} />,
    },
    {
      accessorKey: 'riel',
      header: 'Riel',
      cell: ({ row }) => {
        const esIzq = row.original.riel === 'IZQUIERDA';
        return (
          <span
            className={[
              'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
              esIzq
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                : 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
            ].join(' ')}
          >
            {row.original.riel}
          </span>
        );
      },
    },
    {
      accessorKey: 'perfil',
      header: 'Perfil',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-sm border border-border px-2 py-0.5 text-xs font-mono font-medium">
          {row.original.perfil}
        </span>
      ),
    },
    {
      accessorKey: 'carrilCurva',
      header: 'Carril Curva',
      cell: ({ row }) => <CeldaCarrilCurva valor={row.original.carrilCurva} />,
    },
  ];
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ElementosDesgasteTab() {
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina = 20;

  const { data: todos, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.elementosDesgasteTabla,
    queryFn: () => catalogosApi.elementosDesgaste.listarParaTabla({ limit: 1000 }),
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
    tramos?.forEach(t => map.set(t.id, t.codigo));
    return map;
  }, [tramos]);

  const curvasHPorId = useMemo(() => {
    const map = new Map<number, string>();
    curvasH?.forEach(c => map.set(c.id, c.nombre));
    return map;
  }, [curvasH]);

  const curvasVPorId = useMemo(() => {
    const map = new Map<number, string>();
    curvasV?.forEach(c => map.set(c.id, c.nombre));
    return map;
  }, [curvasV]);

  const datosFiltrados = useMemo(() => {
    if (!todos) return [];
    if (!filtro) return todos;
    const busqueda = filtro.toLowerCase();
    return todos.filter(e =>
      String(e.codigoElemento).includes(busqueda) ||
      String(e.progresiva).includes(busqueda) ||
      e.via.toLowerCase().includes(busqueda) ||
      e.riel.toLowerCase().includes(busqueda) ||
      e.perfil.toLowerCase().includes(busqueda) ||
      tramosPorId.get(e.tramoId)?.toLowerCase().includes(busqueda) ||
      curvasHPorId.get(e.curvaHorizontalId ?? 0)?.toLowerCase().includes(busqueda) ||
      curvasVPorId.get(e.curvaVerticalId ?? 0)?.toLowerCase().includes(busqueda)
    );
  }, [todos, filtro, tramosPorId, curvasHPorId, curvasVPorId]);

  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const inicio = (pagina - 1) * itemsPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, inicio + itemsPorPagina);

  const datosConNombres: ElementoDesgasteConNombres[] = useMemo(() => {
    return datosPagina.map(e => ({
      ...e,
      tramoCodigo: tramosPorId.get(e.tramoId) || '—',
      curvaHorizontalNombre: e.curvaHorizontalId
        ? curvasHPorId.get(e.curvaHorizontalId) || `ID: ${e.curvaHorizontalId}`
        : '—',
      curvaVerticalNombre: e.curvaVerticalId
        ? curvasVPorId.get(e.curvaVerticalId) || `ID: ${e.curvaVerticalId}`
        : '—',
    }));
  }, [datosPagina, tramosPorId, curvasHPorId, curvasVPorId]);

  const columnas = useMemo(() => buildColumnas(), []);

  const handleFiltro = (valor: string) => {
    setFiltro(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-3">
      {/* Buscador */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por código, progresiva, vía, riel, perfil, tramo o curva..."
          value={filtro}
          onChange={(e) => handleFiltro(e.target.value)}
          className="pl-9 rounded-md border-border bg-background shadow-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Tabla */}
      <DataTable
        columns={columnas}
        data={datosConNombres}
        loading={isLoading}
        mensajeVacio="No hay elementos de desgaste"
      />

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-muted-foreground">
            Mostrando {inicio + 1}–{Math.min(inicio + itemsPorPagina, datosFiltrados.length)} de{' '}
            {datosFiltrados.length} elementos
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