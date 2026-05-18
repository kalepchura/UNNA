import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useInvalidate } from '@/hooks/use-invalidate';
import { desgasteApi } from '@/lib/api/desgaste.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/tables/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/store/auth-context';
import { Plus, MoreHorizontal, Pencil, Trash2, RotateCcw, Eye } from 'lucide-react';
import { FormEscenario } from './form-escenario';
import type { EscenarioResponse, FiltrosEscenarios } from '../types/escenarios.types';

export function EscenariosPage() {
  const navigate = useNavigate();
  const { esAdmin } = useAuth();
  const invalidate = useInvalidate();

  const [filtros, setFiltros] = useState<FiltrosEscenarios>({ page: 1, limit: 20 });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [escenarioEdit, setEscenarioEdit] = useState<EscenarioResponse | null>(null);

  const { data, isLoading } = useApiQuery({
    queryKey: ['desgaste', 'escenarios', filtros],
    queryFn: () => desgasteApi.escenarios.buscar(filtros),
  });

  const eliminarMut = useApiMutation({
    mutationFn: (id: number) => desgasteApi.escenarios.eliminar(id),
    onSuccess: () => invalidate(['desgaste', 'escenarios']),
  });

  const restaurarMut = useApiMutation({
    mutationFn: (id: number) => desgasteApi.escenarios.restaurar(id),
    onSuccess: () => invalidate(['desgaste', 'escenarios']),
  });

  // ✅ ColumnDef de TanStack, no Column personalizado
  const columns: ColumnDef<EscenarioResponse>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.nombre}</span>
      ),
    },
    {
      accessorKey: 'esReal',
      header: 'Tipo',
      cell: ({ row }) =>
        row.original.esReal
          ? <Badge>REAL</Badge>
          : <Badge variant="secondary">Proyección</Badge>,
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
                onClick={() => navigate(`/desgaste/escenarios/${item.id}/valores`)}
              >
                <Eye className="mr-2 h-4 w-4" /> Ver valores MTB
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setEscenarioEdit(item); setMostrarForm(true); }}
              >
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              {!item.eliminado && !item.esReal && (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => eliminarMut.mutate(item.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              )}
              {item.eliminado && esAdmin && (
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={() => restaurarMut.mutate(item.id)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Restaurar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Escenarios MTB</h1>
          <p className="text-sm text-muted-foreground">Gestión de escenarios de tráfico</p>
        </div>
        <Button onClick={() => { setEscenarioEdit(null); setMostrarForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo escenario
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por nombre..."
          value={filtros.nombre ?? ''}
          onChange={(e) =>
            setFiltros({ ...filtros, nombre: e.target.value || undefined })
          }
          className="max-w-sm"
        />
        <Button
          onClick={() => setFiltros((p) => ({ ...p, page: 1 }))}
          disabled={isLoading}
        >
          Buscar
        </Button>
      </div>

      {/* ✅ Props correctas del DataTable real */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        paginacion={{
          page: data?.page ?? 1,
          limit: data?.limit ?? 20,
          total: data?.total ?? 0,
          totalPages: data?.totalPages ?? 1,
          onPageChange: (page) => setFiltros((p) => ({ ...p, page })),
        }}
      />

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