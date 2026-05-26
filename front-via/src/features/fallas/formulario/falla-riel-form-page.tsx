/**
 * Formulario de Falla Riel — CREAR y EDITAR.
 *
 * FASE 2: agregados 11 campos nuevos opcionales en 3 Cards adicionales:
 *  - Caracterización del defecto (5 enums: tipoDefecto, elementoAfectado,
 *    zonaAfectada, perfil, altaBaja)
 *  - Medidas del defecto (5 numéricos: progresivaFinal, largo, ancho,
 *    profundidad, numeroFoto)
 *  - Otros datos (tipoOnda — texto libre)
 *
 * Reglas aplicadas:
 *  - Todos los enums arrancan con SIN_DEFINIR / NO_APLICA como default.
 *    Siempre se envían al backend (no se omiten).
 *  - Los numéricos arrancan en blanco y se envían solo si tienen valor.
 *  - Bloqueo coherente: TODOS los campos se bloquean después de crear
 *    (mismo patrón que los campos originales).
 *  - reset() actualizado para incluir todos los campos al editar.
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

// FASE 2 — Enums nuevos
import {
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  AltaBaja,
  LABEL_TIPO_DEFECTO,
  LABEL_ELEMENTO_AFECTADO,
  LABEL_ZONA_AFECTADA,
  LABEL_PERFIL_FALLA,
  LABEL_ALTA_BAJA,
} from '@/lib/types/enums/fallas.enum';

import type {
  CrearFallaRielDto,
  ActualizarFallaRielDto,
} from '@/features/fallas/types/falla-riel.types';

const TEXTO_POR_DEFINIR = 'Por definir';
const TEXTO_TANGENTE = 'Tangente';
const DEBOUNCE_MS = 600;

// ============================================================
// SCHEMA ZOD (con campos nuevos opcionales)
// ============================================================

const fallaRielSchema = z.object({
  // ----- Campos originales (obligatorios) -----
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

  // ----- FASE 2 — Caracterización (enums con default SIN_DEFINIR / NO_APLICA) -----
  tipoDefecto: z.nativeEnum(TipoDefectoRiel),
  elementoAfectado: z.nativeEnum(ElementoAfectadoRiel),
  zonaAfectada: z.nativeEnum(ZonaAfectadaRiel),
  perfil: z.nativeEnum(PerfilFallaRiel),
  altaBaja: z.nativeEnum(AltaBaja),

  // ----- FASE 2 — Medidas (numéricos opcionales) -----
  // Se aceptan como undefined cuando el usuario deja el input vacío.
  progresivaFinal: z
    .number({ message: 'Debe ser un número' })
    .int('Debe ser un entero')
    .min(0, 'No puede ser negativa')
    .optional(),
  largo: z
    .number({ message: 'Debe ser un número' })
    .min(0, 'No puede ser negativo')
    .optional(),
  ancho: z
    .number({ message: 'Debe ser un número' })
    .min(0, 'No puede ser negativo')
    .optional(),
  profundidad: z
    .number({ message: 'Debe ser un número' })
    .min(0, 'No puede ser negativa')
    .optional(),
  numeroFoto: z
    .number({ message: 'Debe ser un número' })
    .int('Debe ser un entero')
    .min(0, 'No puede ser negativo')
    .optional(),

  // ----- FASE 2 — Otros -----
  tipoOnda: z.string().max(100, 'Máx 100 caracteres').optional(),
});

type FallaRielFormData = z.infer<typeof fallaRielSchema>;

// ============================================================
// HOOKS HELPER (sin cambios desde tu versión original)
// ============================================================

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

// ============================================================
// SECCIÓN DE ARCHIVOS (sin cambios)
// ============================================================

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

// ============================================================
// PROPS
// ============================================================

interface FallaRielFormPageProps {
  /** Si se provee, el formulario corre en "modo embebido" (sin ruta).
   *  Pasa null para crear, un número para editar. */
  idOverride?: number | null;
  /** Callback cuando se cierra el formulario (X / Cancelar). En modo embebido. */
  onClose?: () => void;
  /** Callback cuando se completa con éxito. Recibe el id creado/actualizado. */
  onSuccess?: (id: number) => void;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function FallaRielFormPage(props: FallaRielFormPageProps = {}) {
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

  // 🔑 FORMULARIO con defaults explícitos para los enums nuevos
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
      // FASE 2 — defaults de enums opcionales
      tipoDefecto: TipoDefectoRiel.SIN_DEFINIR,
      elementoAfectado: ElementoAfectadoRiel.SIN_DEFINIR,
      zonaAfectada: ZonaAfectadaRiel.SIN_DEFINIR,
      perfil: PerfilFallaRiel.SIN_DEFINIR,
      altaBaja: AltaBaja.NO_APLICA,
      // Medidas: undefined para que aparezcan vacías visualmente
      progresivaFinal: undefined,
      largo: undefined,
      ancho: undefined,
      profundidad: undefined,
      numeroFoto: undefined,
      tipoOnda: '',
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
  // Incluye TODOS los campos nuevos para que los selects no queden vacíos.
  useEffect(() => {
    if (esEdicion && fallaActual) {
      reset({
        // Originales
        progresiva: fallaActual.progresiva,
        via: fallaActual.via,
        fecha: fallaActual.fecha.split('T')[0],
        carril: fallaActual.carril,
        causa: fallaActual.causa ?? '',
        origen: fallaActual.origen ?? '',
        // FASE 2 — Caracterización (siempre vienen con valor desde backend)
        tipoDefecto: fallaActual.tipoDefecto,
        elementoAfectado: fallaActual.elementoAfectado,
        zonaAfectada: fallaActual.zonaAfectada,
        perfil: fallaActual.perfil,
        altaBaja: fallaActual.altaBaja,
        // FASE 2 — Medidas (pueden ser null en BD → undefined en form)
        progresivaFinal: fallaActual.progresivaFinal ?? undefined,
        largo: fallaActual.largo ?? undefined,
        ancho: fallaActual.ancho ?? undefined,
        profundidad: fallaActual.profundidad ?? undefined,
        numeroFoto: fallaActual.numeroFoto ?? undefined,
        tipoOnda: fallaActual.tipoOnda ?? '',
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

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = async (data: FallaRielFormData) => {
    // Helper: convierte string vacío / undefined → undefined (no enviar al backend)
    const opt = <T,>(v: T | '' | undefined): T | undefined =>
      v === '' || v === undefined ? undefined : v;

    // Payload común con todos los campos nuevos
    const payloadBase = {
      // Originales
      progresiva: data.progresiva,
      via: data.via,
      fecha: data.fecha,
      carril: data.carril,
      causa: data.causa || undefined,
      origen: data.origen || undefined,

      // FASE 2 — Enums (SIEMPRE se envían con valor)
      tipoDefecto: data.tipoDefecto,
      elementoAfectado: data.elementoAfectado,
      zonaAfectada: data.zonaAfectada,
      perfil: data.perfil,
      altaBaja: data.altaBaja,

      // FASE 2 — Medidas (solo se envían si tienen valor)
      progresivaFinal: opt(data.progresivaFinal),
      largo: opt(data.largo),
      ancho: opt(data.ancho),
      profundidad: opt(data.profundidad),
      numeroFoto: opt(data.numeroFoto),
      tipoOnda: data.tipoOnda || undefined,
    };

    if (esEdicion) {
      const dto: ActualizarFallaRielDto = payloadBase;
      const actualizada = await actualizarMut.mutateAsync({
        id: fallaId!,
        dto,
      });
      if (onSuccess) {
        onSuccess(actualizada.id);
      } else {
        navigate(`/fallas/riel/${actualizada.id}`);
      }
    } else {
      const dto: CrearFallaRielDto = payloadBase;
      const creada = await crearMut.mutateAsync(dto);
      setFallaIdCreada(creada.id);
    }
  };

  // ============================================================
  // ESTADO COMPUTADO
  // ============================================================

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
  const disabledTrasCrear = fallaIdCreada !== null;

  // ============================================================
  // GUARDS DE LOADING / NOT FOUND
  // ============================================================

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
            <Link to="/fallas/riel">Volver al listado</Link>
          </Button>
        )}
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={isEmbedded ? 'space-y-4' : 'pagina-form-riel p-4 space-y-4'}>
      {!isEmbedded && (
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {esEdicion ? `Editar Falla Riel #${fallaId}` : 'Nueva Falla de Riel'}
          </h1>
          <Button asChild variant="outline">
            <Link to="/fallas/riel">Cancelar</Link>
          </Button>
        </header>
      )}

      {fallaIdCreada !== null && !esEdicion && (
        <BannerCreado
          fallaId={fallaIdCreada}
          mensaje="Falla creada correctamente"
          rutaDetalle={`/fallas/riel/${fallaIdCreada}`}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ============================================================ */}
        {/* ── DATOS PRINCIPALES ── */}
        {/* ============================================================ */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Datos principales</h2>

          <div className="grid gap-4 md:grid-cols-2">
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
                disabled={disabledTrasCrear}
              />
              {errors.progresiva && (
                <p className="text-sm text-destructive mt-1">
                  {errors.progresiva.message}
                </p>
              )}
            </div>

            <div className="form-campo">
              <Label htmlFor="fecha">Fecha de detección *</Label>
              <Input
                id="fecha"
                type="date"
                disabled={disabledTrasCrear}
                {...register('fecha')}
              />
              {errors.fecha && (
                <p className="text-sm text-destructive mt-1">
                  {errors.fecha.message}
                </p>
              )}
            </div>

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
                    disabled={disabledTrasCrear}
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
                    disabled={disabledTrasCrear}
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

        {/* ============================================================ */}
        {/* ── RELACIONES CALCULADAS ── */}
        {/* ============================================================ */}
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

        {/* ============================================================ */}
        {/* ── FASE 2 — CARACTERIZACIÓN DEL DEFECTO ── */}
        {/* ============================================================ */}
        <Card className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Caracterización del defecto</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Opcional · Si no se conoce el dato, dejar en "Sin definir"
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Tipo de defecto */}
            <div className="form-campo">
              <Label>Tipo de defecto</Label>
              <Controller
                name="tipoDefecto"
                control={control}
                render={({ field }) => (
                  <Select
                    key={`tipoDefecto-${field.value}`}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={disabledTrasCrear}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LABEL_TIPO_DEFECTO).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Elemento afectado */}
            <div className="form-campo">
              <Label>Elemento afectado</Label>
              <Controller
                name="elementoAfectado"
                control={control}
                render={({ field }) => (
                  <Select
                    key={`elementoAfectado-${field.value}`}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={disabledTrasCrear}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LABEL_ELEMENTO_AFECTADO).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Zona afectada */}
            <div className="form-campo">
              <Label>Zona afectada</Label>
              <Controller
                name="zonaAfectada"
                control={control}
                render={({ field }) => (
                  <Select
                    key={`zonaAfectada-${field.value}`}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={disabledTrasCrear}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LABEL_ZONA_AFECTADA).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Perfil */}
            <div className="form-campo">
              <Label>Perfil del riel</Label>
              <Controller
                name="perfil"
                control={control}
                render={({ field }) => (
                  <Select
                    key={`perfil-${field.value}`}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={disabledTrasCrear}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LABEL_PERFIL_FALLA).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Alta / Baja (solo curvas) */}
            <div className="form-campo md:col-span-2">
              <Label>Alta / Baja (solo si está en curva)</Label>
              <Controller
                name="altaBaja"
                control={control}
                render={({ field }) => (
                  <Select
                    key={`altaBaja-${field.value}`}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={disabledTrasCrear}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LABEL_ALTA_BAJA).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground mt-1">
                En tangentes, mantener "No aplica".
              </p>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* ── FASE 2 — MEDIDAS DEL DEFECTO ── */}
        {/* ============================================================ */}
        <Card className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Medidas del defecto</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Opcional · Solo completar si se realizaron mediciones en campo
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="form-campo">
              <Label htmlFor="progresivaFinal">Progresiva final (m)</Label>
              <Input
                id="progresivaFinal"
                type="number"
                step="1"
                min="0"
                placeholder="Si el defecto abarca un tramo"
                disabled={disabledTrasCrear}
                {...register('progresivaFinal', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
              />
              {errors.progresivaFinal && (
                <p className="text-sm text-destructive mt-1">
                  {errors.progresivaFinal.message}
                </p>
              )}
            </div>

            <div className="form-campo">
              <Label htmlFor="largo">Largo (mm)</Label>
              <Input
                id="largo"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 57.5"
                disabled={disabledTrasCrear}
                {...register('largo', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
              />
              {errors.largo && (
                <p className="text-sm text-destructive mt-1">
                  {errors.largo.message}
                </p>
              )}
            </div>

            <div className="form-campo">
              <Label htmlFor="ancho">Ancho (mm)</Label>
              <Input
                id="ancho"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 12.0"
                disabled={disabledTrasCrear}
                {...register('ancho', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
              />
              {errors.ancho && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ancho.message}
                </p>
              )}
            </div>

            <div className="form-campo">
              <Label htmlFor="profundidad">Profundidad (mm)</Label>
              <Input
                id="profundidad"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 0.5"
                disabled={disabledTrasCrear}
                {...register('profundidad', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
              />
              {errors.profundidad && (
                <p className="text-sm text-destructive mt-1">
                  {errors.profundidad.message}
                </p>
              )}
            </div>

            <div className="form-campo md:col-span-2">
              <Label htmlFor="numeroFoto">N° de foto</Label>
              <Input
                id="numeroFoto"
                type="number"
                step="1"
                min="0"
                placeholder="Correlativo del reporte físico"
                disabled={disabledTrasCrear}
                {...register('numeroFoto', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
              />
              {errors.numeroFoto && (
                <p className="text-sm text-destructive mt-1">
                  {errors.numeroFoto.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* ── CAUSA Y ORIGEN ── */}
        {/* ============================================================ */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Causa y origen (opcional)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-campo">
              <Label htmlFor="causa">Causa</Label>
              <Textarea
                id="causa"
                rows={4}
                placeholder="Descripción libre de la causa..."
                disabled={disabledTrasCrear}
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
                disabled={disabledTrasCrear}
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

        {/* ============================================================ */}
        {/* ── FASE 2 — OTROS DATOS ── */}
        {/* ============================================================ */}
        <Card className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Otros datos (opcional)</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Información complementaria sobre el defecto
            </p>
          </div>

          <div className="form-campo">
            <Label htmlFor="tipoOnda">Tipo de onda</Label>
            <Input
              id="tipoOnda"
              type="text"
              maxLength={100}
              placeholder="Solo aplica a defectos de ondulación"
              disabled={disabledTrasCrear}
              {...register('tipoOnda')}
            />
            {errors.tipoOnda && (
              <p className="text-sm text-destructive mt-1">
                {errors.tipoOnda.message}
              </p>
            )}
          </div>
        </Card>

        {/* ============================================================ */}
        {/* ── ARCHIVOS ── */}
        {/* ============================================================ */}
        {mostrarArchivos && (
          <SeccionArchivos
            fallaId={idParaArchivos!}
            nombreInterno={nombreInternoEfectivo}
            nombreExterno={nombreExternoEfectivo}
          />
        )}

        {/* ============================================================ */}
        {/* ── BOTONES ── */}
        {/* ============================================================ */}
        {mostrarBotones && (
          <div className="flex justify-end gap-2">
            {onClose ? (
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
            ) : (
              <Button asChild variant="outline" type="button">
                <Link to="/fallas/riel">Cancelar</Link>
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