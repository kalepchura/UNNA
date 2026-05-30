/**
 * Capa Fallas del Mapa de Calor — sobre el esqueleto SVG.
 *
 *  - TRAMO            → línea coloreada del tramo entero (sin carriles guía)
 *  - CAMBIAVIA        → 1 carril por vía (PAR, IMPAR, TERCERA, CERO)
 *  - CURVA_HORIZONTAL → 2 carriles (PAR, IMPAR)
 *  - CURVA_VERTICAL   → 2 carriles (PAR, IMPAR)
 *
 * Las líneas guía en modo CAMBIAVIA/CURVA usan colorVia(via) para
 * identificar visualmente cada vía, igual que desgaste usa colorViaRiel.
 *
 * REGLAS de posicionamiento:
 * - Todos los call sites de tramoDeProgresiva usan SOLO progresivaInicio.
 *   Pasar progresivaFin causaba que curvas/cambiavías apareciesen en el
 *   tramo siguiente al correcto.
 * - Para el cálculo de "cruza N tramos" del tooltip, tFin sí usa
 *   progresivaFin porque necesitamos saber dónde termina el elemento.
 */

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

import { colorSemaforo, colorVia, COLOR_VIA } from '../utils/colores';
import { TooltipTramo } from './tooltip-tramo';
import { TooltipPunto } from './tooltip-punto';
import type {
  LineaFallas,
  ElementoColoreadoFallas,
  SegmentacionFallas,
} from '../types/mapa-calor.types';
import type { UtilsEsquema } from './esquema-base';

const ORDEN_VIAS_CAMBIAVIA = ['PAR', 'IMPAR', 'TERCERA', 'CERO'];
const ORDEN_VIAS_CURVA     = ['PAR', 'IMPAR'];

interface CapaFallasProps {
  lineas:        LineaFallas[];
  segmentacion:  SegmentacionFallas;
  utils:         UtilsEsquema;
}

export function CapaFallas({ lineas, segmentacion, utils }: CapaFallasProps) {
  if (!lineas.length || lineas.every((l) => l.elementos.length === 0)) {
    return (
      <text
        x={utils.ancho / 2}
        y={utils.alto / 2}
        textAnchor="middle"
        fontSize="14"
        className="fill-muted-foreground"
      >
        Sin fallas en el período seleccionado
      </text>
    );
  }

  if (segmentacion === 'TRAMO') {
    const elementos = lineas.flatMap((l) => l.elementos);
    return <FallasPorTramo elementos={elementos} utils={utils} />;
  }

  const orden =
    segmentacion === 'CAMBIAVIA' ? ORDEN_VIAS_CAMBIAVIA : ORDEN_VIAS_CURVA;

  const lineasConDatos = orden
    .map((via) => lineas.find((l) => l.via === via))
    .filter((l): l is LineaFallas => !!l && l.elementos.length > 0);

  if (!lineasConDatos.length) return null;

  return (
    <FallasPorVia
      lineas={lineasConDatos}
      segmentacion={segmentacion}
      utils={utils}
    />
  );
}

// ─── Modo TRAMO ─────────────────────────────────────────────────────────────

function FallasPorTramo({
  elementos,
  utils,
}: {
  elementos: ElementoColoreadoFallas[];
  utils:     UtilsEsquema;
}) {
  return (
    <g>
      {elementos.map((e) => {
        // Usar solo progresivaInicio — el tramo de falla completo
        // siempre empieza en la progresiva de la estación inicial del tramo.
        const i = utils.tramoDeProgresiva(e.progresivaInicio);
        const d = utils.getPathTramo(i, 0);
        if (!d) return null;
        const s     = colorSemaforo(e.color);
        const tiene = e.cantidadFallas > 0;

        return (
          <HoverCard key={`tr-${e.codigo}`} openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
              <g style={{ cursor: 'pointer' }}>
                <path
                  d={d}
                  stroke={s.bg}
                  strokeWidth="11"
                  strokeLinecap="butt"
                  fill="none"
                  opacity={tiene ? 0.9 : 0.5}
                  style={{ filter: tiene ? `drop-shadow(0 0 4px ${s.glow})` : 'none' }}
                />
                {/* Área de hit transparente más ancha para mejor UX */}
                <path d={d} stroke="transparent" strokeWidth="20" fill="none" />
              </g>
            </HoverCardTrigger>
            <HoverCardContent side="right" className="w-auto p-2">
              <TooltipTramo
                codigo={e.codigo}
                nombre={e.nombre}
                progresivaInicio={e.progresivaInicio}
                progresivaFin={e.progresivaFin}
                valor={e.cantidadFallas}
                color={e.color}
                unidad="fallas"
              />
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </g>
  );
}

// ─── Modo CAMBIAVIA / CURVA_* ────────────────────────────────────────────────

function FallasPorVia({
  lineas,
  segmentacion,
  utils,
}: {
  lineas:       LineaFallas[];
  segmentacion: SegmentacionFallas;
  utils:        UtilsEsquema;
}) {
  const totalCarriles = lineas.length;
  const offsets       = calcularOffsets(totalCarriles);

  const N        = utils.estaciones.length;
  const numTramos = Math.max(0, N - 1);

  type ItemEnTramo = {
    el:         ElementoColoreadoFallas;
    viaIdx:     number;
    viaNombre:  string;
  };
  const porTramo: Record<number, Record<number, ItemEnTramo[]>> = {};

  lineas.forEach((linea, viaIdx) => {
    linea.elementos.forEach((el) => {
      // Usar solo progresivaInicio — las curvas/cambiavías deben aparecer
      // en el tramo donde comienzan, no en el punto medio inicio+fin.
      const t = utils.tramoDeProgresiva(el.progresivaInicio);
      if (!porTramo[t])          porTramo[t]        = {};
      if (!porTramo[t][viaIdx])  porTramo[t][viaIdx] = [];
      porTramo[t][viaIdx].push({ el, viaIdx, viaNombre: linea.via });
    });
  });

  Object.values(porTramo).forEach((porVia) => {
    Object.values(porVia).forEach((items) => {
      items.sort((a, b) => a.el.progresivaInicio - b.el.progresivaInicio);
    });
  });

  const etiquetaTipo =
    segmentacion === 'CURVA_HORIZONTAL'
      ? 'Curva horizontal'
      : segmentacion === 'CURVA_VERTICAL'
        ? 'Curva vertical'
        : 'Cambiavía';

  return (
    <g>
      {/* Líneas guía coloreadas por vía */}
      {Array.from({ length: numTramos }).map((_, i) =>
        lineas.map((linea, k) => {
          const color = colorVia(linea.via);
          const off   = offsets[k];
          return (
            <path
              key={`carril-${i}-${k}`}
              d={utils.getPathTramo(i, off)}
              stroke={color}
              strokeWidth="1.5"
              fill="none"
              opacity="0.45"
            />
          );
        }),
      )}

      {/* Elementos (puntos con color semáforo) */}
      {Object.entries(porTramo).flatMap(([tStr, porVia]) => {
        const t = +tStr;
        return Object.entries(porVia).flatMap(([viaIdxStr, items]) => {
          const viaIdx = +viaIdxStr;
          const offset = offsets[viaIdx];
          return items.map((item, j) => {
            const frac  = (j + 1) / (items.length + 1);
            const pos   = utils.posEnTramo(t, frac, offset);
            const s     = colorSemaforo(item.el.color);
            const tiene = item.el.cantidadFallas > 0;
            const id    = `fl-${item.viaNombre}-${item.el.codigo}`;

            // tIni: tramo donde empieza el elemento (por progresivaInicio)
            // tFin: tramo donde termina (por progresivaFin) — solo para el tooltip
            const tIni = utils.tramoDeProgresiva(item.el.progresivaInicio);
            const tFin = utils.tramoDeProgresiva(item.el.progresivaFin);
            const cruza = tFin > tIni;

            return (
              <HoverCard key={id} openDelay={150} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={4}
                    fill={s.bg}
                    stroke="white"
                    strokeWidth="1.2"
                    opacity={tiene ? 0.95 : 0.5}
                    style={{
                      cursor: 'pointer',
                      filter: tiene ? `drop-shadow(0 0 4px ${s.glow})` : 'none',
                    }}
                  />
                </HoverCardTrigger>
                <HoverCardContent side="right" className="w-auto p-2">
                  <TooltipPunto
                    codigo={item.el.codigo}
                    nombre={item.el.nombre}
                    progresiva={item.el.progresivaInicio}
                    progresivaFin={
                      item.el.progresivaFin !== item.el.progresivaInicio
                        ? item.el.progresivaFin
                        : undefined
                    }
                    valor={item.el.cantidadFallas}
                    color={item.el.color}
                    unidad="fallas"
                    via={item.viaNombre}
                    extra={
                      cruza
                        ? `${etiquetaTipo} · Cruza ${tFin - tIni + 1} tramos`
                        : etiquetaTipo
                    }
                  />
                </HoverCardContent>
              </HoverCard>
            );
          });
        });
      })}
    </g>
  );
}

// ─── Leyenda de vías (para usar en mapa-calor-page) ─────────────────────────

/**
 * Muestra los colores de vía para los modos CAMBIAVIA y CURVA.
 * Se exporta para que mapa-calor-page la añada debajo de la leyenda
 * de semáforo cuando la segmentación no es TRAMO.
 */
export function LeyendaViasFallas({
  segmentacion,
}: {
  segmentacion: SegmentacionFallas;
}) {
  if (segmentacion === 'TRAMO') return null;

  const vias =
    segmentacion === 'CAMBIAVIA'
      ? ['PAR', 'IMPAR', 'TERCERA', 'CERO']
      : ['PAR', 'IMPAR']; // CURVA_HORIZONTAL y CURVA_VERTICAL

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
      <span className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
        Vías
      </span>
      {vias.map((via) => (
        <div key={via} className="flex items-center gap-1.5">
          <svg width="20" height="6" aria-hidden="true">
            <line
              x1="0" y1="3" x2="20" y2="3"
              stroke={COLOR_VIA[via] ?? '#475569'}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-muted-foreground">Vía {via}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcularOffsets(total: number): number[] {
  if (total <= 0) return [];
  if (total === 1) return [0];
  const SEP    = 8;
  const centro = (total - 1) / 2;
  return Array.from({ length: total }, (_, i) => (i - centro) * SEP);
}