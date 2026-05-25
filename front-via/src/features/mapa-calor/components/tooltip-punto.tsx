/**
 * Tooltip rico para puntos/elementos individuales.
 * Soporta cambiavías, elementos de desgaste, curvas.
 */

import { colorSemaforo, colorVia } from '../utils/colores';
import { fmtProgresiva, fmtValor } from '../utils/formato';

interface TooltipPuntoProps {
  /** Código mostrado en monospace */
  codigo: string;
  /** Nombre o etiqueta principal */
  nombre?: string;
  progresiva: number;
  /** Para elementos con extensión (curvas, tramos lineales) */
  progresivaFin?: number | null;
  valor: number | null;
  color: string;
  unidad: string;
  via?: string | null;
  riel?: string | null;
  /** Texto adicional (ej: "Q2 2025") */
  extra?: string;
}

export function TooltipPunto({
  codigo,
  nombre,
  progresiva,
  progresivaFin,
  valor,
  color,
  unidad,
  via,
  riel,
  extra,
}: TooltipPuntoProps) {
  const s = colorSemaforo(color);
  const cVia = colorVia(via);

  return (
    <div className="p-1 space-y-2 min-w-[220px]">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
          {codigo}
        </p>
        {nombre && (
          <p className="text-sm font-semibold leading-tight">{nombre}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: s.bg, boxShadow: `0 0 6px ${s.glow}` }}
        />
        <span className="text-base font-bold" style={{ color: s.text }}>
          {fmtValor(valor, unidad)}
        </span>
        <span className="text-xs text-muted-foreground">{s.label}</span>
      </div>

      {(via || riel) && (
        <div className="flex items-center gap-2 text-xs">
          {via && (
            <span
              className="px-1.5 py-0.5 rounded font-mono font-bold"
              style={{
                color: cVia,
                backgroundColor: `${cVia}1a`,
                border: `1px solid ${cVia}40`,
              }}
            >
              Vía {via}
            </span>
          )}
          {riel && (
            <span className="text-muted-foreground">Riel {riel}</span>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {progresivaFin != null
          ? `${fmtProgresiva(progresiva)} → ${fmtProgresiva(progresivaFin)}`
          : fmtProgresiva(progresiva)}
      </p>

      {extra && (
        <p className="text-xs text-muted-foreground italic">{extra}</p>
      )}
    </div>
  );
}