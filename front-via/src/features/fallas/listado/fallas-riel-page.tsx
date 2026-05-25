/**
 * Página de listado de fallas riel.
 * Fase 4: Crear / Editar / Ver abren en un <Sheet/> (drawer lateral)
 * en lugar de navegar a otra página. Mejor UX, contexto preservado.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { PageHeader } from '@/components/layout/page-header';
import {
  DataCard,
  DataToolbar,
  DataPagination,
} from '@/components/shared/data-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

import { FiltrosRiel } from './filtros-riel';
import { ListadoRiel } from './listado-riel';
import { FallaRielFormPage } from '@/features/fallas/formulario/falla-riel-form-page';
import { FallaRielDetallePage } from '@/features/fallas/detalle/falla-riel-detalle-page';

import {
  useFallasRiel,
  useEliminarFallaRiel,
} from '@/features/fallas/hooks/use-fallas-riel';
import type { FiltrosFallaRiel } from '@/features/fallas/types/falla-riel.types';

const FILTROS_INICIALES: FiltrosFallaRiel = { page: 1, limit: 20 };

type SheetMode = null | { mode: 'create' } | { mode: 'edit'; id: number } | { mode: 'view'; id: number };

export function FallasRielPage() {
  const [filtros, setFiltros] = useState<FiltrosFallaRiel>(FILTROS_INICIALES);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  // Estado del Sheet (drawer)
  const [sheetState, setSheetState] = useState<SheetMode>(null);
  const closeSheet = () => setSheetState(null);

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

  const handlePagina = (n: number) => setFiltros((p) => ({ ...p, page: n }));

  // Computed: contenido del sheet según mode
  const sheetTitle =
    sheetState?.mode === 'create'
      ? 'Nueva falla de riel'
      : sheetState?.mode === 'edit'
        ? `Editar falla #${sheetState.id}`
        : sheetState?.mode === 'view'
          ? `Falla #${sheetState.id}`
          : '';

  const sheetDescription =
    sheetState?.mode === 'create'
      ? 'Completa los datos para registrar una nueva falla.'
      : sheetState?.mode === 'edit'
        ? 'Modifica los datos de la falla.'
        : sheetState?.mode === 'view'
          ? 'Detalle completo del registro.'
          : '';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fallas de Riel"
        subtitle="Listado y gestión de fallas detectadas en el riel"
        breadcrumb={[{ label: 'Fallas' }, { label: 'Riel' }]}
        actions={
          <Button size="sm" onClick={() => setSheetState({ mode: 'create' })}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva falla
          </Button>
        }
      />

      <FiltrosRiel
        filtros={filtros}
        onChange={setFiltros}
        onLimpiar={handleLimpiar}
      />

      <DataCard>
        <DataToolbar>
          <span className="text-sm text-muted-foreground">
            {data ? (
              <>
                Mostrando{' '}
                <span className="font-medium text-foreground tabular-nums">
                  {data.data.length}
                </span>{' '}
                de{' '}
                <span className="font-medium text-foreground tabular-nums">
                  {data.total}
                </span>{' '}
                fallas
              </>
            ) : (
              'Cargando…'
            )}
          </span>
        </DataToolbar>

        <ListadoRiel
          fallas={data?.data ?? []}
          isLoading={isLoading}
          onEliminar={setIdAEliminar}
          eliminandoId={eliminandoId}
          onVer={(id) => setSheetState({ mode: 'view', id })}
          onEditar={(id) => setSheetState({ mode: 'edit', id })}
        />

        {data && data.totalPages > 1 && (
          <DataPagination>
            <span className="text-muted-foreground">
              Página{' '}
              <span className="font-medium text-foreground tabular-nums">
                {data.page}
              </span>{' '}
              de{' '}
              <span className="font-medium text-foreground tabular-nums">
                {data.totalPages}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={(filtros.page ?? 1) <= 1}
                onClick={() => handlePagina((filtros.page ?? 1) - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(filtros.page ?? 1) >= data.totalPages}
                onClick={() => handlePagina((filtros.page ?? 1) + 1)}
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </DataPagination>
        )}
      </DataCard>

      {/* ── SHEET: Crear / Editar / Ver ── */}
      <Sheet
        open={sheetState !== null}
        onOpenChange={(open) => !open && closeSheet()}
      >
        <SheetContent side="right" size="2xl" className="sm:max-w-4xl">
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            {sheetDescription && (
              <SheetDescription>{sheetDescription}</SheetDescription>
            )}
          </SheetHeader>
          <SheetBody>
            {sheetState?.mode === 'create' && (
              <FallaRielFormPage
                idOverride={null}
                onClose={closeSheet}
                onSuccess={() => closeSheet()}
              />
            )}
            {sheetState?.mode === 'edit' && (
              <FallaRielFormPage
                idOverride={sheetState.id}
                onClose={closeSheet}
                onSuccess={() => closeSheet()}
              />
            )}
            {sheetState?.mode === 'view' && (
              <FallaRielDetallePage
                idOverride={sheetState.id}
                onClose={closeSheet}
                onEditar={(id) => setSheetState({ mode: 'edit', id })}
              />
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>

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
