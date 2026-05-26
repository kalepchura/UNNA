/**
 * Modal de crear/editar acción riel.
 *
 * Envuelve AccionRielForm en un Dialog de shadcn/ui.
 *
 * Responsabilidades:
 *  - Mostrar título/descripción según modo (crear/editar)
 *  - Disparar el mutation correcto (crearMut o actualizarMut)
 *  - Cerrar el modal al éxito
 *
 * Es un componente "contenedor" — la lógica de form está en
 * AccionRielForm. La invalidación de queries está en los hooks
 * (use-acciones-riel.ts).
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { AccionRielForm } from './accion-riel-form';
import {
  useCrearAccionRiel,
  useActualizarAccionRiel,
} from '@/features/fallas/hooks/use-acciones-riel';
import type {
  AccionRielResponse,
  CrearAccionRielDto,
  ActualizarAccionRielDto,
} from '@/features/fallas/types/accion-riel.types';

interface AccionRielModalProps {
  /** Si está abierto o cerrado. */
  open: boolean;
  /** Handler para cambiar el estado open/closed. */
  onOpenChange: (open: boolean) => void;
  /** ID de la falla padre (necesario para crear y para invalidar). */
  fallaId: number;
  /**
   * Acción a editar. Si es null/undefined, el modal está en modo CREAR.
   * Si tiene valor, el modal está en modo EDITAR.
   */
  accionActual?: AccionRielResponse | null;
}

export function AccionRielModal({
  open,
  onOpenChange,
  fallaId,
  accionActual,
}: AccionRielModalProps) {
  const esEdicion = !!accionActual;

  const crearMut = useCrearAccionRiel();
  const actualizarMut = useActualizarAccionRiel();

  const isPending = crearMut.isPending || actualizarMut.isPending;

  const handleSubmit = async (
    dto: CrearAccionRielDto | ActualizarAccionRielDto,
  ) => {
    try {
      if (esEdicion && accionActual) {
        await actualizarMut.mutateAsync({
          id: accionActual.id,
          fallaId,
          dto: dto as ActualizarAccionRielDto,
        });
      } else {
        await crearMut.mutateAsync({
          fallaId,
          dto: dto as CrearAccionRielDto,
        });
      }
      onOpenChange(false);
    } catch {
      // El toast de error ya lo muestra useApiMutation.
      // Mantenemos el modal abierto para que el usuario corrija.
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* sm:max-w-lg porque el form tiene 5 campos en grid de 2 columnas */}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? 'Editar acción' : 'Registrar nueva acción'}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Actualiza los datos de esta intervención.'
              : 'Registra una intervención de mantenimiento sobre esta falla.'}
          </DialogDescription>
        </DialogHeader>

        <AccionRielForm
          accionActual={accionActual}
          isPending={isPending}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}