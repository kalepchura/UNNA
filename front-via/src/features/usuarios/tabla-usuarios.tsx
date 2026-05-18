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
import { usuariosApi } from '@/lib/api/usuarios.api';
import { MoreHorizontal, Pencil, Trash2, KeyRound } from 'lucide-react';
import { formatearFecha } from '@/lib/format';
import type { ColumnDef } from '@tanstack/react-table';
import type { Usuario } from './types/usuarios.types';

interface Props {
  data?: { data: Usuario[]; page: number; totalPages: number; total: number; limit: number };
  loading: boolean;
  onPageChange: (page: number) => void;
  onEditar: (usuario: Usuario) => void;
}

export function TablaUsuarios({ data, loading, onPageChange, onEditar }: Props) {
  const invalidate = useInvalidate();

  const desactivarMut = useApiMutation({
    mutationFn: (id: string) => usuariosApi.desactivar(id),
    onSuccess: () => invalidate(['usuarios']),
  });

  const resetMut = useApiMutation({
    mutationFn: (id: string) => usuariosApi.resetPassword(id),
    onSuccess: () => alert('Se ha enviado un correo de recuperación al usuario.'),
  });

  const columns: ColumnDef<Usuario, any>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'correo', header: 'Correo' },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: ({ row }) => (
        <Badge variant={row.original.rol === 'ADMINISTRADOR' ? 'default' : 'outline'}>
          {row.original.rol}
        </Badge>
      ),
    },
    {
      accessorKey: 'activo',
      header: 'Activo',
      cell: ({ row }) => (
        <Badge variant={row.original.activo ? 'default' : 'destructive'}>
          {row.original.activo ? 'Sí' : 'No'}
        </Badge>
      ),
    },
    {
      accessorKey: 'creadoEn',
      header: 'Creado',
      cell: ({ row }) => formatearFecha(row.original.creadoEn),
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditar(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {row.original.activo && (
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => desactivarMut.mutate(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Desactivar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => resetMut.mutate(row.original.id)}>
              <KeyRound className="mr-2 h-4 w-4" /> Resetear contraseña
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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