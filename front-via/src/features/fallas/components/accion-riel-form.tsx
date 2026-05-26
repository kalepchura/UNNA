/**
 * Formulario de crear/editar acción riel.
 *
 * Compacto: 5 campos (accion, conclusion, pt, fechaEjecucion, observaciones).
 *
 * Patrones aplicados (consistentes con el resto de la app):
 *  - react-hook-form + zodResolver
 *  - Controller + key para Selects (anti-bug de re-render)
 *  - Toda la validación en Zod (mensajes en español)
 *  - Envío con helper opt() para limpiar strings vacíos
 *
 * Usado por AccionRielModal, que provee el contexto (crear vs editar)
 * y maneja el cierre tras éxito.
 */

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  AccionRiel,
  EstadoFalla,
  LABEL_ACCION_RIEL,
  LABEL_ESTADO_FALLA,
} from '@/lib/types/enums/fallas.enum';
import type {
  AccionRielResponse,
  CrearAccionRielDto,
  ActualizarAccionRielDto,
} from '@/features/fallas/types/accion-riel.types';

// ============================================================
// SCHEMA
// ============================================================

const accionRielSchema = z.object({
  accion: z.nativeEnum(AccionRiel, {
    message: 'Selecciona un tipo de acción',
  }),
  conclusion: z.nativeEnum(EstadoFalla, {
    message: 'Selecciona un estado',
  }),
  // PT y fechaEjecucion pueden venir vacíos
  pt: z.string().max(50, 'Máx 50 caracteres').optional(),
  fechaEjecucion: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      'Formato: YYYY-MM-DD',
    ),
  observaciones: z.string().max(2000, 'Máx 2000 caracteres').optional(),
});

type AccionRielFormData = z.infer<typeof accionRielSchema>;

// ============================================================
// PROPS
// ============================================================

interface AccionRielFormProps {
  /** Si se provee, el form está en modo EDITAR. Si null/undefined, modo CREAR. */
  accionActual?: AccionRielResponse | null;
  /** Si la mutation está pendiente — bloquea botones. */
  isPending: boolean;
  /** Callback cuando el usuario confirma. Recibe el DTO listo para enviar. */
  onSubmit: (dto: CrearAccionRielDto | ActualizarAccionRielDto) => void;
  /** Callback cuando el usuario cancela. */
  onCancel: () => void;
}

// ============================================================
// COMPONENTE
// ============================================================

export function AccionRielForm({
  accionActual,
  isPending,
  onSubmit,
  onCancel,
}: AccionRielFormProps) {
  const esEdicion = !!accionActual;

  const form = useForm<AccionRielFormData>({
    resolver: zodResolver(accionRielSchema),
    mode: 'onSubmit',
    defaultValues: {
      accion: undefined,
      conclusion: EstadoFalla.PROGRAMADO, // Default sensato: la mayoría de acciones arrancan PROGRAMADO
      pt: '',
      fechaEjecucion: '',
      observaciones: '',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = form;

  // Reset cuando cambia accionActual (al abrir el modal en modo editar)
  useEffect(() => {
    if (accionActual) {
      reset({
        accion: accionActual.accion,
        conclusion: accionActual.conclusion,
        pt: accionActual.pt ?? '',
        fechaEjecucion: accionActual.fechaEjecucion
          ? accionActual.fechaEjecucion.split('T')[0]
          : '',
        observaciones: accionActual.observaciones ?? '',
      });
    } else {
      reset({
        accion: undefined,
        conclusion: EstadoFalla.PROGRAMADO,
        pt: '',
        fechaEjecucion: '',
        observaciones: '',
      });
    }
  }, [accionActual, reset]);

  const handleFormSubmit = (data: AccionRielFormData) => {
    // Helper: string vacío → undefined (no enviar al backend)
    const opt = (v: string | undefined): string | undefined =>
      v === '' || v === undefined ? undefined : v;

    const payload: CrearAccionRielDto = {
      accion: data.accion,
      conclusion: data.conclusion,
      pt: opt(data.pt),
      fechaEjecucion: opt(data.fechaEjecucion),
      observaciones: opt(data.observaciones),
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
      id="accion-riel-form"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tipo de acción */}
        <div className="form-campo">
          <Label>Tipo de acción *</Label>
          <Controller
            name="accion"
            control={control}
            render={({ field }) => (
              <Select
                key={`accion-${field.value}`}
                value={field.value ?? ''}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una acción" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LABEL_ACCION_RIEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.accion && (
            <p className="text-sm text-destructive mt-1">
              {errors.accion.message}
            </p>
          )}
        </div>

        {/* Estado / conclusión */}
        <div className="form-campo">
          <Label>Estado *</Label>
          <Controller
            name="conclusion"
            control={control}
            render={({ field }) => (
              <Select
                key={`conclusion-${field.value}`}
                value={field.value ?? ''}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LABEL_ESTADO_FALLA).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.conclusion && (
            <p className="text-sm text-destructive mt-1">
              {errors.conclusion.message}
            </p>
          )}
        </div>

        {/* PT (Código de Orden de Trabajo) */}
        <div className="form-campo">
          <Label htmlFor="pt">PT / Orden de trabajo</Label>
          <Input
            id="pt"
            type="text"
            maxLength={50}
            placeholder="Ej: GYMF-1785461"
            disabled={isPending}
            {...register('pt')}
          />
          {errors.pt && (
            <p className="text-sm text-destructive mt-1">{errors.pt.message}</p>
          )}
        </div>

        {/* Fecha de ejecución */}
        <div className="form-campo">
          <Label htmlFor="fechaEjecucion">Fecha de ejecución</Label>
          <Input
            id="fechaEjecucion"
            type="date"
            disabled={isPending}
            {...register('fechaEjecucion')}
          />
          {errors.fechaEjecucion && (
            <p className="text-sm text-destructive mt-1">
              {errors.fechaEjecucion.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Dejar en blanco si aún no se programó.
          </p>
        </div>
      </div>

      {/* Observaciones */}
      <div className="form-campo">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          rows={3}
          placeholder="Detalles, motivos, hallazgos..."
          disabled={isPending}
          {...register('observaciones')}
        />
        {errors.observaciones && (
          <p className="text-sm text-destructive mt-1">
            {errors.observaciones.message}
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? 'Guardando...'
            : esEdicion
              ? 'Guardar cambios'
              : 'Registrar acción'}
        </Button>
      </div>
    </form>
  );
}