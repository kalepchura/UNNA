/**
 * Capa Desgaste General — 4 carriles paralelos con color fijo por vía+carril.
 *
 * Cada carril (PAR-IZQ, PAR-DER, IMPAR-IZQ, IMPAR-DER) tiene:
 *  - Una línea guía con su color fijo (independiente del semáforo)
 *  - Puntos de medición con color semáforo (verde/amarillo/rojo/gris)
 *  - Leyenda integrada que muestra los 4 colores de carril
 */

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

import { colorSemaforo, colorViaRiel, LEYENDA_VIAS_DESGASTE } from '../utils/colores';
import { TooltipPunto } from './tooltip-punto';
import type {
  LineaDesgaste,
  PuntoColoreadoDesgaste,
} from '../types/mapa-calor.types';
import type { UtilsEsquema } from './esquema-base';

interface CapaDesgasteGeneralProps {
  lineas: LineaDesgaste[];
  utils: UtilsEsquema;
}

export function CapaDesgasteGeneral({ lineas, utils }: CapaDesgasteGeneralProps) {
  if (!lineas.length || lineas.every((l) => l.puntos.length === 0)) {
    return (
      <text
        x={utils.ancho / 2}
        y={utils.alto / 2}
        textAnchor="middle"
        fontSize="14"
        className="fill-muted-foreground"
      >
        Sin elementos con mediciones de desgaste
      </text>
    );
  }

  const lineasOrdenadas = ordenarLineas(lineas).filter((l) => l.puntos.length > 0);
  const totalCarriles = lineasOrdenadas.length;
  const offsets = calcularOffsets(totalCarriles);

  const N = utils.estaciones.length;
  const numTramos = Math.max(0, N - 1);

  type Item = {
    p: PuntoColoreadoDesgaste;
    carrilIdx: number;
    via: string;
    riel: string;
    etiqueta: string;
  };

  const porTramo: Record<number, Record<number, Item[]>> = {};

  lineasOrdenadas.forEach((linea, carrilIdx) => {
    linea.puntos.forEach((p) => {
      const t = utils.tramoDeProgresiva(p.progresiva);
      if (!porTramo[t]) porTramo[t] = {};
      if (!porTramo[t][carrilIdx]) porTramo[t][carrilIdx] = [];
      porTramo[t][carrilIdx].push({
        p,
        carrilIdx,
        via: linea.via,
        riel: linea.riel,
        etiqueta: linea.etiqueta,
      });
    });
  });

  Object.values(porTramo).forEach((porCarril) => {
    Object.values(porCarril).forEach((items) => {
      items.sort((a, b) => a.p.progresiva - b.p.progresiva);
    });
  });

  return (
    <g>
      {/* Líneas guía coloreadas por vía+carril */}
      {Array.from({ length: numTramos }).map((_, i) =>
        lineasOrdenadas.map((linea, k) => {
          const color = colorViaRiel(linea.via, linea.riel);
          const off = offsets[k];
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

      {/* Puntos de medición (color semáforo) */}
      {Object.entries(porTramo).flatMap(([tStr, porCarril]) => {
        const t = +tStr;
        return Object.entries(porCarril).flatMap(([cStr, items]) => {
          const carrilIdx = +cStr;
          const offset = offsets[carrilIdx];
          return items.map((item, j) => {
            const frac = (j + 1) / (items.length + 1);
            const pos = utils.posEnTramo(t, frac, offset);
            const s = colorSemaforo(item.p.color);
            const tiene = item.p.valorMm != null;
            const id = `dg-${item.via}-${item.riel}-${item.p.codigoElemento}`;

            return (
              <HoverCard key={id} openDelay={150} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={3.5}
                    fill={s.bg}
                    stroke="white"
                    strokeWidth="1.2"
                    opacity={tiene ? 1 : 0.45}
                    style={{
                      cursor: 'pointer',
                      filter: tiene ? `drop-shadow(0 0 3px ${s.glow})` : 'none',
                    }}
                  />
                </HoverCardTrigger>
                <HoverCardContent side="right" className="w-auto p-2">
                  <TooltipPunto
                    codigo={`Elem #${item.p.codigoElemento}`}
                    nombre={item.etiqueta}
                    progresiva={item.p.progresiva}
                    valor={item.p.valorMm}
                    color={item.p.color}
                    unidad="mm"
                    via={item.via}
                    riel={item.riel}
                    extra={
                      item.p.anio && item.p.trimestre
                        ? `Q${item.p.trimestre} ${item.p.anio}`
                        : tiene
                          ? undefined
                          : 'Sin medición'
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ordenarLineas(lineas: LineaDesgaste[]): LineaDesgaste[] {
  const ordenVia  = (v: string) => ({ PAR: 0, IMPAR: 1, TERCERA: 2, CERO: 3 }[v] ?? 4);
  const ordenRiel = (r: string) => r.toUpperCase().includes('IZ') ? 0 : 1;
  return [...lineas].sort((a, b) => {
    const dv = ordenVia(a.via) - ordenVia(b.via);
    return dv !== 0 ? dv : ordenRiel(a.riel) - ordenRiel(b.riel);
  });
}

function calcularOffsets(total: number): number[] {
  if (total <= 0) return [];
  if (total === 1) return [0];
  const SEP = 8;
  const centro = (total - 1) / 2;
  return Array.from({ length: total }, (_, i) => (i - centro) * SEP);
}

// ─── Leyenda de vías (para usar en mapa-calor-page) ──────────────────────────

export function LeyendaViasDesgaste() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
      <span className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
        Carriles
      </span>
      {LEYENDA_VIAS_DESGASTE.map((lv) => (
        <div key={`${lv.via}-${lv.riel}`} className="flex items-center gap-1.5">
          <svg width="20" height="6" aria-hidden="true">
            <line x1="0" y1="3" x2="20" y2="3" stroke={lv.color} strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-muted-foreground">{lv.label}</span>
        </div>
      ))}
    </div>
  );
}