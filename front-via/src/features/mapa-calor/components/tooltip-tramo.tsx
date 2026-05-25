/**
 * Tooltip rico para tramos del Mapa de Calor.
 *
 * Se usa dentro de un <HoverCard> de shadcn.
 * Muestra: código, nombre, rango de progresivas, valor y semáforo.
 */

import { colorSemaforo } from '../utils/colores';
import { fmtProgresiva, fmtValor } from '../utils/formato';

interface TooltipTramoProps {
  codigo: string;
  nombre: string;
  progresivaInicio: number;
  progresivaFin: number;
  valor: number | null;
  color: string;
  unidad: string;
  /** Métrica extra opcional (ej: "441 mediciones") */
  extra?: string;
}

export function TooltipTramo({
  codigo,
  nombre,
  progresivaInicio,
  progresivaFin,
  valor,
  color,
  unidad,
  extra,
}: TooltipTramoProps) {
  const s = colorSemaforo(color);

  return (
    <div className="p-1 space-y-2 min-w-[220px]">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
          {codigo}
        </p>
        <p className="text-sm font-semibold leading-tight">{nombre}</p>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: s.bg, boxShadow: `0 0 6px ${s.glow}` }}
        />
        <span
          className="text-base font-bold"
          style={{ color: s.text }}
        >
          {fmtValor(valor, unidad)}
        </span>
        <span className="text-xs text-muted-foreground">{s.label}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        {fmtProgresiva(progresivaInicio)} → {fmtProgresiva(progresivaFin)}
      </p>

      {extra && (
        <p className="text-xs text-muted-foreground italic">{extra}</p>
      )}
    </div>
  );
}