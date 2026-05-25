import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

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

  const isPending = crearMut.isPending || actualizarMut.isPending;
  const formId = 'form-escenario';

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" size="md">
        <SheetHeader>
          <SheetTitle>
            {escenario ? 'Editar escenario' : 'Nuevo escenario'}
          </SheetTitle>
          <SheetDescription>
            {escenario
              ? 'Modifique los datos del escenario de tráfico.'
              : 'Complete los datos para crear un nuevo escenario de tráfico.'}
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          <form id={formId} onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="esc-nombre">Nombre</Label>
              <Input
                id="esc-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                maxLength={100}
                placeholder="Ej: Escenario base 2025"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="esc-descripcion">Descripción (opcional)</Label>
              <Textarea
                id="esc-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Notas o supuestos del escenario…"
                rows={4}
              />
            </div>
          </form>
        </SheetBody>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
