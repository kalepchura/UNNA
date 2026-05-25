/**
 * Formulario de Falla Soldadura Inox — CREAR y EDITAR.
 *
 * 🔑 FIX edición: reset() en lugar de values prop para garantizar
 *    que los Controller se actualicen correctamente.
 * 🔑 Validación: mode 'onSubmit' (errores solo al guardar).
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/forms/combobox';

import { DatoCalculado } from '@/features/fallas/components/dato-calculado';
import { BannerCreado } from '@/features/fallas/components/banner-creado';
import { ImagenesUploader } from '@/features/fallas/components/imagenes-uploader';
import { ImagenesGaleria } from '@/features/fallas/detalle/imagenes-galeria';

import {
  useFallaSoldadura,
  useCrearFallaSoldadura,
  useActualizarFallaSoldadura,
} from '@/features/fallas/hooks/use-fallas-soldadura';
import { useCambiaviasOptions } from '@/hooks/use-cambiavias-options';
import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import { UbicacionFalla, AccionFalla } from '@/lib/types/common';

import type {
  CrearFallaSoldaduraDto,
  ActualizarFallaSoldaduraDto,
} from '@/features/fallas/types/falla-soldadura.types';

const TEXTO_POR_DEFINIR = 'Por definir';
const TEXTO_TANGENTE = 'Tangente';

const fallaSoldaduraSchema = z.object({
  cambiaviaId: z
    .number({ message: 'Selecciona un cambiavía' })
    .int()
    .min(1, 'Selecciona un cambiavía'),
  fechaDeteccion: z
    .string()
    .min(1, 'La fecha es obligatoria')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  ubicacionFalla: z.nativeEnum(UbicacionFalla, {
    message: 'Selecciona la ubicación',
  }),
  accion: z.nativeEnum(AccionFalla, { message: 'Selecciona una acción' }),
  observacion: z.string().max(2000, 'Máx 2000 caracteres').optional(),
  ensayo: z.string().max(2000, 'Máx 2000 caracteres').optional(),
  pt: z.string().max(50, 'Máx 50 caracteres').optional(),
});

type FormData = z.infer<typeof fallaSoldaduraSchema>;

function useDatosCambiavia(cambiaviaId: number | null) {
  const habilitado = cambiaviaId !== null && cambiaviaId > 0;

  const { data: cambiavias = [], isLoading: cargandoCambiavias } = useApiQuery({
    queryKey: queryKeys.catalogos.cambiaviasTabla,
    queryFn: () => catalogosApi.cambiavias.listarParaTabla(),
    enabled: habilitado,
  });

  const { data: tramos = [] } = useApiQuery({
    queryKey: queryKeys.catalogos.tramosTabla,
    queryFn: () => catalogosApi.tramos.listarParaTabla(),
    enabled: habilitado,
  });

  const { data: curvasH = [] } = useApiQuery({
    queryKey: queryKeys.catalogos.curvasHorizontalesTabla,
    queryFn: () => catalogosApi.curvasHorizontales.listarParaTabla(),
    enabled: habilitado,
  });

  const { data: curvasV = [] } = useApiQuery({
    queryKey: queryKeys.catalogos.curvasVerticalesTabla,
    queryFn: () => catalogosApi.curvasVerticales.listarParaTabla(),
    enabled: habilitado,
  });

  if (!habilitado) {
    return {
      cambiavia: null,
      tramo: null,
      curvaH: null,
      curvaV: null,
      cargando: false,
    };
  }

  const cambiavia = cambiavias.find((c) => c.id === cambiaviaId) ?? null;
  const tramo = cambiavia
    ? (tramos.find((t) => t.id === cambiavia.tramoId) ?? null)
    : null;
  const curvaH = cambiavia?.curvaHorizontalId
    ? (curvasH.find((c) => c.id === cambiavia.curvaHorizontalId) ?? null)
    : null;
  const curvaV = cambiavia?.curvaVerticalId
    ? (curvasV.find((c) => c.id === cambiavia.curvaVerticalId) ?? null)
    : null;

  return { cambiavia, tramo, curvaH, curvaV, cargando: cargandoCambiavias };
}

function SeccionImagenes({ fallaId }: { fallaId: number }) {
  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Imágenes</h2>
      <ImagenesUploader fallaId={fallaId} />
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">Imágenes ya subidas</p>
        <ImagenesGaleria fallaId={fallaId} />
      </div>
    </Card>
  );
}

interface FallaSoldaduraFormPageProps {
  /** Si se provee, el formulario corre en "modo embebido" (sin ruta). */
  idOverride?: number | null;
  /** Callback cuando se cierra (X / Cancelar). */
  onClose?: () => void;
  /** Callback cuando se completa con éxito. */
  onSuccess?: (id: number) => void;
}

export function FallaSoldaduraFormPage(props: FallaSoldaduraFormPageProps = {}) {
  const { idOverride, onClose, onSuccess } = props;
  const isEmbedded = idOverride !== undefined || !!onClose || !!onSuccess;

  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fallaId =
    idOverride !== undefined
      ? idOverride
      : idParam
        ? Number(idParam)
        : null;
  const esEdicion = fallaId != null && fallaId > 0;

  const { data: fallaActual, isLoading: cargandoFalla } = useFallaSoldadura(
    fallaId ?? 0,
    esEdicion,
  );

  const { options: cambiaviasOptions, isLoading: cargandoOpciones } =
    useCambiaviasOptions();

  const crearMut = useCrearFallaSoldadura();
  const actualizarMut = useActualizarFallaSoldadura();

  const [fallaIdCreada, setFallaIdCreada] = useState<number | null>(null);

  // 🔑 FORMULARIO con reset en lugar de values prop
  const form = useForm<FormData>({
    resolver: zodResolver(fallaSoldaduraSchema),
    mode: 'onSubmit',
    defaultValues: {
      cambiaviaId: 0,
      fechaDeteccion: '',
      ubicacionFalla: undefined,
      accion: undefined,
      observacion: '',
      ensayo: '',
      pt: '',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = form;

  // 🔑 RESET cuando se carga la falla a editar
  useEffect(() => {
    if (esEdicion && fallaActual) {
      console.log('🔄 Reseteando formulario soldadura con datos:', {
        cambiaviaId: fallaActual.cambiaviaId,
        ubicacionFalla: fallaActual.ubicacionFalla,
        accion: fallaActual.accion,
      });
      
      reset({
        cambiaviaId: fallaActual.cambiaviaId,
        fechaDeteccion: fallaActual.fechaDeteccion.split('T')[0],
        ubicacionFalla: fallaActual.ubicacionFalla,
        accion: fallaActual.accion,
        observacion: fallaActual.observacion ?? '',
        ensayo: fallaActual.ensayo ?? '',
        pt: fallaActual.pt ?? '',
      });
    }
  }, [esEdicion, fallaActual, reset]);

  const cambiaviaIdActual = watch('cambiaviaId');

  const { cambiavia, tramo, curvaH, curvaV, cargando } = useDatosCambiavia(
    cambiaviaIdActual > 0 ? cambiaviaIdActual : null,
  );

  const onSubmit = async (data: FormData) => {
    if (esEdicion) {
      const dto: ActualizarFallaSoldaduraDto = {
        cambiaviaId: data.cambiaviaId,
        fechaDeteccion: data.fechaDeteccion,
        ubicacionFalla: data.ubicacionFalla,
        accion: data.accion,
        observacion: data.observacion || undefined,
        ensayo: data.ensayo || undefined,
        pt: data.pt || undefined,
      };
      const actualizada = await actualizarMut.mutateAsync({
        id: fallaId!,
        dto,
      });
      if (onSuccess) {
        onSuccess(actualizada.id);
      } else {
        navigate(`/fallas/soldadura/${actualizada.id}`);
      }
    } else {
      const dto: CrearFallaSoldaduraDto = {
        cambiaviaId: data.cambiaviaId,
        fechaDeteccion: data.fechaDeteccion,
        ubicacionFalla: data.ubicacionFalla,
        accion: data.accion,
        observacion: data.observacion || undefined,
        ensayo: data.ensayo || undefined,
        pt: data.pt || undefined,
      };
      const creada = await crearMut.mutateAsync(dto);
      setFallaIdCreada(creada.id);
    }
  };

  const idParaImagenes = esEdicion ? fallaId : fallaIdCreada;
  const mostrarImagenes = idParaImagenes !== null;

  const hayCambiavia = cambiavia !== null;
  const textoCodigo = !hayCambiavia
    ? TEXTO_POR_DEFINIR
    : (cambiavia!.codigoBd ?? '—');
  const textoDescripcion = !hayCambiavia
    ? TEXTO_POR_DEFINIR
    : (cambiavia!.descripcion ?? '—');
  const textoTipo = !hayCambiavia ? TEXTO_POR_DEFINIR : (cambiavia!.tipo ?? '—');
  const textoNorma = !hayCambiavia
    ? TEXTO_POR_DEFINIR
    : (cambiavia!.norma ?? '—');
  const textoVia = !hayCambiavia ? TEXTO_POR_DEFINIR : cambiavia!.via;
  const textoProgresiva = !hayCambiavia
    ? TEXTO_POR_DEFINIR
    : `${cambiavia!.progresiva} m`;
  const textoVelocidad = !hayCambiavia
    ? TEXTO_POR_DEFINIR
    : cambiavia!.velocidadKmh !== undefined
      ? `${cambiavia!.velocidadKmh} km/h`
      : '—';
  const textoTramo = !hayCambiavia
    ? TEXTO_POR_DEFINIR
    : tramo
      ? `${tramo.codigo} — ${tramo.nombre}`
      : '—';
  const textoCurvaH = !hayCambiavia
    ? TEXTO_POR_DEFINIR
    : curvaH
      ? curvaH.nombre
      : TEXTO_TANGENTE;
  const textoCurvaV = !hayCambiavia
    ? TEXTO_POR_DEFINIR
    : curvaV
      ? curvaV.nombre
      : TEXTO_TANGENTE;

  const mostrarBotones = esEdicion || fallaIdCreada === null;

  if (esEdicion && cargandoFalla) {
    return <p className="p-4">Cargando falla...</p>;
  }

  if (esEdicion && !fallaActual) {
    return (
      <div className="p-4 space-y-2">
        <p>Falla no encontrada.</p>
        {onClose ? (
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/fallas/soldadura">Volver al listado</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={isEmbedded ? 'space-y-4' : 'pagina-form-soldadura p-4 space-y-4'}>
      {!isEmbedded && (
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {esEdicion
              ? `Editar Falla Soldadura #${fallaId}`
              : 'Nueva Falla de Soldadura'}
          </h1>
          <Button asChild variant="outline">
            <Link to="/fallas/soldadura">Cancelar</Link>
          </Button>
        </header>
      )}

      {fallaIdCreada !== null && !esEdicion && (
        <BannerCreado
          fallaId={fallaIdCreada}
          mensaje="Falla creada correctamente"
          rutaDetalle={`/fallas/soldadura/${fallaIdCreada}`}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ── CAMBIAVÍA ── */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Cambiavía *</h2>
          <div className="form-campo">
            <Label>Seleccionar cambiavía</Label>
            {/* 🔑 Combobox con Controller - con key para forzar re-render */}
            <Controller
              name="cambiaviaId"
              control={control}
              render={({ field }) => (
                <Combobox
                  key={`cambiavia-${field.value}`}
                  options={cambiaviasOptions}
                  value={field.value > 0 ? String(field.value) : undefined}
                  onChange={(v) => field.onChange(Number(v))}
                  placeholder={
                    cargandoOpciones ? 'Cargando...' : 'Seleccione un cambiavía'
                  }
                  searchPlaceholder="Buscar por código..."
                  disabled={cargandoOpciones || fallaIdCreada !== null}
                />
              )}
            />
            {errors.cambiaviaId && (
              <p className="text-sm text-destructive mt-1">
                {errors.cambiaviaId.message}
              </p>
            )}
          </div>
        </Card>

        {/* ── DATOS HEREDADOS ── */}
        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-semibold">
            Datos heredados del cambiavía
          </h2>
          {cargando && cambiaviaIdActual > 0 ? (
            <p className="text-sm text-muted-foreground">
              Cargando datos del cambiavía...
            </p>
          ) : (
            <>
              <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Información del cambiavía
                </p>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-sm">
                  <DatoCalculado
                    label="Código"
                    valor={textoCodigo}
                    indefinido={!hayCambiavia}
                  />
                  <DatoCalculado
                    label="Descripción"
                    valor={textoDescripcion}
                    indefinido={!hayCambiavia}
                  />
                  <DatoCalculado
                    label="Tipo"
                    valor={textoTipo}
                    indefinido={!hayCambiavia}
                  />
                  <DatoCalculado
                    label="Norma"
                    valor={textoNorma}
                    indefinido={!hayCambiavia}
                  />
                  <DatoCalculado
                    label="Vía"
                    valor={textoVia}
                    indefinido={!hayCambiavia}
                  />
                  <DatoCalculado
                    label="Velocidad"
                    valor={textoVelocidad}
                    indefinido={!hayCambiavia}
                  />
                </div>
              </div>

              <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Ubicación geográfica
                </p>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-sm">
                  <DatoCalculado
                    label="Progresiva"
                    valor={textoProgresiva}
                    indefinido={!hayCambiavia}
                  />
                  <DatoCalculado
                    label="Tramo"
                    valor={textoTramo}
                    indefinido={!hayCambiavia || !tramo}
                  />
                </div>
              </div>

              <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Curvas asociadas
                </p>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <DatoCalculado
                    label="Curva Horizontal"
                    valor={textoCurvaH}
                    indefinido={!hayCambiavia}
                  />
                  <DatoCalculado
                    label="Curva Vertical"
                    valor={textoCurvaV}
                    indefinido={!hayCambiavia}
                  />
                </div>
              </div>
            </>
          )}
        </Card>

        {/* ── DATOS DE LA FALLA ── */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Datos de la falla</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-campo">
              <Label htmlFor="fechaDeteccion">Fecha de detección *</Label>
              <Input
                id="fechaDeteccion"
                type="date"
                disabled={fallaIdCreada !== null}
                {...register('fechaDeteccion')}
              />
              {errors.fechaDeteccion && (
                <p className="text-sm text-destructive mt-1">
                  {errors.fechaDeteccion.message}
                </p>
              )}
            </div>

            {/* 🔑 Ubicación con Controller - con key para forzar re-render */}
            <div className="form-campo">
              <Label>Ubicación de falla *</Label>
              <Controller
                name="ubicacionFalla"
                control={control}
                render={({ field }) => (
                  <Select
                    key={`ubicacion-${field.value}`}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={fallaIdCreada !== null}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UbicacionFalla.ALMA}>Alma</SelectItem>
                      <SelectItem value={UbicacionFalla.PATIN}>
                        Patín
                      </SelectItem>
                      <SelectItem value={UbicacionFalla.HONGO}>
                        Hongo
                      </SelectItem>
                      <SelectItem value={UbicacionFalla.RIEL}>Riel</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ubicacionFalla && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ubicacionFalla.message}
                </p>
              )}
            </div>

            {/* 🔑 Acción con Controller - con key para forzar re-render */}
            <div className="form-campo">
              <Label>Acción *</Label>
              <Controller
                name="accion"
                control={control}
                render={({ field }) => (
                  <Select
                    key={`accion-${field.value}`}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={fallaIdCreada !== null}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una acción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AccionFalla.CONSOLIDADO}>
                        Consolidado
                      </SelectItem>
                      <SelectItem value={AccionFalla.POR_DEFINIR}>
                        Por definir
                      </SelectItem>
                      <SelectItem value={AccionFalla.SUSTITUIDO}>
                        Sustituido
                      </SelectItem>
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

            <div className="form-campo">
              <Label htmlFor="pt">Código de ensayo (PT)</Label>
              <Input
                id="pt"
                placeholder="Ej: PT-2024-001"
                disabled={fallaIdCreada !== null}
                {...register('pt')}
              />
              {errors.pt && (
                <p className="text-sm text-destructive mt-1">
                  {errors.pt.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* ── NOTAS Y ENSAYO ── */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Notas y ensayo (opcional)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-campo">
              <Label htmlFor="observacion">Observación</Label>
              <Textarea
                id="observacion"
                rows={4}
                placeholder="Descripción libre..."
                disabled={fallaIdCreada !== null}
                {...register('observacion')}
              />
              {errors.observacion && (
                <p className="text-sm text-destructive mt-1">
                  {errors.observacion.message}
                </p>
              )}
            </div>

            <div className="form-campo">
              <Label htmlFor="ensayo">Ensayo</Label>
              <Textarea
                id="ensayo"
                rows={4}
                placeholder="Resultados del ensayo..."
                disabled={fallaIdCreada !== null}
                {...register('ensayo')}
              />
              {errors.ensayo && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ensayo.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {mostrarImagenes && <SeccionImagenes fallaId={idParaImagenes!} />}

        {mostrarBotones && (
          <div className="flex justify-end gap-2">
            {onClose ? (
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
            ) : (
              <Button asChild variant="outline" type="button">
                <Link to="/fallas/soldadura">Cancelar</Link>
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : esEdicion
                  ? 'Guardar cambios'
                  : 'Crear falla'}
            </Button>
          </div>
        )}

        {/* En modo embebido, después de crear y subir imágenes, botón "Listo" */}
        {isEmbedded && !esEdicion && fallaIdCreada !== null && (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => {
                if (onSuccess) onSuccess(fallaIdCreada);
                if (onClose) onClose();
              }}
            >
              Listo
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}