import { DataTable } from '@/components/tables/data-table';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import type { AuditoriaLogResponse } from './types/auditoria.types';
import { formatearFecha, formatearFechaHora } from '@/lib/format';

interface Props {
  data: { data: AuditoriaLogResponse[]; page: number; totalPages: number; total: number; limit: number } | undefined;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const OPERACION_LABEL: Record<string, string> = {
  CREATE: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación',
  RESTORE: 'Restauración',
  IMPORT: 'Importación',
  BULK_LOAD: 'Carga masiva',
};

const OPERACION_COLOR: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  RESTORE: 'bg-purple-100 text-purple-800',
  IMPORT: 'bg-orange-100 text-orange-800',
  BULK_LOAD: 'bg-gray-100 text-gray-800',
};

export function TablaAuditoria({ data, loading, onPageChange }: Props) {
  const columns: ColumnDef<AuditoriaLogResponse, any>[] = [
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }) => {
        const fecha = row.original.fecha;
        return (
          <div>
            <div className="text-sm">{formatearFecha(fecha)}</div>
            <div className="text-xs text-muted-foreground">
              {formatearFechaHora(fecha).split(' ')[1] ?? ''}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'modulo',
      header: 'Módulo',
      cell: ({ row }) => <Badge variant="outline">{row.original.modulo}</Badge>,
    },
    {
      accessorKey: 'operacion',
      header: 'Operación',
      cell: ({ row }) => {
        const op = row.original.operacion;
        return (
          <Badge className={OPERACION_COLOR[op] ?? 'bg-gray-100'}>
            {OPERACION_LABEL[op] ?? op}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'usuarioNombre',
      header: 'Usuario',
      cell: ({ row }) => row.original.usuarioNombre,
    },
    {
      accessorKey: 'entidad',
      header: 'Entidad',
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{row.original.entidad}</div>
          {row.original.entidadId && (
            <div className="text-xs text-muted-foreground">ID: {row.original.entidadId}</div>
          )}
        </div>
      ),
    },
  ];

  const paginacion = data
    ? {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
        onPageChange,
      }
    : undefined;

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      loading={loading}
      paginacion={paginacion}
    />
  );
}