/**
 * Página de detalle de una falla riel.
 *
 * FASE 2 — Secciones agregadas:
 *  - "Estado actual" (estadoActual, accionActual, ptActual, fechaEjecucionActual)
 *  - "Caracterización del defecto" (5 enums con labels)
 *  - "Medidas del defecto" (4 numéricos)
 *  - "Otros datos" (tipoOnda)
 *  - "Historial de acciones" (timeline visual)
 *
 * FASE 5 — Habilitados:
 *  - Botón "+ Registrar acción" → abre modal en modo CREAR
 *  - Botón "Editar" de cada acción → abre modal en modo EDITAR
 *  - Botón "Eliminar" de cada acción → abre ConfirmDialog
 *
 * FIX (bug modal datos viejos):
 *  - accionEditando ya NO guarda el objeto completo de la acción.
 *    Solo guarda el ID (accionEditandoId: number | null).
 *  - AccionRielModal recibe la acción buscada DESDE el query fresco
 *    (falla.acciones.find), no desde un snapshot del estado local.
 *  - Así, si el refetch del detalle actualiza falla.acciones antes
 *    de que el usuario abra el modal, el form siempre tiene datos
 *    actualizados.
 *
 * Filosofía de diseño:
 *  - Se muestran TODOS los campos siempre, aunque estén vacíos o
 *    en SIN_DEFINIR. Esto le permite al ingeniero ver qué falta
 *    completar de un vistazo.
 *  - Valores faltantes/SIN_DEFINIR/null se renderizan en cursiva
 *    gris.
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  useFallaRiel,
  useEliminarFallaRiel,
} from '@/features/fallas/hooks/use-fallas-riel';
import { useEliminarAccionRiel } from '@/features/fallas/hooks/use-acciones-riel';
import { ArchivoUploader } from '@/features/fallas/components/archivo-uploader';
import { TipoArchivoFalla } from '@/lib/types/common';

// FASE 2 — Componentes y enums
import { BadgeEstadoFalla } from '@/features/fallas/components/badge-estado-falla';
import { TimelineAccionesRiel } from '@/features/fallas/components/timeline-acciones-riel';
// FASE 5 — Modal de acción
import { AccionRielModal } from '@/features/fallas/components/accion-riel-modal';

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
  LABEL_ACCION_RIEL,
} from '@/lib/types/enums/fallas.enum';
import type { AccionRielResponse } from '@/features/fallas/types/accion-riel.types';

interface FallaRielDetallePageProps {
  /** Si se provee, se usa este id en lugar de useParams. */
  idOverride?: number;
  /** Callback cuando se cierra (X / Volver). */
  onClose?: () => void;
  /** Callback para abrir la edición (en lugar de navegar). */
  onEditar?: (id: number) => void;
}

export function FallaRielDetallePage(props: FallaRielDetallePageProps = {}) {
  const { idOverride, onClose, onEditar } = props;
  const isEmbedded = idOverride !== undefined || !!onClose || !!onEditar;

  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // FASE 5 — Estado del modal de acción.
  //
  // FIX: guardamos solo el ID de la acción a editar (o null para crear),
  // NO el objeto completo. El objeto se deriva del query fresco cada render,
  // evitando que el modal abra con un snapshot desactualizado del estado local.
  const [modalAccionAbierto, setModalAccionAbierto] = useState(false);
  const [accionEditandoId, setAccionEditandoId] = useState<number | null>(null);
  const [accionAEliminar, setAccionAEliminar] = useState<AccionRielResponse | null>(
    null,
  );

  const fallaId = idOverride ?? Number(idParam);
  const { data: falla, isLoading } = useFallaRiel(fallaId);
  const eliminarFallaMut = useEliminarFallaRiel();
  const eliminarAccionMut = useEliminarAccionRiel();

  // FIX: derivamos la acción a editar desde falla.acciones (query fresco),
  // no desde un useState con el objeto completo. Así el modal siempre ve
  // datos actualizados aunque el refetch ocurra mientras está abierto.
  const accionEditando: AccionRielResponse | null =
    accionEditandoId !== null
      ? (falla?.acciones?.find((a) => a.id === accionEditandoId) ?? null)
      : null;

  if (isLoading) {
    return <p className="p-4">Cargando falla...</p>;
  }

  if (!falla) {
    return (
      <div className="p-4 space-y-2">
        <p>Falla no encontrada.</p>
        {onClose ? (
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/fallas/riel">Volver al listado</Link>
          </Button>
        )}
      </div>
    );
  }

  // ============================================================
  // HANDLERS DE ACCIONES (FASE 5)
  // ============================================================

  const handleNuevaAccion = () => {
    setAccionEditandoId(null); // Modo CREAR: sin id seleccionado
    setModalAccionAbierto(true);
  };

  const handleEditarAccion = (accion: AccionRielResponse) => {
    // FIX: guardamos solo el ID. El objeto se lee del query fresco en el render.
    setAccionEditandoId(accion.id);
    setModalAccionAbierto(true);
  };

  const handleCerrarModal = (open: boolean) => {
    setModalAccionAbierto(open);
    // Al cerrar el modal, limpiamos el id para no dejar estado colgado.
    if (!open) {
      setAccionEditandoId(null);
    }
  };

  const handlePedirEliminarAccion = (accion: AccionRielResponse) => {
    setAccionAEliminar(accion);
  };

  const handleConfirmarEliminarAccion = async () => {
    if (!accionAEliminar) return;
    await eliminarAccionMut.mutateAsync({
      id: accionAEliminar.id,
      fallaId,
    });
    setAccionAEliminar(null);
  };

  const handleEliminarFalla = async () => {
    await eliminarFallaMut.mutateAsync(fallaId);
    if (onClose) {
      onClose();
    } else {
      navigate('/fallas/riel');
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={isEmbedded ? 'space-y-4' : 'pagina-detalle-riel p-4 space-y-4'}>
      {/* Header */}
      {!isEmbedded && (
        <header className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold">Falla de Riel #{falla.id}</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/fallas/riel">Volver</Link>
            </Button>
            <Button asChild>
              <Link to={`/fallas/riel/${falla.id}/editar`}>Editar</Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => setMostrarConfirmar(true)}
            >
              Eliminar
            </Button>
          </div>
        </header>
      )}

      {isEmbedded && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border pb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (onEditar ? onEditar(falla.id) : null)}
            disabled={!onEditar}
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setMostrarConfirmar(true)}
          >
            Eliminar
          </Button>
        </div>
      )}

      {/* ============================================================ */}
      {/* FASE 2 — ESTADO ACTUAL */}
      {/* ============================================================ */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Estado actual</h2>
          <Button type="button" size="sm" onClick={handleNuevaAccion}>
            + Registrar acción
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="campo-detalle">
            <p className="text-xs text-muted-foreground mb-1">Estado</p>
            <BadgeEstadoFalla estado={falla.estadoActual} />
          </div>

          <CampoEnum
            label="Última acción"
            valor={falla.accionActual}
            labels={LABEL_ACCION_RIEL}
            placeholder="Sin acción registrada"
          />

          <CampoOpcional
            label="PT actual"
            valor={falla.ptActual}
            placeholder="—"
          />

          <CampoFecha
            label="Fecha ejecución"
            iso={falla.fechaEjecucionActual}
          />
        </div>
      </Card>

      {/* Datos principales */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Datos principales</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Campo
            label="Fecha de detección"
            valor={formatearFecha(falla.fecha)}
          />
          <Campo label="Progresiva inicial" valor={`${falla.progresiva} m`} />
          <Campo
            label="Progresiva final"
            valor={
              falla.progresivaFinal != null
                ? `${falla.progresivaFinal} m`
                : '—'
            }
          />
          <Campo label="Vía" valor={falla.via} />
          <Campo label="Carril" valor={falla.carril} />
          <Campo
            label="Velocidad"
            valor={
              falla.velocidadKmh != null
                ? `${falla.velocidadKmh} km/h`
                : '—'
            }
          />
        </div>
      </Card>

      {/* Contexto geográfico */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Contexto geográfico</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Campo
            label="Tramo"
            valor={`${falla.tramoCodigo} — ${falla.tramoNombre}`}
          />
          <CampoTangente
            label="Curva horizontal"
            valor={falla.curvaHorizontalNombre}
          />
          <CampoTangente
            label="Curva vertical"
            valor={falla.curvaVerticalNombre}
          />
        </div>
      </Card>

      {/* Caracterización del defecto */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Caracterización del defecto</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <CampoEnum
            label="Tipo de defecto"
            valor={falla.tipoDefecto}
            labels={LABEL_TIPO_DEFECTO}
            indefinidoSi={[TipoDefectoRiel.SIN_DEFINIR]}
          />
          <CampoEnum
            label="Elemento afectado"
            valor={falla.elementoAfectado}
            labels={LABEL_ELEMENTO_AFECTADO}
            indefinidoSi={[ElementoAfectadoRiel.SIN_DEFINIR]}
          />
          <CampoEnum
            label="Zona afectada"
            valor={falla.zonaAfectada}
            labels={LABEL_ZONA_AFECTADA}
            indefinidoSi={[ZonaAfectadaRiel.SIN_DEFINIR]}
          />
          <CampoEnum
            label="Perfil del riel"
            valor={falla.perfil}
            labels={LABEL_PERFIL_FALLA}
            indefinidoSi={[PerfilFallaRiel.SIN_DEFINIR]}
          />
          <CampoEnum
            label="Alta / Baja"
            valor={falla.altaBaja}
            labels={LABEL_ALTA_BAJA}
            indefinidoSi={[AltaBaja.NO_APLICA]}
          />
        </div>
      </Card>

      {/* Medidas del defecto */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Medidas del defecto</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <CampoMedida label="Largo" valor={falla.largo} unidad="mm" />
          <CampoMedida label="Ancho" valor={falla.ancho} unidad="mm" />
          <CampoMedida
            label="Profundidad"
            valor={falla.profundidad}
            unidad="mm"
          />
          <CampoMedida label="N° de foto" valor={falla.numeroFoto} unidad="" />
        </div>
      </Card>

      {/* Otros datos */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Otros datos</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <CampoOpcional
            label="Tipo de onda"
            valor={falla.tipoOnda}
            placeholder="No aplica"
          />
        </div>
      </Card>

      {/* Causa y origen */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Causa y origen</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <CampoOpcional
            label="Causa"
            valor={falla.causa}
            placeholder="Sin causa registrada"
            multilinea
          />
          <CampoOpcional
            label="Origen"
            valor={falla.origen}
            placeholder="Sin origen registrado"
            multilinea
          />
        </div>
      </Card>

      {/* ============================================================ */}
      {/* HISTORIAL DE ACCIONES (TIMELINE) - FASE 5 cableado */}
      {/* ============================================================ */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Historial de acciones</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleNuevaAccion}
          >
            + Registrar acción
          </Button>
        </div>

        <TimelineAccionesRiel
          fechaDeteccion={falla.fecha}
          acciones={falla.acciones}
          onEditar={handleEditarAccion}
          onEliminar={handlePedirEliminarAccion}
        />
      </Card>

      {/* Archivos */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Informes adjuntos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ArchivoUploader
            fallaId={falla.id}
            tipo={TipoArchivoFalla.INTERNO}
            nombreActual={falla.nombreInformeInterno}
            label="Informe interno"
          />
          <ArchivoUploader
            fallaId={falla.id}
            tipo={TipoArchivoFalla.EXTERNO}
            nombreActual={falla.nombreInformeExterno}
            label="Informe externo"
          />
        </div>
      </Card>

      {/* Auditoría */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Auditoría</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Campo label="Creado" valor={formatearFechaHora(falla.creadoEn)} />
          <Campo
            label="Última modificación"
            valor={formatearFechaHora(falla.actualizadoEn)}
          />
        </div>
      </Card>

      {/* ============================================================ */}
      {/* MODALES Y CONFIRMACIONES */}
      {/* ============================================================ */}

      {/* Confirmar eliminar FALLA */}
      <ConfirmDialog
        open={mostrarConfirmar}
        onOpenChange={setMostrarConfirmar}
        titulo="Eliminar falla"
        descripcion="¿Estás seguro? La falla pasará a estado eliminado. Solo un administrador podrá restaurarla."
        etiquetaConfirmar="Eliminar"
        variante="destructive"
        onConfirmar={handleEliminarFalla}
      />

      {/* FASE 5 — Modal de crear/editar acción.
          FIX: accionActual se deriva del query fresco (accionEditando),
          no de un snapshot del estado local. Ver derivación arriba. */}
      <AccionRielModal
        open={modalAccionAbierto}
        onOpenChange={handleCerrarModal}
        fallaId={fallaId}
        accionActual={accionEditando}
      />

      {/* FASE 5 — Confirmar eliminar ACCIÓN */}
      <ConfirmDialog
        open={accionAEliminar !== null}
        onOpenChange={(open) => {
          if (!open) setAccionAEliminar(null);
        }}
        titulo="Eliminar acción"
        descripcion={
          accionAEliminar
            ? `¿Eliminar la acción "${LABEL_ACCION_RIEL[accionAEliminar.accion]}"? Si era la más reciente, el estado de la falla se recalculará.`
            : ''
        }
        etiquetaConfirmar="Eliminar"
        variante="destructive"
        onConfirmar={handleConfirmarEliminarAccion}
      />
    </div>
  );
}

// ============================================================
// Sub-componentes locales
// ============================================================

interface CampoProps {
  label: string;
  valor: string;
  multilinea?: boolean;
}

function Campo({ label, valor, multilinea }: CampoProps) {
  return (
    <div className="campo-detalle">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={multilinea ? 'whitespace-pre-wrap' : ''}>{valor}</p>
    </div>
  );
}

function CampoTangente({
  label,
  valor,
}: {
  label: string;
  valor: string | null;
}) {
  return (
    <div className="campo-detalle">
      <p className="text-xs text-muted-foreground">{label}</p>
      {valor ? (
        <p>{valor}</p>
      ) : (
        <p className="italic text-muted-foreground">Tangente</p>
      )}
    </div>
  );
}

function CampoOpcional({
  label,
  valor,
  placeholder,
  multilinea,
}: {
  label: string;
  valor: string | null;
  placeholder: string;
  multilinea?: boolean;
}) {
  return (
    <div className="campo-detalle">
      <p className="text-xs text-muted-foreground">{label}</p>
      {valor ? (
        <p className={multilinea ? 'whitespace-pre-wrap' : ''}>{valor}</p>
      ) : (
        <p className="italic text-muted-foreground">{placeholder}</p>
      )}
    </div>
  );
}

function CampoEnum<T extends string>({
  label,
  valor,
  labels,
  indefinidoSi = [],
  placeholder = 'Sin definir',
}: {
  label: string;
  valor: T | null;
  labels: Record<T, string>;
  indefinidoSi?: T[];
  placeholder?: string;
}) {
  if (valor === null) {
    return (
      <div className="campo-detalle">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="italic text-muted-foreground">{placeholder}</p>
      </div>
    );
  }

  const esIndefinido = indefinidoSi.includes(valor);

  return (
    <div className="campo-detalle">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={esIndefinido ? 'italic text-muted-foreground' : ''}>
        {labels[valor]}
      </p>
    </div>
  );
}

function CampoMedida({
  label,
  valor,
  unidad,
}: {
  label: string;
  valor: number | null;
  unidad: string;
}) {
  return (
    <div className="campo-detalle">
      <p className="text-xs text-muted-foreground">{label}</p>
      {valor != null ? (
        <p>
          {valor}
          {unidad ? ` ${unidad}` : ''}
        </p>
      ) : (
        <p className="italic text-muted-foreground">—</p>
      )}
    </div>
  );
}

function CampoFecha({
  label,
  iso,
}: {
  label: string;
  iso: string | null;
}) {
  return (
    <div className="campo-detalle">
      <p className="text-xs text-muted-foreground">{label}</p>
      {iso ? (
        <p>{formatearFecha(iso)}</p>
      ) : (
        <p className="italic text-muted-foreground">—</p>
      )}
    </div>
  );
}

// ============================================================
// Helpers locales
// ============================================================

function formatearFecha(iso: string): string {
  const [yyyy, mm, dd] = iso.split('T')[0].split('-');
  return `${dd}/${mm}/${yyyy}`;
}

function formatearFechaHora(iso: string): string {
  const d = new Date(iso);
  const fecha = formatearFecha(d.toISOString());
  const hora = d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${fecha} ${hora}`;
}