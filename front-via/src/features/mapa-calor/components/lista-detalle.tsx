/**
 * Lista de detalle del Mapa de Calor.
 *
 * Tabla inferior que muestra todos los elementos de la capa activa
 * con filtro por color semáforo.
 */

import { useState } from 'react';
import { colorSemaforo, type ColorSemaforo } from '../utils/colores';
import { fmtProgresiva, fmtValor } from '../utils/formato';
import type {
  TramoColoreadoTemperatura,
  PuntoColoreadoIndice,
  LineaDesgaste,
  LineaDesgasteIndice,
  LineaFallas,
} from '../types/mapa-calor.types';

type FilaDetalle = {
  codigo: string;
  nombre: string;
  progresivaInicio: number;
  progresivaFin?: number | null;
  valor: number | null;
  color: ColorSemaforo;
  extra?: string;
  via?: string;
  riel?: string;
};

// ── Adaptadores por capa ─────────────────────────────────────────────────────

function tramosTemperaturaAFilas(
  tramos: TramoColoreadoTemperatura[],
): FilaDetalle[] {
  return tramos.map((t) => ({
    codigo: t.codigo,
    nombre: t.nombre,
    progresivaInicio: t.progresivaInicio,
    progresivaFin: t.progresivaFin,
    valor: t.valor,
    color: t.color,
    extra:
      t.cantidadMediciones > 0
        ? `${t.cantidadMediciones} med.`
        : 'Sin mediciones',
  }));
}

function lineasFallasAFilas(lineas: LineaFallas[]): FilaDetalle[] {
  return lineas.flatMap((l) =>
    l.elementos.map((el) => ({
      codigo: el.codigo,
      nombre: el.nombre,
      progresivaInicio: el.progresivaInicio,
      progresivaFin: el.progresivaFin,
      valor: el.cantidadFallas,
      color: el.color,
      via: l.via,
    })),
  );
}

function lineasDesgasteAFilas(lineas: LineaDesgaste[]): FilaDetalle[] {
  return lineas.flatMap((l) =>
    l.puntos.map((p) => ({
      codigo: `Elem #${p.codigoElemento}`,
      nombre: l.etiqueta,
      progresivaInicio: p.progresiva,
      valor: p.valorMm,
      color: p.color,
      via: l.via,
      riel: l.riel,
      extra:
        p.anio && p.trimestre ? `Q${p.trimestre} ${p.anio}` : undefined,
    })),
  );
}

function lineasIndiceAFilas(lineas: LineaDesgasteIndice[]): FilaDetalle[] {
  return lineas.flatMap((l) =>
    l.puntos.map((p) => ({
      codigo: `Elem #${p.codigoElemento}`,
      nombre: l.etiqueta,
      progresivaInicio: p.progresiva,
      valor: p.indice,
      color: p.color,
      via: l.via,
      riel: l.riel,
      extra: buildExtraIndice(p),
    })),
  );
}

function buildExtraIndice(p: PuntoColoreadoIndice): string | undefined {
  const partes: string[] = [];
  if (p.valorA != null) partes.push(`A: ${p.valorA.toFixed(2)} mm`);
  if (p.valorB != null) partes.push(`B: ${p.valorB.toFixed(2)} mm`);
  return partes.length > 0 ? partes.join(' · ') : undefined;
}

// ── Props ────────────────────────────────────────────────────────────────────

type CapaListable =
  | { tipo: 'temperatura'; tramos: TramoColoreadoTemperatura[] }
  | { tipo: 'fallas'; lineas: LineaFallas[] }
  | { tipo: 'desgaste-general'; lineas: LineaDesgaste[] }
  | { tipo: 'desgaste-indice'; lineas: LineaDesgasteIndice[] };

interface ListaDetalleProps {
  capa: CapaListable;
  /** Unidad a mostrar en la columna de valor */
  unidad: string;
}

const COLORES_FILTRO: { color: ColorSemaforo; label: string }[] = [
  { color: 'ROJO', label: 'Crítico' },
  { color: 'AMARILLO', label: 'Atención' },
  { color: 'VERDE', label: 'Normal' },
  { color: 'GRIS', label: 'Sin datos' },
];

export function ListaDetalle({ capa, unidad }: ListaDetalleProps) {
  const [filtroColor, setFiltroColor] = useState<ColorSemaforo | 'TODOS'>(
    'TODOS',
  );

  // Convertir según la capa activa
  let filas: FilaDetalle[] = [];
  if (capa.tipo === 'temperatura') {
    filas = tramosTemperaturaAFilas(capa.tramos);
  } else if (capa.tipo === 'fallas') {
    filas = lineasFallasAFilas(capa.lineas);
  } else if (capa.tipo === 'desgaste-general') {
    filas = lineasDesgasteAFilas(capa.lineas);
  } else if (capa.tipo === 'desgaste-indice') {
    filas = lineasIndiceAFilas(capa.lineas);
  }

  const filasFiltradas =
    filtroColor === 'TODOS'
      ? filas
      : filas.filter((f) => f.color === filtroColor);

  // Conteo por color
  const conteo = (c: ColorSemaforo) =>
    filas.filter((f) => f.color === c).length;

  const tieneVia = filas.some((f) => f.via);
  const tieneRiel = filas.some((f) => f.riel);

  return (
    <div className="mt-2 space-y-3">
      {/* Filtros por color */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Filtrar:</span>

        <button
          onClick={() => setFiltroColor('TODOS')}
          className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
            filtroColor === 'TODOS'
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Todos ({filas.length})
        </button>

        {COLORES_FILTRO.map(({ color, label }) => {
          const s = colorSemaforo(color);
          const n = conteo(color);
          const activo = filtroColor === color;
          return (
            <button
              key={color}
              onClick={() => setFiltroColor(color)}
              className="flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium transition-all"
              style={{
                backgroundColor: activo ? s.bg : s.bgSoft,
                color: activo ? 'white' : s.text,
                border: `1px solid ${activo ? s.bg : 'transparent'}`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: activo ? 'white' : s.bg }}
              />
              {label} ({n})
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      {filasFiltradas.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No hay elementos para el filtro seleccionado
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Código
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Nombre
                </th>
                {tieneVia && (
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Vía
                  </th>
                )}
                {tieneRiel && (
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Riel
                  </th>
                )}
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Progresiva
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Valor
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Info
                </th>
              </tr>
            </thead>
            <tbody>
              {filasFiltradas.map((fila, idx) => {
                const s = colorSemaforo(fila.color);
                return (
                  <tr
                    key={`${fila.codigo}-${idx}`}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    {/* Semáforo */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: s.bg,
                            boxShadow: `0 0 4px ${s.glow}`,
                          }}
                        />
                        <span style={{ color: s.text }}>{s.label}</span>
                      </div>
                    </td>
                    {/* Código */}
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {fila.codigo}
                    </td>
                    {/* Nombre */}
                    <td className="px-3 py-2 font-medium">{fila.nombre}</td>
                    {/* Vía */}
                    {tieneVia && (
                      <td className="px-3 py-2 text-muted-foreground">
                        {fila.via ?? '—'}
                      </td>
                    )}
                    {/* Riel */}
                    {tieneRiel && (
                      <td className="px-3 py-2 text-muted-foreground">
                        {fila.riel ?? '—'}
                      </td>
                    )}
                    {/* Progresiva */}
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {fila.progresivaFin != null
                        ? `${fmtProgresiva(fila.progresivaInicio)} → ${fmtProgresiva(fila.progresivaFin)}`
                        : fmtProgresiva(fila.progresivaInicio)}
                    </td>
                    {/* Valor */}
                    <td
                      className="px-3 py-2 text-right font-bold"
                      style={{ color: s.text }}
                    >
                      {fmtValor(fila.valor, unidad)}
                    </td>
                    {/* Extra */}
                    <td className="px-3 py-2 italic text-muted-foreground">
                      {fila.extra ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}