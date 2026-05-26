/**
 * Timeline de acciones de una falla riel.
 *
 * FASE 5: los botones Editar/Eliminar ahora se cablean con handlers
 * reales que provee el componente padre (FallaRielDetallePage).
 *
 * Renderiza cronológicamente:
 *  - El evento de DETECCIÓN (desde falla.fecha) como primer evento
 *  - Cada FallaRielAccion del historial (desde falla.acciones[])
 *
 * El ingeniero ve de un vistazo:
 *  - Cuándo se detectó la falla
 *  - Qué intervenciones se han programado/ejecutado
 *  - El estado actual (último evento)
 *
 * Las acciones eliminadas (soft-deleted) NO se muestran aquí
 * porque el backend las filtra al cargar el detalle.
 */

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { BadgeEstadoFalla } from './badge-estado-falla';
import {
  EstadoFalla,
  LABEL_ACCION_RIEL,
} from '@/lib/types/enums/fallas.enum';
import type { AccionRielResponse } from '../types/accion-riel.types';

interface TimelineAccionesRielProps {
  /** Fecha de detección original (se renderiza como primer evento). */
  fechaDeteccion: string;
  /** Historial de acciones de la falla. */
  acciones: AccionRielResponse[] | undefined;
  /** Handler para editar una acción. Si no se provee, botón disabled. */
  onEditar?: (accion: AccionRielResponse) => void;
  /** Handler para eliminar una acción. Si no se provee, botón disabled. */
  onEliminar?: (accion: AccionRielResponse) => void;
}

export function TimelineAccionesRiel({
  fechaDeteccion,
  acciones,
  onEditar,
  onEliminar,
}: TimelineAccionesRielProps) {
  const lista = acciones ?? [];

  return (
    <div className="relative">
      {/* Línea vertical que conecta los eventos */}
      <div
        className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border"
        aria-hidden
      />

      <ol className="space-y-4">
        {/* PRIMER EVENTO — Detección (desde falla.fecha) */}
        <EventoTimeline
          icono="📍"
          fecha={fechaDeteccion}
          contenido={
            <span className="font-medium text-foreground">
              Falla detectada
            </span>
          }
          badge={<BadgeEstadoFalla estado={EstadoFalla.NO_ATENDIDO} size="sm" />}
        />

        {/* EVENTOS SIGUIENTES — Acciones del historial */}
        {lista.length === 0 ? (
          <li className="ml-12 text-sm italic text-muted-foreground">
            Aún no se han registrado intervenciones sobre esta falla.
          </li>
        ) : (
          lista.map((accion) => (
            <EventoTimeline
              key={accion.id}
              icono={iconoPorEstado(accion.conclusion)}
              fecha={accion.fechaEjecucion}
              contenido={
                <div className="space-y-1">
                  <div className="font-medium text-foreground">
                    {LABEL_ACCION_RIEL[accion.accion]}
                    {accion.pt && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        · PT {accion.pt}
                      </span>
                    )}
                  </div>
                  {accion.observaciones && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {accion.observaciones}
                    </p>
                  )}
                </div>
              }
              badge={<BadgeEstadoFalla estado={accion.conclusion} size="sm" />}
              acciones={
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={!onEditar}
                    onClick={() => onEditar?.(accion)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={!onEliminar}
                    onClick={() => onEliminar?.(accion)}
                  >
                    Eliminar
                  </Button>
                </>
              }
            />
          ))
        )}
      </ol>
    </div>
  );
}

// ============================================================
// Sub-componentes
// ============================================================

interface EventoTimelineProps {
  icono: string;
  /** Fecha en formato ISO o YYYY-MM-DD. Puede ser null para acciones sin fecha. */
  fecha: string | null;
  contenido: ReactNode;
  badge: ReactNode;
  /** Botones de acción a la derecha. Opcional. */
  acciones?: ReactNode;
}

function EventoTimeline({
  icono,
  fecha,
  contenido,
  badge,
  acciones,
}: EventoTimelineProps) {
  return (
    <li className="relative flex items-start gap-4">
      {/* Icono circular sobre la línea vertical */}
      <div
        className="
          relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center
          rounded-full border border-border bg-card text-base shadow-sm
        "
        aria-hidden
      >
        {icono}
      </div>

      {/* Cuerpo del evento */}
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              {fecha ? formatearFecha(fecha) : 'Sin fecha asignada'}
            </p>
            {contenido}
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">{badge}</div>
        </div>
        {acciones && <div className="mt-2 flex gap-1">{acciones}</div>}
      </div>
    </li>
  );
}

// ============================================================
// Helpers
// ============================================================

function iconoPorEstado(estado: EstadoFalla): string {
  switch (estado) {
    case EstadoFalla.NO_ATENDIDO:
      return '📍';
    case EstadoFalla.PROGRAMADO:
      return '🔧';
    case EstadoFalla.EN_EJECUCION:
      return '⏱️';
    case EstadoFalla.RESUELTO:
      return '✅';
    case EstadoFalla.CANCELADO:
      return '❌';
    case EstadoFalla.FALTA_VERIFICAR:
      return '❓';
    default:
      return '•';
  }
}

function formatearFecha(iso: string): string {
  const partes = iso.split('T')[0].split('-');
  if (partes.length !== 3) return iso;
  const [yyyy, mm, dd] = partes;
  return `${dd}/${mm}/${yyyy}`;
}