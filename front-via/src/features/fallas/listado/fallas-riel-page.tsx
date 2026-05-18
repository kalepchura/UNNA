/**
 * Página de listado de fallas riel.
 * Junta: filtros + tabla + paginación + botón "nueva".
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { FiltrosRiel } from './filtros-riel';
import { ListadoRiel } from './listado-riel';
import {
  useFallasRiel,
  useEliminarFallaRiel,
} from '@/features/fallas/hooks/use-fallas-riel';
import type { FiltrosFallaRiel } from '@/features/fallas/types/falla-riel.types';

const FILTROS_INICIALES: FiltrosFallaRiel = {
  page: 1,
  limit: 20,
};

export function FallasRielPage() {
  const [filtros, setFiltros] = useState<FiltrosFallaRiel>(FILTROS_INICIALES);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const { data, isLoading } = useFallasRiel(filtros);
  const eliminarMut = useEliminarFallaRiel();

  const handleLimpiar = () => setFiltros(FILTROS_INICIALES);

  const handleConfirmarEliminar = async () => {
    if (idAEliminar == null) return;
    setEliminandoId(idAEliminar);
    try {
      await eliminarMut.mutateAsync(idAEliminar);
      toast.success('Falla eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar la falla');
      console.error(error);
    } finally {
      setEliminandoId(null);
      setIdAEliminar(null);
    }
  };

  const handlePagina = (nuevaPagina: number) => {
    setFiltros((prev) => ({ ...prev, page: nuevaPagina }));
  };

  return (
    <div className="pagina-fallas-riel p-4 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fallas de Riel</h1>
        <Button asChild>
          <Link to="/fallas/riel/nueva">+ Nueva falla</Link>
        </Button>
      </header>

      {/* Filtros */}
      <FiltrosRiel
        filtros={filtros}
        onChange={setFiltros}
        onLimpiar={handleLimpiar}
      />

      {/* Total */}
      {data && (
        <p className="text-sm text-muted-foreground">
          Mostrando {data.data.length} de {data.total} fallas
        </p>
      )}

      {/* Tabla */}
      <ListadoRiel
        fallas={data?.data ?? []}
        isLoading={isLoading}
        onEliminar={setIdAEliminar}
        eliminandoId={eliminandoId}
      />

      {/* Paginación */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={(filtros.page ?? 1) <= 1}
            onClick={() => handlePagina((filtros.page ?? 1) - 1)}
          >
            Anterior
          </Button>
          <span className="px-4 py-2">
            Página {data.page} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={(filtros.page ?? 1) >= data.totalPages}
            onClick={() => handlePagina((filtros.page ?? 1) + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Confirmación de eliminar */}
      <ConfirmDialog
        open={idAEliminar != null}
        onOpenChange={(open) => !open && setIdAEliminar(null)}
        titulo="Eliminar falla"
        descripcion="¿Estás seguro? La falla pasará a estado eliminado. Solo un administrador podrá restaurarla."
        etiquetaConfirmar="Eliminar"
        variante="destructive"
        onConfirmar={handleConfirmarEliminar}
      />
    </div>
  );
}