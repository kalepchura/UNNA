/**
 * Página de listado de fallas soldadura inox.
 * Fase 4: Crear / Editar / Ver abren en un <Sheet/> (drawer lateral).
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

import { FiltrosSoldadura } from './filtros-soldadura';
import { ListadoSoldadura } from './listado-soldadura';
import { FallaSoldaduraFormPage } from '@/features/fallas/formulario/falla-soldadura-form-page';
import { FallaSoldaduraDetallePage } from '@/features/fallas/detalle/falla-soldadura-detalle-page';

import {
  useFallasSoldadura,
  useEliminarFallaSoldadura,
} from '@/features/fallas/hooks/use-fallas-soldadura';
import type { FiltrosFallaSoldadura } from '@/features/fallas/types/falla-soldadura.types';

const FILTROS_INICIALES: FiltrosFallaSoldadura = { page: 1, limit: 20 };

type SheetMode =
  | null
  | { mode: 'create' }
  | { mode: 'edit'; id: number }
  | { mode: 'view'; id: number };

export function FallasSoldaduraPage() {
  const [filtros, setFiltros] =
    useState<FiltrosFallaSoldadura>(FILTROS_INICIALES);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const [sheetState, setSheetState] = useState<SheetMode>(null);
  const closeSheet = () => setSheetState(null);

  const { data, isLoading } = useFallasSoldadura(filtros);
  const eliminarMut = useEliminarFallaSoldadura();

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

  const sheetTitle =
    sheetState?.mode === 'create'
      ? 'Nueva falla de soldadura Inox'
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
        title="Fallas de Soldadura Inox"
        subtitle="Listado y gestión de fallas detectadas en soldaduras"
        breadcrumb={[{ label: 'Fallas' }, { label: 'Soldadura Inox' }]}
        actions={
          <Button size="sm" onClick={() => setSheetState({ mode: 'create' })}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva falla
          </Button>
        }
      />

      <FiltrosSoldadura
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

        <ListadoSoldadura
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
              <FallaSoldaduraFormPage
                idOverride={null}
                onClose={closeSheet}
                onSuccess={() => closeSheet()}
              />
            )}
            {sheetState?.mode === 'edit' && (
              <FallaSoldaduraFormPage
                idOverride={sheetState.id}
                onClose={closeSheet}
                onSuccess={() => closeSheet()}
              />
            )}
            {sheetState?.mode === 'view' && (
              <FallaSoldaduraDetallePage
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
