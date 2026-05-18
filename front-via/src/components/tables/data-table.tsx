import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';

interface DataTableProps<TData> {
  /** Definición de columnas (TanStack ColumnDef). */
  columns: ColumnDef<TData, any>[];
  /** Datos a mostrar. */
  data: TData[];
  /** Estado de carga (muestra overlay sobre los datos existentes o skeleton si es primera carga). */
  loading?: boolean;
  /** Mensaje cuando no hay datos. */
  mensajeVacio?: string;

  /** -- Paginación servidor (opcional) -- */
  paginacion?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  /** Callback cuando se hace click en una fila. */
  onRowClick?: (row: TData) => void;
  /** Variante de densidad: 'default' (más espaciado) o 'compact' (menos padding). */
  density?: 'default' | 'compact';
}

/**
 * Tabla genérica con TanStack Table.
 *
 * Mejoras visuales:
 *  - Overlay de carga semitransparente con spinner (mantiene los datos anteriores visibles).
 *  - Transiciones suaves de opacidad.
 *  - Variante compacta para catálogos y listados densos.
 */
export function DataTable<TData>({
  columns,
  data,
  loading,
  mensajeVacio = 'No hay registros para mostrar',
  paginacion,
  onRowClick,
  density = 'default',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: !!paginacion,
    pageCount: paginacion?.totalPages ?? -1,
  });

  const isEmpty = !loading && data.length === 0;
  const showOverlay = loading && data.length > 0;
  const isFirstLoad = loading && data.length === 0;

  const cellPadding = density === 'compact' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const headerPadding = density === 'compact' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm';

  return (
    <div className="space-y-3">
      {/* Tabla */}
      <div className="relative overflow-x-auto rounded-2xl border border-border/50 bg-background shadow-sm">
        {showOverlay && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 transition-opacity duration-200">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <table className={cn('w-full', showOverlay && 'opacity-60 transition-opacity duration-200')}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border/40 bg-muted/20">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'text-left font-medium text-muted-foreground whitespace-nowrap',
                      headerPadding,
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className={cn(
                          'flex items-center gap-1',
                          header.column.getCanSort() && 'cursor-pointer select-none',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <SortIcon dir={header.column.getIsSorted()} />
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isFirstLoad ? (
              <SkeletonRows columns={columns.length} density={density} />
            ) : isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState titulo={mensajeVacio} className="m-4" />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'border-b border-border/40 hover:bg-muted/20 transition-colors',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cn('align-middle', cellPadding)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación (si aplica) */}
      {paginacion && data.length > 0 && (
        <PaginacionControls paginacion={paginacion} loading={loading} />
      )}
    </div>
  );
}

// ----- Subcomponentes -----

function SortIcon({ dir }: { dir: false | 'asc' | 'desc' }) {
  if (dir === 'asc') return <ChevronUp className="h-3 w-3" />;
  if (dir === 'desc') return <ChevronDown className="h-3 w-3" />;
  return <ChevronsUpDown className="h-3 w-3 opacity-50" />;
}

function SkeletonRows({ columns, density }: { columns: number; density: 'default' | 'compact' }) {
  const padding = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3';
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className={padding}>
              <Skeleton className="h-4 w-full bg-gray-200 animate-pulse rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function PaginacionControls({
  paginacion,
  loading,
}: {
  paginacion: NonNullable<DataTableProps<unknown>['paginacion']>;
  loading?: boolean;
}) {
  const { page, limit, total, totalPages, onPageChange } = paginacion;
  const inicio = (page - 1) * limit + 1;
  const fin = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 px-1">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? 'Sin registros'
          : `${inicio} - ${fin} de ${total} registros`}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || loading}
          className="h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm px-3">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin inline" />
          ) : (
            `Página ${page} de ${totalPages || 1}`
          )}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || loading}
          className="h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}