import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { desgasteApi } from '@/lib/api/desgaste.api';
import type { EscenarioResponse } from '../types/escenarios.types';

interface Props {
  escenario: EscenarioResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FormEscenario({ escenario, onClose, onSuccess }: Props) {
  const [nombre, setNombre] = useState(escenario?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(escenario?.descripcion ?? '');

  const crearMut = useApiMutation({
    mutationFn: () => desgasteApi.escenarios.crear({ nombre, descripcion }),
    onSuccess,
    mensajeExito: 'Escenario creado correctamente',
  });

  const actualizarMut = useApiMutation({
    mutationFn: () =>
      desgasteApi.escenarios.actualizar(escenario!.id, { nombre, descripcion }),
    onSuccess,
    mensajeExito: 'Escenario actualizado correctamente',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (escenario) actualizarMut.mutate(undefined);
    else crearMut.mutate(undefined);
  };

  // ✅ isPending, no isLoading
  const isPending = crearMut.isPending || actualizarMut.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {escenario ? 'Editar escenario' : 'Nuevo escenario'}
          </DialogTitle>
          {/* ✅ Requerido por Radix para accesibilidad */}
          <DialogDescription>
            {escenario
              ? 'Modifique los datos del escenario de tráfico.'
              : 'Complete los datos para crear un nuevo escenario de tráfico.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div>
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}