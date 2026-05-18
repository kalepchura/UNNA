/**
 * Formulario de Falla Riel — CREAR y EDITAR.
 *
 * 🔑 FIX bug Select vacío al editar:
 *  - Se usa reset() en lugar de values prop para garantizar
 *    que los Controller se actualicen correctamente.
 *  - Se sincroniza el estado local de progresiva con el formulario.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
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

import { DatoCalculado } from '@/features/fallas/components/dato-calculado';
import { BannerCreado } from '@/features/fallas/components/banner-creado';

import {
  useFallaRiel,
  useCrearFallaRiel,
  useActualizarFallaRiel,
} from '@/features/fallas/hooks/use-fallas-riel';
import {
  useSubirArchivoRiel,
  useEliminarArchivoRiel,
  useObtenerUrlArchivoRiel,
} from '@/features/fallas/hooks/use-archivos-riel';
import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import { TipoVia, LadoRiel, TipoArchivoFalla } from '@/lib/types/common';

import type {
  CrearFallaRielDto,
  ActualizarFallaRielDto,
} from '@/features/fallas/types/falla-riel.types';

const TEXTO_POR_DEFINIR = 'Por definir';
const TEXTO_TANGENTE = 'Tangente';
const DEBOUNCE_MS = 600;

const fallaRielSchema = z.object({
  progresiva: z
    .number({ message: 'Debe ser un número entero' })
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativa'),
  via: z.nativeEnum(TipoVia, { message: 'Selecciona una vía' }),
  fecha: z
    .string()
    .min(1, 'La fecha es obligatoria')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  carril: z.nativeEnum(LadoRiel, { message: 'Selecciona un carril' }),
  causa: z.string().max(2000, 'Máx 2000 caracteres').optional(),
  origen: z.string().max(2000, 'Máx 2000 caracteres').optional(),
});

type FallaRielFormData = z.infer<typeof fallaRielSchema>;

function useTramoVelocidad(progresiva: number | null) {
  const { data: tramosTabla = [] } = useApiQuery({
    queryKey: queryKeys.catalogos.tramosTabla,
    queryFn: () => catalogosApi.tramos.listarParaTabla(),
    enabled: progresiva !== null,
  });

  const { data: velocidades = [] } = useApiQuery({
    queryKey: queryKeys.catalogos.velocidadesTabla,
    queryFn: () => catalogosApi.velocidades.listarParaTabla(),
    enabled: progresiva !== null,
  });

  if (progresiva === null) return { tramo: null, velocidadKmh: null };

  const tramo =
    tramosTabla.find(
      (t) =>
        progresiva >= t.progresivaInicio && progresiva <= t.progresivaFin,
    ) ?? null;

  const velReg = velocidades.find(
    (v) => progresiva >= v.progresivaInicio && progresiva <= v.progresivaFin,
  );

  return { tramo, velocidadKmh: velReg?.velocidadKmh ?? null };
}

function useCurvas(progresiva: number | null, via: TipoVia | undefined) {
  const habilitado = progresiva !== null && !!via;

  const { data: curvasHTabla = [] } = useApiQuery({
    queryKey: queryKeys.catalogos.curvasHorizontalesTabla,
    queryFn: () => catalogosApi.curvasHorizontales.listarParaTabla(),
    enabled: habilitado,
  });

  const { data: curvasVTabla = [] } = useApiQuery({
    queryKey: queryKeys.catalogos.curvasVerticalesTabla,
    queryFn: () => catalogosApi.curvasVerticales.listarParaTabla(),
    enabled: habilitado,
  });

  if (!habilitado) return { curvaH: null, curvaV: null };

  const curvaH =
    curvasHTabla.find(
      (c) =>
        progresiva! >= c.inicioM && progresiva! <= c.finM && c.via === via,
    ) ?? null;

  const curvaV =
    curvasVTabla.find(
      (c) =>
        progresiva! >= c.inicioM && progresiva! <= c.finM && c.via === via,
    ) ?? null;

  return { curvaH, curvaV };
}

function SeccionArchivos({
  fallaId,
  nombreInterno,
  nombreExterno,
}: {
  fallaId: number;
  nombreInterno: string | null;
  nombreExterno: string | null;
}) {
  const refInt = useRef<HTMLInputElement | null>(null);
  const refExt = useRef<HTMLInputElement | null>(null);

  const subirMut = useSubirArchivoRiel();
  const eliminarMut = useEliminarArchivoRiel();
  const urlMut = useObtenerUrlArchivoRiel();

  const subirArchivo = async (tipo: TipoArchivoFalla, archivo: File) => {
    await subirMut.mutateAsync({ fallaId, tipo, archivo });
  };

  const eliminarArchivo = async (tipo: TipoArchivoFalla) => {
    await eliminarMut.mutateAsync({ fallaId, tipo });
    if (tipo === TipoArchivoFalla.INTERNO && refInt.current) {
      refInt.current.value = '';
    } else if (tipo === TipoArchivoFalla.EXTERNO && refExt.current) {
      refExt.current.value = '';
    }
  };

  const verArchivo = async (tipo: TipoArchivoFalla) => {
    const res = await urlMut.mutateAsync({ fallaId, tipo });
    if (res?.url) window.open(res.url, '_blank');
  };

  const FileRow = ({
    tipo,
    label,
    nombre,
    inputRef,
  }: {
    tipo: TipoArchivoFalla;
    label: string;
    nombre: string | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {nombre ? (
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
          <span className="flex-1 truncate text-sm" title={nombre}>
            📄 {nombre}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={urlMut.isPending}
            onClick={() => verArchivo(tipo)}
          >
            {urlMut.isPending ? 'Abriendo...' : 'Ver'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={eliminarMut.isPending}
            onClick={() => eliminarArchivo(tipo)}
          >
            {eliminarMut.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed p-4 text-center transition-colors hover:bg-muted/20">
          <span className="text-sm font-medium text-muted-foreground">
            {subirMut.isPending
              ? 'Subiendo archivo...'
              : 'Haz clic para seleccionar'}
          </span>
          <span className="text-xs text-muted-foreground">
            PDF, Word, Excel o imagen · máx. 10 MB
          </span>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            disabled={subirMut.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) subirArchivo(tipo, file);
            }}
          />
        </label>
      )}
    </div>
  );

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Archivos adjuntos</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <FileRow
          tipo={TipoArchivoFalla.INTERNO}
          label="Informe interno"
          nombre={nombreInterno}
          inputRef={refInt}
        />
        <FileRow
          tipo={TipoArchivoFalla.EXTERNO}
          label="Informe externo"
          nombre={nombreExterno}
          inputRef={refExt}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Cada tipo admite un archivo. Al subir uno nuevo reemplaza el anterior.
      </p>
    </Card>
  );
}

export function FallaRielFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fallaId = id ? Number(id) : null;
  const esEdicion = fallaId != null && fallaId > 0;

  const { data: fallaActual, isLoading: cargandoFalla } = useFallaRiel(
    fallaId ?? 0,
    esEdicion,
  );

  const crearMut = useCrearFallaRiel();
  const actualizarMut = useActualizarFallaRiel();

  const [fallaIdCreada, setFallaIdCreada] = useState<number | null>(null);

  const { data: fallaRecienCreada } = useFallaRiel(
    fallaIdCreada ?? 0,
    fallaIdCreada !== null,
  );

  const [progresivaInput, setProgresivaInput] = useState('');
  const [progresivaConfirmada, setProgresivaConfirmada] =
    useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🔑 FORMULARIO CON RESET en lugar de values prop
  const form = useForm<FallaRielFormData>({
    resolver: zodResolver(fallaRielSchema),
    mode: 'onSubmit',
    defaultValues: {
      progresiva: 0,
      via: undefined,
      fecha: '',
      carril: undefined,
      causa: '',
      origen: '',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = form;

  const viaActual = watch('via');
  const progresivaActual = watch('progresiva');

  // 🔑 RESET cuando se carga la falla a editar
  useEffect(() => {
    if (esEdicion && fallaActual) {
      console.log('🔄 Reseteando formulario con datos:', {
        progresiva: fallaActual.progresiva,
        via: fallaActual.via,
        carril: fallaActual.carril,
      });
      
      reset({
        progresiva: fallaActual.progresiva,
        via: fallaActual.via,
        fecha: fallaActual.fecha.split('T')[0],
        carril: fallaActual.carril,
        causa: fallaActual.causa ?? '',
        origen: fallaActual.origen ?? '',
      });
      
      setProgresivaInput(String(fallaActual.progresiva));
      setProgresivaConfirmada(fallaActual.progresiva);
    }
  }, [esEdicion, fallaActual, reset]);

  // Sincronizar input visual de progresiva con el valor del form
  useEffect(() => {
    if (progresivaActual !== undefined && progresivaActual !== null) {
      setProgresivaInput(String(progresivaActual));
      setProgresivaConfirmada(progresivaActual);
    }
  }, [progresivaActual]);

  const { tramo, velocidadKmh } = useTramoVelocidad(progresivaConfirmada);
  const { curvaH, curvaV } = useCurvas(progresivaConfirmada, viaActual);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const confirmarProgresiva = useCallback(
    (rawValue: string) => {
      const num = parseInt(rawValue, 10);
      if (!isNaN(num) && num >= 0) {
        setValue('progresiva', num, { shouldValidate: false });
        setProgresivaConfirmada(num);
      } else {
        setProgresivaConfirmada(null);
      }
    },
    [setValue],
  );

  const handleProgresivaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setProgresivaInput(raw);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => confirmarProgresiva(raw),
      DEBOUNCE_MS,
    );
  };

  const handleProgresivaKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      confirmarProgresiva(progresivaInput);
    }
  };

  const onSubmit = async (data: FallaRielFormData) => {
    if (esEdicion) {
      const dto: ActualizarFallaRielDto = {
        progresiva: data.progresiva,
        via: data.via,
        fecha: data.fecha,
        carril: data.carril,
        causa: data.causa || undefined,
        origen: data.origen || undefined,
      };
      const actualizada = await actualizarMut.mutateAsync({
        id: fallaId!,
        dto,
      });
      navigate(`/fallas/riel/${actualizada.id}`);
    } else {
      const dto: CrearFallaRielDto = {
        progresiva: data.progresiva,
        via: data.via,
        fecha: data.fecha,
        carril: data.carril,
        causa: data.causa || undefined,
        origen: data.origen || undefined,
      };
      const creada = await crearMut.mutateAsync(dto);
      setFallaIdCreada(creada.id);
    }
  };

  const idParaArchivos = esEdicion ? fallaId : fallaIdCreada;
  const mostrarArchivos = idParaArchivos !== null;

  const nombreInternoEfectivo = esEdicion
    ? (fallaActual?.nombreInformeInterno ?? null)
    : (fallaRecienCreada?.nombreInformeInterno ?? null);

  const nombreExternoEfectivo = esEdicion
    ? (fallaActual?.nombreInformeExterno ?? null)
    : (fallaRecienCreada?.nombreInformeExterno ?? null);

  const hayProgresiva = progresivaConfirmada !== null;

  const textoTramo = !hayProgresiva
    ? TEXTO_POR_DEFINIR
    : tramo
      ? tramo.codigo
      : 'Sin tramo';

  const textoVelocidad = !hayProgresiva
    ? TEXTO_POR_DEFINIR
    : velocidadKmh !== null
      ? `${velocidadKmh} km/h`
      : 'Sin dato';

  const hayVia = !!viaActual;

  const textoCurvaH =
    !hayProgresiva || !hayVia
      ? TEXTO_POR_DEFINIR
      : curvaH
        ? curvaH.nombre
        : TEXTO_TANGENTE;

  const textoCurvaV =
    !hayProgresiva || !hayVia
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
        <Button asChild variant="outline">
          <Link to="/fallas/riel">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pagina-form-riel p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {esEdicion ? `Editar Falla Riel #${fallaId}` : 'Nueva Falla de Riel'}
        </h1>
        <Button asChild variant="outline">
          <Link to="/fallas/riel">Cancelar</Link>
        </Button>
      </header>

      {fallaIdCreada !== null && !esEdicion && (
        <BannerCreado
          fallaId={fallaIdCreada}
          mensaje="Falla creada correctamente"
          rutaDetalle={`/fallas/riel/${fallaIdCreada}`}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ── DATOS PRINCIPALES ── */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Datos principales</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Progresiva */}
            <div className="form-campo">
              <Label htmlFor="progresiva">Progresiva (m) *</Label>
              <Input
                id="progresiva"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={progresivaInput}
                onChange={handleProgresivaChange}
                onKeyDown={handleProgresivaKeyDown}
                onBlur={() => {
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  confirmarProgresiva(progresivaInput);
                }}
                placeholder="Ingresa la progresiva"
                autoComplete="off"
                disabled={fallaIdCreada !== null}
              />
              {errors.progresiva && (
                <p className="text-sm text-destructive mt-1">
                  {errors.progresiva.message}
                </p>
              )}
            </div>

            {/* Fecha */}
            <div className="form-campo">
              <Label htmlFor="fecha">Fecha de detección *</Label>
              <Input
                id="fecha"
                type="date"
                disabled={fallaIdCreada !== null}
                {...register('fecha')}
              />
              {errors.fecha && (
                <p className="text-sm text-destructive mt-1">
                  {errors.fecha.message}
                </p>
              )}
            </div>

            {/* 🔑 Vía con Controller - con key para forzar re-render */}
            <div className="form-campo">
              <Label>Vía *</Label>
              <Controller
                name="via"
                control={control}
                render={({ field }) => (
                  <Select
                    key={`via-${field.value}`}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={fallaIdCreada !== null}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una vía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TipoVia.PAR}>PAR</SelectItem>
                      <SelectItem value={TipoVia.IMPAR}>IMPAR</SelectItem>
                      <SelectItem value={TipoVia.TERCERA}>TERCERA</SelectItem>
                      <SelectItem value={TipoVia.CERO}>CERO</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.via && (
                <p className="text-sm text-destructive mt-1">
                  {errors.via.message}
                </p>
              )}
            </div>

            {/* 🔑 Carril con Controller - con key para forzar re-render */}
            <div className="form-campo">
              <Label>Carril *</Label>
              <Controller
                name="carril"
                control={control}
                render={({ field }) => (
                  <Select
                    key={`carril-${field.value}`}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={fallaIdCreada !== null}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un carril" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LadoRiel.IZQUIERDA}>
                        Izquierda
                      </SelectItem>
                      <SelectItem value={LadoRiel.DERECHA}>
                        Derecha
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.carril && (
                <p className="text-sm text-destructive mt-1">
                  {errors.carril.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* ── RELACIONES CALCULADAS ── */}
        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-semibold">
            Datos calculados automáticamente
          </h2>

          <div className="rounded-md border bg-muted/30 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              A partir de la progresiva
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <DatoCalculado
                label="Tramo"
                valor={textoTramo}
                indefinido={!hayProgresiva || !tramo}
              />
              <DatoCalculado
                label="Velocidad"
                valor={textoVelocidad}
                indefinido={!hayProgresiva || velocidadKmh === null}
              />
            </div>
            {hayProgresiva && !tramo && (
              <p className="text-xs text-destructive">
                ⚠ La progresiva no corresponde a ningún tramo registrado.
              </p>
            )}
          </div>

          <div className="rounded-md border bg-muted/30 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              A partir de progresiva + vía
            </p>
            {!hayVia && hayProgresiva && (
              <p className="text-xs text-muted-foreground">
                Selecciona una vía para calcular las curvas.
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <DatoCalculado
                label="Curva Horizontal"
                valor={textoCurvaH}
                indefinido={!hayProgresiva || !hayVia || !curvaH}
              />
              <DatoCalculado
                label="Curva Vertical"
                valor={textoCurvaV}
                indefinido={!hayProgresiva || !hayVia || !curvaV}
              />
            </div>
          </div>
        </Card>

        {/* ── CAUSA Y ORIGEN ── */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Causa y origen (opcional)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-campo">
              <Label htmlFor="causa">Causa</Label>
              <Textarea
                id="causa"
                rows={4}
                placeholder="Descripción libre de la causa..."
                disabled={fallaIdCreada !== null}
                {...register('causa')}
              />
              {errors.causa && (
                <p className="text-sm text-destructive mt-1">
                  {errors.causa.message}
                </p>
              )}
            </div>
            <div className="form-campo">
              <Label htmlFor="origen">Origen / Antecedente</Label>
              <Textarea
                id="origen"
                rows={4}
                placeholder="De dónde proviene la falla..."
                disabled={fallaIdCreada !== null}
                {...register('origen')}
              />
              {errors.origen && (
                <p className="text-sm text-destructive mt-1">
                  {errors.origen.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {mostrarArchivos && (
          <SeccionArchivos
            fallaId={idParaArchivos!}
            nombreInterno={nombreInternoEfectivo}
            nombreExterno={nombreExternoEfectivo}
          />
        )}

        {mostrarBotones && (
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" type="button">
              <Link to="/fallas/riel">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : esEdicion
                  ? 'Guardar cambios'
                  : 'Crear falla'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}