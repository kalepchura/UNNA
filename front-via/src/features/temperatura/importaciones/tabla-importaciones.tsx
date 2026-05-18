import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/tables/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useApiMutation } from '@/hooks/use-api-mutation';
import { useInvalidate } from '@/hooks/use-invalidate';

import { temperaturaApi } from '@/lib/api/temperatura.api';
import { useAuth } from '@/store/auth-context';

import {
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  RotateCcw,
} from 'lucide-react';

import type { PaginatedResponse } from '@/lib/types/common';

import type { ImportacionResponse } from '../types/importacion-types';

import { formatearFecha } from '@/lib/format';

interface Props {
  data?: PaginatedResponse<ImportacionResponse>;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function TablaImportaciones({
  data,
  isLoading,
  onPageChange,
}: Props) {
  const navigate = useNavigate();

  const { esAdmin } = useAuth();

  const invalidate = useInvalidate();

  const eliminarMut = useApiMutation({
    mutationFn: (id: number) =>
      temperaturaApi.importaciones.eliminar(id),

    onSuccess: () =>
      invalidate(['temperatura', 'importaciones']),
  });

  const restaurarMut = useApiMutation({
    mutationFn: (id: number) =>
      temperaturaApi.importaciones.restaurar(id),

    onSuccess: () =>
      invalidate(['temperatura', 'importaciones']),
  });

  const columns: ColumnDef<ImportacionResponse>[] = [
    {
      accessorKey: 'nombreArchivo',

      header: 'Archivo',

      cell: ({ row }) => (
        <span className="font-medium text-sm truncate max-w-[200px] block">
          {row.original.nombreArchivo}
        </span>
      ),
    },

    {
      accessorKey: 'tramoCodigo',

      header: 'Tramo',
    },

    {
      accessorKey: 'tipoArchivo',

      header: 'Tipo',

      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.tipoArchivo}
        </Badge>
      ),
    },

    {
      accessorKey: 'fechaSubida',

      header: 'Subido',

      cell: ({ row }) =>
        formatearFecha(row.original.fechaSubida),
    },

    {
      accessorKey: 'registrosValidos',

      header: 'Válidos',

      cell: ({ row }) => (
        <span className="text-green-600 font-medium">
          {row.original.registrosValidos}
        </span>
      ),
    },

    {
      accessorKey: 'registrosInvalidos',

      header: 'Inválidos',

      cell: ({ row }) => (
        <span className="text-red-600 font-medium">
          {row.original.registrosInvalidos}
        </span>
      ),
    },

    {
      id: 'acciones',

      header: '',

      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/temperatura/importaciones/${item.id}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver registros
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  temperaturaApi.importaciones
                    .obtenerUrlArchivo(item.id)
                    .then(({ url }) => {
                      window.open(url, '_blank');
                    });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar archivo
              </DropdownMenuItem>

              {!item.eliminado && (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() =>
                    eliminarMut.mutate(item.id)
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}

              {item.eliminado && esAdmin && (
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={() =>
                    restaurarMut.mutate(item.id)
                  }
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restaurar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      loading={isLoading}
      paginacion={{
        page: data?.page ?? 1,
        limit: data?.limit ?? 10,
        total: data?.total ?? 0,
        totalPages: data?.totalPages ?? 1,
        onPageChange,
      }}
    />
  );
}