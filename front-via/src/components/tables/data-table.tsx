// frontend/src/components/tables/data-table.tsx

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
  /**
   * Si la tabla va dentro de un <DataCard/> que ya provee borde y sombra,
   * pasa bare=true para que la tabla no dibuje su propio contenedor.
   */
  bare?: boolean;
}

/**
 * Tabla genérica con TanStack Table.
 *
 * Mejoras visuales:
 *  - Overlay de carga semitransparente con spinner (mantiene los datos anteriores visibles).
 *  - Headers con peso visual claro y orden visible.
 *  - Filas con hover sutil + zebra opcional eliminada para look más limpio.
 *  - Variante `bare` para componer dentro de <DataCard/>.
 */
export function DataTable<TData>({
  columns,
  data,
  loading,
  mensajeVacio = 'No hay registros para mostrar',
  paginacion,
  onRowClick,
  density = 'default',
  bare = false,
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

  const cellPadding =
    density === 'compact'
      ? 'px-3 py-2 text-[13px]'
      : 'px-4 py-3 text-sm';
  const headerPadding =
    density === 'compact'
      ? 'px-3 py-2.5 text-[11px]'
      : 'px-4 py-3 text-[11.5px]';

  return (
    <div className={cn(!bare && 'space-y-3')}>
      {/* Tabla */}
      <div
        className={cn(
          'relative overflow-x-auto',
          !bare && 'rounded-xl border border-border bg-card shadow-sm',
        )}
      >
        {showOverlay && (
          <div
            className="
              absolute inset-0 z-10 flex items-center justify-center
              bg-background/60 backdrop-blur-[1px] transition-opacity duration-200
            "
          >
            <Loader2 className="h-6 w-6 animate-spin text-foreground" />
          </div>
        )}

        <table
          className={cn(
            'w-full border-collapse',
            showOverlay && 'opacity-60 transition-opacity duration-200',
          )}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border bg-muted/30"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'text-left font-semibold uppercase tracking-wider',
                      'text-muted-foreground whitespace-nowrap',
                      headerPadding,
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className={cn(
                          'flex items-center gap-1.5 transition-colors',
                          header.column.getCanSort() &&
                            'cursor-pointer select-none hover:text-foreground',
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
              <SkeletonRows
                columns={columns.length}
                density={density}
              />
            ) : isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState titulo={mensajeVacio} className="m-6" />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  className={cn(
                    'border-b border-border/60 transition-colors',
                    'hover:bg-muted/40',
                    idx === table.getRowModel().rows.length - 1 && 'border-b-0',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn('align-middle text-foreground', cellPadding)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
  if (dir === 'asc')
    return <ChevronUp className="h-3 w-3 text-foreground" />;
  if (dir === 'desc')
    return <ChevronDown className="h-3 w-3 text-foreground" />;
  return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
}

function SkeletonRows({
  columns,
  density,
}: {
  columns: number;
  density: 'default' | 'compact';
}) {
  const padding = density === 'compact' ? 'px-3 py-2.5' : 'px-4 py-3.5';
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-border/60">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className={padding}>
              <Skeleton className="h-3.5 w-[80%]" />
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
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? (
          'Sin registros'
        ) : (
          <>
            Mostrando{' '}
            <span className="font-medium text-foreground tabular-nums">
              {inicio}–{fin}
            </span>{' '}
            de{' '}
            <span className="font-medium text-foreground tabular-nums">
              {total}
            </span>{' '}
            registros
          </>
        )}
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
        <span className="px-3 text-sm tabular-nums">
          {loading ? (
            <Loader2 className="inline h-4 w-4 animate-spin" />
          ) : (
            <>
              Página {page} de {totalPages || 1}
            </>
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
