/**
 * Capa Temperatura del Mapa de Calor — sobre el esqueleto SVG.
 *
 * Para cada tramo entre dos estaciones, pinta una línea gruesa
 * coloreada por el semáforo del backend. Usa HoverCard con
 * TooltipTramo al pasar el cursor.
 *
 * CORRECCIÓN:
 * - tramoDeProgresiva recibe solo progresivaInicio (sin progresivaFin).
 *   Los tramos de temperatura tienen inicio exacto en la progresiva de
 *   la estación, así que la búsqueda por rango con progresivaInicio
 *   resuelve correctamente sin necesidad de punto medio.
 */

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

import { colorSemaforo } from '../utils/colores';
import { TooltipTramo } from './tooltip-tramo';
import type { TramoColoreadoTemperatura } from '../types/mapa-calor.types';
import type { UtilsEsquema } from './esquema-base';

interface CapaTemperaturaProps {
  tramos: TramoColoreadoTemperatura[];
  unidad: string;
  utils: UtilsEsquema;
}

export function CapaTemperatura({
  tramos,
  unidad,
  utils,
}: CapaTemperaturaProps) {
  if (!tramos.length) {
    return (
      <text
        x={utils.ancho / 2}
        y={utils.alto / 2}
        textAnchor="middle"
        fontSize="14"
        className="fill-muted-foreground"
      >
        Sin tramos para mostrar
      </text>
    );
  }

  return (
    <g>
      {tramos.map((t) => {
        // Usar solo progresivaInicio — el tramo del backend empieza en la
        // progresiva de la estación inicial, que cae dentro del rango [pA, pB).
        const i = utils.tramoDeProgresiva(t.progresivaInicio);
        const d = utils.getPathTramo(i, 0);
        if (!d) return null;

        const s = colorSemaforo(t.color);
        const tieneDatos = t.valor != null;

        return (
          <HoverCard key={t.codigo} openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
              <g style={{ cursor: 'pointer' }}>
                <path
                  d={d}
                  stroke={s.bg}
                  strokeWidth="11"
                  strokeLinecap="butt"
                  fill="none"
                  opacity={tieneDatos ? 0.9 : 0.45}
                  style={{
                    filter: tieneDatos
                      ? `drop-shadow(0 0 4px ${s.glow})`
                      : 'none',
                    transition: 'stroke-width 0.15s ease',
                  }}
                />
                {/* Path transparente más grueso para facilitar el hover */}
                <path
                  d={d}
                  stroke="transparent"
                  strokeWidth="20"
                  fill="none"
                />
              </g>
            </HoverCardTrigger>

            <HoverCardContent side="right" className="w-auto p-2">
              <TooltipTramo
                codigo={t.codigo}
                nombre={t.nombre}
                progresivaInicio={t.progresivaInicio}
                progresivaFin={t.progresivaFin}
                valor={t.valor}
                color={t.color}
                unidad={unidad}
                extra={
                  t.cantidadMediciones > 0
                    ? `${t.cantidadMediciones} mediciones`
                    : 'Sin mediciones en el período'
                }
              />
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </g>
  );
}