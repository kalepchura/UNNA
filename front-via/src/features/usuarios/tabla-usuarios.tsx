import { DataTable } from '@/components/tables/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useApiMutation } from '@/hooks/use-api-mutation';
import { useInvalidate } from '@/hooks/use-invalidate';
import { usuariosApi } from '@/lib/api/usuarios.api';

import {
  MoreHorizontal,
  Pencil,
  UserX,
  MailCheck,
  UserCheck,
} from 'lucide-react';

import { formatearFecha } from '@/lib/format';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { Usuario } from './types/usuarios.types';

interface Props {
  data?: {
    data: Usuario[];
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  loading: boolean;
  onPageChange: (page: number) => void;
  onEditar: (usuario: Usuario) => void;
}

export function TablaUsuarios({
  data,
  loading,
  onPageChange,
  onEditar,
}: Props) {
  const invalidate = useInvalidate();

  // ==========================================================
  // DESACTIVAR
  // ==========================================================
  const desactivarMut = useApiMutation({
    mutationFn: (id: string) =>
      usuariosApi.desactivar(id),
    onSuccess: () => {
      toast.success('Usuario desactivado');
      invalidate(['usuarios']);
    },
  });

  // ==========================================================
  // ACTIVAR
  // ==========================================================
  const activarMut = useApiMutation({
    mutationFn: (id: string) =>
      usuariosApi.activar(id),
    onSuccess: () => {
      toast.success('Usuario activado');
      invalidate(['usuarios']);
    },
  });

  // ==========================================================
  // REENVIAR INVITACIÓN
  // ==========================================================
  const reenviarMut = useApiMutation({
    mutationFn: (id: string) =>
      usuariosApi.reenviarInvitacion(id),
    onSuccess: () =>
      toast.success(
        'Invitación reenviada correctamente al correo del usuario.',
      ),
  });

  const columns: ColumnDef<Usuario, any>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span>{row.original.nombre}</span>

          {row.original.invitacionPendiente && (
            <span className="text-xs text-amber-500 font-medium">
              Invitación pendiente
            </span>
          )}
        </div>
      ),
    },

    {
      accessorKey: 'correo',
      header: 'Correo',
    },

    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.rol === 'ADMINISTRADOR'
              ? 'default'
              : 'outline'
          }
        >
          {row.original.rol === 'ADMINISTRADOR'
            ? 'Administrador'
            : 'Usuario'}
        </Badge>
      ),
    },

    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => {
        if (!row.original.activo) {
          return (
            <Badge variant="destructive">
              Inactivo
            </Badge>
          );
        }

        if (row.original.invitacionPendiente) {
          return (
            <Badge
              variant="outline"
              className="border-amber-400 text-amber-500"
            >
              Pendiente
            </Badge>
          );
        }

        return (
          <Badge variant="default">
            Activo
          </Badge>
        );
      },
    },

    {
      accessorKey: 'creadoEn',
      header: 'Creado',
      cell: ({ row }) =>
        formatearFecha(row.original.creadoEn),
    },

    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => {
        const u = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {/* EDITAR */}
              <DropdownMenuItem
                onClick={() => onEditar(u)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>

              {/* REENVIAR INVITACIÓN */}
              {u.invitacionPendiente && (
                <DropdownMenuItem
                  onClick={() =>
                    reenviarMut.mutate(u.id)
                  }
                  disabled={reenviarMut.isPending}
                >
                  <MailCheck className="mr-2 h-4 w-4" />
                  Reenviar invitación
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* ACTIVAR / DESACTIVAR */}
              {u.activo ? (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() =>
                    desactivarMut.mutate(u.id)
                  }
                  disabled={desactivarMut.isPending}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Desactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={() =>
                    activarMut.mutate(u.id)
                  }
                  disabled={activarMut.isPending}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
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