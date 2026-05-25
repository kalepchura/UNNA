/**
 * Leyenda de colores para una capa del Mapa de Calor.
 *
 * Recibe una lista de items {color, texto} y los muestra como
 * círculos coloreados con texto al lado.
 */

import { colorSemaforo, type ColorSemaforo } from '../utils/colores';

export interface ItemLeyenda {
  color: ColorSemaforo;
  texto: string;
}

interface LeyendaProps {
  items: ItemLeyenda[];
  /** Título opcional a la izquierda (ej: "Temperatura promedio") */
  titulo?: string;
}

export function Leyenda({ items, titulo }: LeyendaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      {titulo && (
        <span className="font-semibold text-muted-foreground uppercase tracking-wide">
          {titulo}
        </span>
      )}
      {items.map((item) => {
        const s = colorSemaforo(item.color);
        return (
          <div key={item.texto} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: s.bg,
                boxShadow: `0 0 4px ${s.glow}`,
              }}
            />
            <span className="text-muted-foreground">{item.texto}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Leyendas predefinidas por capa
// ============================================================

export const LEYENDA_TEMPERATURA: ItemLeyenda[] = [
  { color: 'VERDE', texto: '≤ 44 °C' },
  { color: 'AMARILLO', texto: '45 - 49 °C' },
  { color: 'ROJO', texto: '> 49 °C' },
  { color: 'GRIS', texto: 'Sin datos' },
];

export const LEYENDA_DESGASTE_GENERAL: ItemLeyenda[] = [
  { color: 'VERDE', texto: '< 2 mm' },
  { color: 'AMARILLO', texto: '2 – 3.4 mm' },
  { color: 'ROJO', texto: '≥ 3.5 mm' },
  { color: 'GRIS', texto: 'Sin datos' },
];

export const LEYENDA_DESGASTE_INDICE: ItemLeyenda[] = [
  { color: 'VERDE', texto: '< 1.2' },
  { color: 'AMARILLO', texto: '1.2 – 1.5' },
  { color: 'ROJO', texto: '> 1.5' },
  { color: 'GRIS', texto: 'Sin datos' },
];

export const LEYENDA_FALLAS: ItemLeyenda[] = [
  { color: 'VERDE', texto: '0 – 2 fallas' },
  { color: 'AMARILLO', texto: '3 – 4 fallas' },
  { color: 'ROJO', texto: '≥ 5 fallas' },
  { color: 'GRIS', texto: 'Sin fallas' },
];