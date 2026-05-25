/**
 * Capa Desgaste Índice — 4 carriles paralelos sin franja de fondo.
 *
 * Idéntica estructura a CapaDesgasteGeneral, pero el tooltip muestra
 * el índice A/B en lugar del valor en mm.
 *
 * CORRECCIÓN:
 * - tramoDeProgresiva recibe solo p.progresiva (punto fijo, sin extensión).
 *   No se pasa progresivaFin porque los puntos de índice son mediciones
 *   puntuales, no elementos con extensión.
 */

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

import { colorSemaforo } from '../utils/colores';
import { TooltipPunto } from './tooltip-punto';
import { fmtValor } from '../utils/formato';
import type {
  LineaDesgasteIndice,
  PuntoColoreadoIndice,
} from '../types/mapa-calor.types';
import type { UtilsEsquema } from './esquema-base';

interface CapaDesgasteIndiceProps {
  lineas: LineaDesgasteIndice[];
  utils: UtilsEsquema;
}

export function CapaDesgasteIndice({
  lineas,
  utils,
}: CapaDesgasteIndiceProps) {
  if (!lineas.length || lineas.every((l) => l.puntos.length === 0)) {
    return (
      <text
        x={utils.ancho / 2}
        y={utils.alto / 2}
        textAnchor="middle"
        fontSize="14"
        className="fill-muted-foreground"
      >
        Sin datos para calcular el índice comparativo
      </text>
    );
  }

  const lineasOrdenadas = ordenarLineas(lineas).filter(
    (l) => l.puntos.length > 0,
  );
  const totalCarriles = lineasOrdenadas.length;
  const offsets = calcularOffsets(totalCarriles);

  const N = utils.estaciones.length;
  const numTramos = Math.max(0, N - 1);

  type Item = {
    p: PuntoColoreadoIndice;
    carrilIdx: number;
    via: string;
    riel: string;
    etiqueta: string;
  };
  const porTramo: Record<number, Record<number, Item[]>> = {};

  lineasOrdenadas.forEach((linea, carrilIdx) => {
    linea.puntos.forEach((p) => {
      // Punto fijo: usar p.progresiva directamente, sin extensión.
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
      {/* Solo carriles guía finos — SIN franja de fondo */}
      {Array.from({ length: numTramos }).map((_, i) =>
        offsets.map((off, k) => (
          <path
            key={`carril-${i}-${k}`}
            d={utils.getPathTramo(i, off)}
            stroke="#cbd5e1"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        )),
      )}

      {/* Puntos */}
      {Object.entries(porTramo).flatMap(([tStr, porCarril]) => {
        const t = +tStr;
        return Object.entries(porCarril).flatMap(([cStr, items]) => {
          const carrilIdx = +cStr;
          const offset = offsets[carrilIdx];
          return items.map((item, j) => {
            const frac = (j + 1) / (items.length + 1);
            const pos = utils.posEnTramo(t, frac, offset);
            const s = colorSemaforo(item.p.color);
            const tiene = item.p.indice != null;
            const id = `di-${item.via}-${item.riel}-${item.p.codigoElemento}`;

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
                      filter: tiene
                        ? `drop-shadow(0 0 3px ${s.glow})`
                        : 'none',
                    }}
                  />
                </HoverCardTrigger>
                <HoverCardContent side="right" className="w-auto p-2">
                  <TooltipPunto
                    codigo={`Elem #${item.p.codigoElemento}`}
                    nombre={item.etiqueta}
                    progresiva={item.p.progresiva}
                    valor={item.p.indice}
                    color={item.p.color}
                    unidad=""
                    via={item.via}
                    riel={item.riel}
                    extra={buildExtraIndice(item.p)}
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

// ─── Helpers ────────────────────────────────────────────────────────

function ordenarLineas(
  lineas: LineaDesgasteIndice[],
): LineaDesgasteIndice[] {
  const ordenVia = (via: string) => {
    if (via === 'PAR') return 0;
    if (via === 'IMPAR') return 1;
    if (via === 'TERCERA') return 2;
    if (via === 'CERO') return 3;
    return 4;
  };
  const ordenRiel = (riel: string) =>
    riel.toUpperCase().includes('IZ') ? 0 : 1;

  return [...lineas].sort((a, b) => {
    const dv = ordenVia(a.via) - ordenVia(b.via);
    if (dv !== 0) return dv;
    return ordenRiel(a.riel) - ordenRiel(b.riel);
  });
}

function calcularOffsets(total: number): number[] {
  if (total <= 0) return [];
  if (total === 1) return [0];
  const SEP = 8;
  const centro = (total - 1) / 2;
  return Array.from({ length: total }, (_, i) => (i - centro) * SEP);
}

function buildExtraIndice(p: PuntoColoreadoIndice): string | undefined {
  const partes: string[] = [];
  if (p.valorA != null) {
    const q =
      p.anioA && p.trimestreA ? ` (Q${p.trimestreA} ${p.anioA})` : '';
    partes.push(`A: ${fmtValor(p.valorA, 'mm')}${q}`);
  }
  if (p.valorB != null) {
    const q =
      p.anioB && p.trimestreB ? ` (Q${p.trimestreB} ${p.anioB})` : '';
    partes.push(`B: ${fmtValor(p.valorB, 'mm')}${q}`);
  }
  return partes.length > 0 ? partes.join(' · ') : undefined;
}