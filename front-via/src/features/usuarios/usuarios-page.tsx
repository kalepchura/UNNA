import { useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { usuariosApi } from '@/lib/api/usuarios.api';
import { FiltrosUsuarios } from './filtros-usuarios';
import { TablaUsuarios } from './tabla-usuarios';
import { FormUsuario } from './form-usuario';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { FiltrosUsuarios as FiltrosType, Usuario } from './types/usuarios.types';

export function UsuariosPage() {
  const [filtros, setFiltros] = useState<FiltrosType>({ page: 1, limit: 20 });
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosType>({
    page: 1,
    limit: 20,
  });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState<Usuario | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de cuentas del sistema
          </p>
        </div>
        <Button onClick={handleNuevo}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo usuario
        </Button>
      </div>

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
          onSuccess={() => {
            setMostrarForm(false);
            handleBuscar();
          }}
        />
      )}
    </div>
  );
}