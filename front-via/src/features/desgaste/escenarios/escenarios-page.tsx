import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  RotateCcw,
  Eye,
} from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useInvalidate } from '@/hooks/use-invalidate';
import { desgasteApi } from '@/lib/api/desgaste.api';
import { useAuth } from '@/store/auth-context';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { PageHeader } from '@/components/layout/page-header';
import {
  DataCard,
  DataToolbar,
} from '@/components/shared/data-card';
import { SearchInput } from '@/components/shared/search-input';
import { DataTable } from '@/components/tables/data-table';

import { FormEscenario } from './form-escenario';
import type {
  EscenarioResponse,
  FiltrosEscenarios,
} from '../types/escenarios.types';

export function EscenariosPage() {
  const navigate = useNavigate();
  const { esAdmin } = useAuth();
  const invalidate = useInvalidate();

  const [filtros, setFiltros] = useState<FiltrosEscenarios>({
    page: 1,
    limit: 20,
  });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [escenarioEdit, setEscenarioEdit] =
    useState<EscenarioResponse | null>(null);

  const { data, isLoading } = useApiQuery({
    queryKey: ['desgaste', 'escenarios', filtros],
    queryFn: () => desgasteApi.escenarios.buscar(filtros),
  });

  const eliminarMut = useApiMutation({
    mutationFn: (id: number) => desgasteApi.escenarios.eliminar(id),
    onSuccess: () => invalidate(['desgaste', 'escenarios']),
    mensajeExito: 'Escenario eliminado',
  });

  const restaurarMut = useApiMutation({
    mutationFn: (id: number) => desgasteApi.escenarios.restaurar(id),
    onSuccess: () => invalidate(['desgaste', 'escenarios']),
    mensajeExito: 'Escenario restaurado',
  });

  const columns: ColumnDef<EscenarioResponse>[] = [
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
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) =>
        row.original.descripcion ? (
          <span className="text-muted-foreground">
            {row.original.descripcion}
          </span>
        ) : (
          <span className="text-xs italic text-muted-foreground/70">
            Sin descripción
          </span>
        ),
    },
    {
      accessorKey: 'esReal',
      header: 'Tipo',
      cell: ({ row }) =>
        row.original.esReal ? (
          <Badge variant="brand">REAL</Badge>
        ) : (
          <Badge variant="secondary">Proyección</Badge>
        ),
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.eliminado ? (
          <Badge variant="destructive">Eliminado</Badge>
        ) : (
          <Badge variant="success">Activo</Badge>
        ),
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/desgaste/escenarios/${item.id}/valores`)
                  }
                >
                  <Eye className="mr-2 h-4 w-4" /> Ver valores MTB
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setEscenarioEdit(item);
                    setMostrarForm(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                {!item.eliminado && !item.esReal && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => eliminarMut.mutate(item.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </>
                )}
                {item.eliminado && esAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => restaurarMut.mutate(item.id)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Restaurar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Escenarios MTB"
        subtitle="Gestión de escenarios de tráfico para proyección de desgaste"
        breadcrumb={[{ label: 'Desgaste' }, { label: 'Escenarios' }]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEscenarioEdit(null);
              setMostrarForm(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo escenario
          </Button>
        }
      />

      <DataCard>
        <DataToolbar>
          <SearchInput
            value={filtros.nombre ?? ''}
            onChange={(v) =>
              setFiltros((p) => ({ ...p, nombre: v || undefined, page: 1 }))
            }
            placeholder="Buscar por nombre…"
            minWidth={280}
          />
        </DataToolbar>

        <DataTable
          bare
          columns={columns}
          data={data?.data ?? []}
          loading={isLoading}
          mensajeVacio="No hay escenarios. Crea uno para empezar."
          paginacion={{
            page: data?.page ?? 1,
            limit: data?.limit ?? 20,
            total: data?.total ?? 0,
            totalPages: data?.totalPages ?? 1,
            onPageChange: (page) => setFiltros((p) => ({ ...p, page })),
          }}
        />
      </DataCard>

      {mostrarForm && (
        <FormEscenario
          escenario={escenarioEdit}
          onClose={() => setMostrarForm(false)}
          onSuccess={() => {
            setMostrarForm(false);
            invalidate(['desgaste', 'escenarios']);
          }}
        />
      )}
    </div>
  );
}
