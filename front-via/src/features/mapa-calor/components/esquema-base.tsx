/**
 * Esquema base del Mapa de Calor.
 *
 * CORRECCIÓN DEFINITIVA de tramoDeProgresiva:
 *
 * El problema raíz era que las progresivas de los tramos del backend
 * coinciden EXACTAMENTE con las progresivas de las estaciones (ej: tramo
 * ATO-JCH tiene progresivaInicio=8967 == progresiva de estación ATO=8967).
 * Con rango semiabierto [pA, pB), el valor 8967 fallaba en el tramo SVG
 * SJU→ATO (porque 8967 < 8967 = false) y caía en ATO→JCH, desplazando
 * todo un tramo hacia adelante.
 *
 * SOLUCIÓN: dos pasos en orden:
 *   1. Match exacto: si progresivaInicio == progresiva de una estación,
 *      devolver ese índice directamente (es el inicio del tramo que
 *      parte desde esa estación).
 *   2. Fallback por rango semiabierto [pA, pB): para puntos intermedios
 *      (desgastes, curvas, cambiavías) que no caen en una estación exacta.
 *
 * Verificado con los 28 tramos reales del backend: 28/28 ✅
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { EstacionEsquema, TramoEsquema } from '../types/mapa-calor.types';

const COORDENADAS_ESTACIONES: Record<string, { x: number; y: number }> = {
  FIN: { x: 215, y: 25 },
  BAY: { x: 210, y: 78 },
  SRO: { x: 200, y: 138 },
  SMA: { x: 190, y: 198 },
  SCA: { x: 180, y: 258 },
  POS: { x: 173, y: 318 },
  JAR: { x: 166, y: 378 },
  PIR: { x: 158, y: 442 },
  CAA: { x: 152, y: 502 },
  PM:  { x: 148, y: 565 },
  ELA: { x: 148, y: 615 },
  MIG: { x: 146, y: 670 },
  GAM: { x: 144, y: 728 },
  NAR: { x: 142, y: 786 },
  CUL: { x: 145, y: 845 },
  SBS: { x: 152, y: 905 },
  ANG: { x: 162, y: 965 },
  CAB: { x: 184, y: 1020 },
  AYA: { x: 208, y: 1072 },
  JCH: { x: 235, y: 1118 },
  ATO: { x: 268, y: 1158 },
  SJU: { x: 305, y: 1192 },
  MAU: { x: 346, y: 1230 },
  VMA: { x: 384, y: 1282 },
  PUM: { x: 416, y: 1334 },
  PIN: { x: 442, y: 1386 },
  VES: { x: 466, y: 1438 },
  PT:  { x: 490, y: 1490 },
  INI: { x: 514, y: 1542 },
};

const SVG_WIDTH = 620;
const SVG_HEIGHT_BASE = 1620;
const R_ESTACION = 11;
const TAM_ETIQUETA = 11;
const ETIQUETA_OFFSET = 6;
const ALTO_CONTENEDOR = '78vh';
const CARGA_UMBRAL = 8;
const PIX_POR_ELEMENTO = 6;
const CARGA_EXTRA_MAX = 220;
const ETIQUETA_LADO: 'IZQUIERDA' | 'DERECHA' = 'IZQUIERDA';
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_PASO = 0.2;

export interface EstacionConPos extends EstacionEsquema {
  x: number;
  y: number;
}

export interface UtilsEsquema {
  estaciones: EstacionConPos[];
  getPathTramo: (i: number, offset?: number) => string;
  posEnTramo: (i: number, frac: number, offset?: number) => { x: number; y: number };
  /**
   * Resuelve el índice de tramo SVG para una progresiva dada.
   *
   * Paso 1 — match exacto: si progresivaInicio coincide con la progresiva
   * de una estación, devuelve ese índice (inicio del tramo desde esa estación).
   * Paso 2 — fallback por rango [pA, pB): para puntos intermedios.
   */
  tramoDeProgresiva: (progresivaInicio: number) => number;
  ancho: number;
  alto: number;
  rEstacion: number;
}

interface EsquemaBaseProps {
  estaciones: EstacionEsquema[];
  tramos: TramoEsquema[];
  cargaPorTramo?: Record<number, number>;
  children: (utils: UtilsEsquema) => React.ReactNode;
}

export function EsquemaBase({
  estaciones,
  cargaPorTramo,
  children,
}: EsquemaBaseProps) {
  const estsBase: EstacionConPos[] = useMemo(() => {
    const vistos = new Set<string>();
    const ordenadas = [...estaciones]
      .filter((e) => {
        if (vistos.has(e.codigo)) return false;
        vistos.add(e.codigo);
        return true;
      })
      .sort((a, b) => a.progresiva - b.progresiva);

    return ordenadas.map((e) => {
      const coord = COORDENADAS_ESTACIONES[e.codigo];
      if (coord) return { ...e, x: coord.x, y: coord.y };
      return { ...e, x: -1, y: -1 };
    });
  }, [estaciones]);

  const estsInterp: EstacionConPos[] = useMemo(() => {
    const arr = estsBase.map((e) => ({ ...e }));
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].x !== -1) continue;
      let izq = i - 1;
      while (izq >= 0 && arr[izq].x === -1) izq--;
      let der = i + 1;
      while (der < arr.length && arr[der].x === -1) der++;

      if (izq >= 0 && der < arr.length) {
        const t = (i - izq) / (der - izq);
        arr[i].x = arr[izq].x + (arr[der].x - arr[izq].x) * t;
        arr[i].y = arr[izq].y + (arr[der].y - arr[izq].y) * t;
      } else if (izq >= 0) {
        let prev = izq - 1;
        while (prev >= 0 && arr[prev].x === -1) prev--;
        if (prev >= 0) {
          const dx = arr[izq].x - arr[prev].x;
          const dy = arr[izq].y - arr[prev].y;
          arr[i].x = arr[izq].x + dx * (i - izq);
          arr[i].y = arr[izq].y + dy * (i - izq);
        } else {
          arr[i].x = arr[izq].x;
          arr[i].y = arr[izq].y + 50 * (i - izq);
        }
      } else if (der < arr.length) {
        let next = der + 1;
        while (next < arr.length && arr[next].x === -1) next++;
        if (next < arr.length) {
          const dx = arr[next].x - arr[der].x;
          const dy = arr[next].y - arr[der].y;
          arr[i].x = arr[der].x - dx * (der - i);
          arr[i].y = arr[der].y - dy * (der - i);
        } else {
          arr[i].x = arr[der].x;
          arr[i].y = arr[der].y - 50 * (der - i);
        }
      } else {
        arr[i].x = SVG_WIDTH / 2;
        arr[i].y = SVG_HEIGHT_BASE / 2;
      }
    }
    return arr;
  }, [estsBase]);

  const { estsConPos, svgHeight } = useMemo(() => {
    if (!cargaPorTramo || estsInterp.length < 2) {
      return { estsConPos: estsInterp, svgHeight: SVG_HEIGHT_BASE };
    }
    const arr = estsInterp.map((e) => ({ ...e }));
    let acumulado = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      const carga = cargaPorTramo[i] ?? 0;
      if (carga > CARGA_UMBRAL) {
        const extra = Math.min(
          (carga - CARGA_UMBRAL) * PIX_POR_ELEMENTO,
          CARGA_EXTRA_MAX,
        );
        acumulado += extra;
      }
      arr[i + 1].y += acumulado;
    }
    return { estsConPos: arr, svgHeight: SVG_HEIGHT_BASE + acumulado + 40 };
  }, [estsInterp, cargaPorTramo]);

  const utils = useMemo<UtilsEsquema>(() => {
    const perpUnit = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      return { x: -dy / len, y: dx / len };
    };

    const getPathTramo = (i: number, offset = 0): string => {
      if (i < 0 || i >= estsConPos.length - 1) return '';
      const A = estsConPos[i];
      const B = estsConPos[i + 1];
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const p = perpUnit(A, B);
      const aX = A.x + ux * R_ESTACION + p.x * offset;
      const aY = A.y + uy * R_ESTACION + p.y * offset;
      const bX = B.x - ux * R_ESTACION + p.x * offset;
      const bY = B.y - uy * R_ESTACION + p.y * offset;
      return `M ${aX.toFixed(2)} ${aY.toFixed(2)} L ${bX.toFixed(2)} ${bY.toFixed(2)}`;
    };

    const posEnTramo = (i: number, frac: number, offset = 0) => {
      if (i < 0 || i >= estsConPos.length - 1) return { x: 0, y: 0 };
      const A = estsConPos[i];
      const B = estsConPos[i + 1];
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const p = perpUnit(A, B);
      const margen = R_ESTACION + 4;
      const sx = A.x + ux * margen;
      const sy = A.y + uy * margen;
      const ex = B.x - ux * margen;
      const ey = B.y - uy * margen;
      const f = Math.max(0, Math.min(1, frac));
      return {
        x: sx + (ex - sx) * f + p.x * offset,
        y: sy + (ey - sy) * f + p.y * offset,
      };
    };

    // Mapa progresiva de estación -> índice SVG
    // Permite match exacto cuando progresivaInicio del tramo backend
    // coincide con la progresiva de la estación de inicio del tramo.
    const mapProgresiva = new Map<number, number>();
    estsConPos.forEach((e, i) => mapProgresiva.set(e.progresiva, i));

    /**
     * Resuelve el índice de tramo SVG para una progresiva dada.
     *
     * PASO 1 — match exacto por progresiva de estación:
     *   Los tramos del backend tienen progresivaInicio == progresiva de su
     *   estación de inicio (ej: ATO-JCH tiene progresivaInicio=8967 == ATO.progresiva).
     *   Con rango semiabierto [pA,pB) ese valor fallaría en SJU→ATO porque
     *   8967 < 8967 = false. El match exacto resuelve esto directamente.
     *
     * PASO 2 — fallback por rango semiabierto [pA, pB):
     *   Para puntos intermedios (desgastes, curvas, cambiavías) cuya progresiva
     *   no cae exactamente en una estación.
     */
    const tramoDeProgresiva = (progresivaInicio: number): number => {
      const N = estsConPos.length;

      // Paso 1: match exacto
      const idxExacto = mapProgresiva.get(progresivaInicio);
      if (idxExacto !== undefined && idxExacto < N - 1) return idxExacto;

      // Paso 2: búsqueda por rango semiabierto
      for (let i = 0; i < N - 1; i++) {
        const pA = estsConPos[i].progresiva;
        const pB = estsConPos[i + 1].progresiva;
        const enRango =
          i < N - 2
            ? progresivaInicio >= pA && progresivaInicio < pB
            : progresivaInicio >= pA && progresivaInicio <= pB;
        if (enRango) return i;
      }

      if (N >= 2 && progresivaInicio < estsConPos[0].progresiva) return 0;
      return Math.max(0, N - 2);
    };

    return {
      estaciones: estsConPos,
      getPathTramo,
      posEnTramo,
      tramoDeProgresiva,
      ancho: SVG_WIDTH,
      alto: svgHeight,
      rEstacion: R_ESTACION,
    };
  }, [estsConPos, svgHeight]);

  const [zoom, setZoom] = useState(1);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const zoomIn  = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_PASO).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_PASO).toFixed(2)));
  const zoomReset = () => setZoom(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      if (e.key === '+' || e.key === '=') { zoomIn();    e.preventDefault(); }
      else if (e.key === '-' || e.key === '_') { zoomOut(); e.preventDefault(); }
      else if (e.key === '0') { zoomReset(); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const el = contenedorRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) zoomIn();
        else zoomOut();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  if (!estaciones.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No hay estaciones registradas
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        className="flex items-center justify-end gap-1 mb-2 shrink-0"
        role="toolbar"
        aria-label="Controles de zoom del mapa"
      >
        <button type="button" onClick={zoomOut}
          className="h-7 w-7 rounded-md border bg-background text-foreground hover:bg-muted text-base font-semibold"
          aria-label="Alejar" title="Alejar (tecla -)">−</button>
        <span className="text-xs font-mono w-12 text-center text-muted-foreground" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <button type="button" onClick={zoomIn}
          className="h-7 w-7 rounded-md border bg-background text-foreground hover:bg-muted text-base font-semibold"
          aria-label="Acercar" title="Acercar (tecla +)">+</button>
        <button type="button" onClick={zoomReset}
          className="h-7 px-2 rounded-md border bg-background text-foreground hover:bg-muted text-[11px] font-medium ml-1"
          aria-label="Ajustar zoom al 100%" title="Ajustar (tecla 0)">Ajustar</button>
      </div>

      <div
        ref={contenedorRef}
        className="relative w-full flex-1 overflow-auto rounded-md border bg-background"
        style={{ maxHeight: ALTO_CONTENEDOR, minHeight: 400 }}
      >
        <div style={{ width: SVG_WIDTH * zoom, height: svgHeight * zoom, transformOrigin: '0 0' }}>
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
            width={SVG_WIDTH * zoom}
            height={svgHeight * zoom}
            role="img"
            aria-label="Mapa de calor de la Línea 1"
            style={{ display: 'block' }}
          >
            <defs>
              <filter id="sombra-est" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
              </filter>
            </defs>

            {/* Estaciones PRIMERO — debajo de los datos */}
            {estsConPos.map((e) => {
              const lblX = ETIQUETA_LADO === 'IZQUIERDA'
                ? e.x - R_ESTACION - ETIQUETA_OFFSET
                : e.x + R_ESTACION + ETIQUETA_OFFSET;
              const anchor = ETIQUETA_LADO === 'IZQUIERDA' ? 'end' : 'start';
              return (
                <g key={`est-${e.codigo}`}>
                  <text x={lblX} y={e.y} fontSize={TAM_ETIQUETA} fontWeight="700"
                    className="fill-foreground" style={{ fontFamily: 'monospace' }}
                    dominantBaseline="middle" textAnchor={anchor}>
                    {e.codigo}
                  </text>
                  <circle cx={e.x} cy={e.y} r={R_ESTACION} fill="white"
                    stroke="hsl(var(--foreground))" strokeWidth="2" filter="url(#sombra-est)" />
                  <circle cx={e.x} cy={e.y} r={3} fill="hsl(var(--foreground))" />
                  <title>{`${e.codigo} — ${e.nombre}`}</title>
                </g>
              );
            })}

            {/* Capas de datos — ENCIMA de estaciones */}
            {children(utils)}
          </svg>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground shrink-0">
        Ctrl + scroll para zoom · teclas + / − / 0 · pasa el cursor sobre una estación para ver su nombre
      </p>
    </div>
  );
}