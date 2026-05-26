import { useState } from 'react';
import { Plus } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { useInvalidate } from '@/hooks/use-invalidate';
import { usuariosApi } from '@/lib/api/usuarios.api';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

import { FiltrosUsuarios } from './filtros-usuarios';
import { TablaUsuarios } from './tabla-usuarios';
import { FormUsuario } from './form-usuario';
import type {
  FiltrosUsuarios as FiltrosType,
  Usuario,
} from './types/usuarios.types';

export function UsuariosPage() {
  const [filtros, setFiltros] = useState<FiltrosType>({ page: 1, limit: 20 });
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosType>({
    page: 1,
    limit: 20,
  });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState<Usuario | null>(null);

  const invalidate = useInvalidate();

  const { data, isLoading } = useApiQuery({
    queryKey: ['usuarios', filtrosAplicados],
    queryFn: () => usuariosApi.listar(filtrosAplicados),
  });

  const handleBuscar = () => {
    setFiltrosAplicados({ ...filtros, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFiltrosAplicados((prev) => ({ ...prev, page }));
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioEdit(usuario);
    setMostrarForm(true);
  };

  const handleNuevo = () => {
    setUsuarioEdit(null);
    setMostrarForm(true);
  };

  // ✅ FIX: invalidar el cache de 'usuarios' fuerza el refetch
  // independientemente de si los filtros cambiaron o no.
  // Antes se usaba handleBuscar() que no refetchea si la queryKey
  // no cambió (mismo objeto de filtros → TanStack Query lo ignora).
  const handleFormSuccess = () => {
    setMostrarForm(false);
    invalidate(['usuarios']);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de cuentas del sistema"
        breadcrumb={[{ label: 'Administración' }, { label: 'Usuarios' }]}
        actions={
          <Button size="sm" onClick={handleNuevo}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo usuario
          </Button>
        }
      />

      <FiltrosUsuarios
        filtros={filtros}
        onChange={setFiltros}
        onBuscar={handleBuscar}
        isLoading={isLoading}
      />

      <TablaUsuarios
        data={data}
        loading={isLoading}
        onPageChange={handlePageChange}
        onEditar={handleEditar}
      />

      {mostrarForm && (
        <FormUsuario
          usuario={usuarioEdit}
          onClose={() => setMostrarForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}