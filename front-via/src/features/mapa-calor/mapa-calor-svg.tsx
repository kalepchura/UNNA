import { Skeleton } from '@/components/ui/skeleton';
import type { EsquemaBaseResponse } from './types/mapa-calor.types';

interface Props {
  esquema?: EsquemaBaseResponse;
  capa: 'temperatura' | 'desgaste-general' | 'desgaste-indice' | 'fallas';
  datos: any;
  isLoading: boolean;
}

const COLOR_MAP: Record<string, string> = {
  VERDE: '#16a34a',
  AMARILLO: '#eab308',
  ROJO: '#e11d48',
  GRIS: '#9ca3af',
};

const LEYENDA_TEMPERATURA = [
  { color: COLOR_MAP.VERDE, texto: '≤ 35 °C' },
  { color: COLOR_MAP.AMARILLO, texto: '36 - 45 °C' },
  { color: COLOR_MAP.ROJO, texto: '> 45 °C' },
  { color: COLOR_MAP.GRIS, texto: 'Sin datos' },
];

const LEYENDA_DESGASTE = [
  { color: COLOR_MAP.VERDE, texto: '< 2 mm' },
  { color: COLOR_MAP.AMARILLO, texto: '2 - 3.4 mm' },
  { color: COLOR_MAP.ROJO, texto: '≥ 3.5 mm' },
  { color: COLOR_MAP.GRIS, texto: 'Sin datos' },
];

const LEYENDA_DESGASTE_INDICE = [
  { color: COLOR_MAP.VERDE, texto: '< 1.2' },
  { color: COLOR_MAP.AMARILLO, texto: '1.2 - 1.5' },
  { color: COLOR_MAP.ROJO, texto: '> 1.5' },
  { color: COLOR_MAP.GRIS, texto: 'Sin datos' },
];

const LEYENDA_FALLAS = [
  { color: COLOR_MAP.VERDE, texto: '0 - 2 fallas' },
  { color: COLOR_MAP.AMARILLO, texto: '3 - 4 fallas' },
  { color: COLOR_MAP.ROJO, texto: '≥ 5 fallas' },
];

export function MapaCalorSVG({ esquema, capa, datos, isLoading }: Props) {
  if (isLoading || !esquema) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  const anchoSVG = 1200;
  const altoSVG = 350;
  const margenX = 60;
  const margenY = 40;
  const anchoUtil = anchoSVG - margenX * 2;
  const progresivaMin = esquema.progresivaMinima;
  const progresivaMax = esquema.progresivaMaxima;
  const rango = progresivaMax - progresivaMin || 1;

  const escalaX = (progresiva: number) =>
    margenX + ((progresiva - progresivaMin) / rango) * anchoUtil;

  let leyenda: { color: string; texto: string }[] = LEYENDA_TEMPERATURA;
  if (capa === 'desgaste-general') leyenda = LEYENDA_DESGASTE;
  if (capa === 'desgaste-indice') leyenda = LEYENDA_DESGASTE_INDICE;
  if (capa === 'fallas') leyenda = LEYENDA_FALLAS;

  return (
    <div className="border rounded-lg p-4 bg-white overflow-x-auto space-y-3">
      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 text-xs">
        {leyenda.map((item) => (
          <div key={item.texto} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.texto}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${anchoSVG} ${altoSVG}`} className="w-full h-auto">
        {/* Eje de la vía */}
        <line
          x1={margenX}
          y1={altoSVG - margenY}
          x2={margenX + anchoUtil}
          y2={altoSVG - margenY}
          stroke="#333"
          strokeWidth={2}
        />

        {/* Tramos base */}
        {esquema.tramos.map((tramo) => {
          const x1 = escalaX(tramo.progresivaInicio);
          const x2 = escalaX(tramo.progresivaFin);
          return (
            <g key={tramo.codigo}>
              <rect
                x={x1}
                y={altoSVG - margenY - 10}
                width={x2 - x1}
                height={20}
                fill="#e5e7eb"
                stroke="#9ca3af"
              />
              <text
                x={(x1 + x2) / 2}
                y={altoSVG - margenY + 4}
                textAnchor="middle"
                fontSize="9"
              >
                {tramo.codigo}
              </text>
            </g>
          );
        })}

        {/* Capa Temperatura */}
        {capa === 'temperatura' &&
          datos?.tramos?.map((t: any) => {
            const x1 = escalaX(t.progresivaInicio);
            const x2 = escalaX(t.progresivaFin);
            const color = COLOR_MAP[t.color] ?? COLOR_MAP.GRIS;
            return (
              <rect
                key={t.codigo}
                x={x1}
                y={altoSVG - margenY - 30}
                width={x2 - x1}
                height={15}
                fill={color}
                opacity={0.8}
              />
            );
          })}

        {/* Capas Desgaste (General e Índice) */}
        {(capa === 'desgaste-general' || capa === 'desgaste-indice') &&
          datos?.lineas?.map((linea: any) =>
            linea.puntos?.map((punto: any, idx: number) => {
              const cx = escalaX(punto.progresiva);
              const valor =
                capa === 'desgaste-general' ? punto.valorMm : punto.indice;
              const color = COLOR_MAP[punto.color] ?? COLOR_MAP.GRIS;
              return (
                <g key={`${linea.via}-${idx}`}>
                  <circle
                    cx={cx}
                    cy={altoSVG - margenY - 25 - (idx % 3) * 10}
                    r={4}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                  {valor !== null && (
                    <text
                      x={cx}
                      y={altoSVG - margenY - 30 - (idx % 3) * 10}
                      textAnchor="middle"
                      fontSize="8"
                      fill={color}
                    >
                      {typeof valor === 'number' ? valor.toFixed(1) : ''}
                    </text>
                  )}
                </g>
              );
            }),
          )}

        {/* Capa Fallas */}
        {capa === 'fallas' &&
          datos?.lineas?.map((linea: any) =>
            linea.elementos?.map((elem: any) => {
              const x1 = escalaX(elem.progresivaInicio);
              const x2 = escalaX(elem.progresivaFin);
              const color = COLOR_MAP[elem.color] ?? COLOR_MAP.GRIS;
              if (x1 === x2) {
                return (
                  <g key={elem.codigo}>
                    <circle
                      cx={x1}
                      cy={altoSVG - margenY - 25}
                      r={5}
                      fill={color}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                    <text
                      x={x1}
                      y={altoSVG - margenY - 32}
                      textAnchor="middle"
                      fontSize="7"
                      fill={color}
                    >
                      {elem.cantidadFallas}
                    </text>
                  </g>
                );
              }
              return (
                <g key={elem.codigo}>
                  <rect
                    x={x1}
                    y={altoSVG - margenY - 30}
                    width={x2 - x1}
                    height={15}
                    fill={color}
                    opacity={0.8}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={altoSVG - margenY - 18}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#fff"
                  >
                    {elem.cantidadFallas}
                  </text>
                </g>
              );
            }),
          )}

        {/* Estaciones */}
        {esquema.estaciones.map((est) => {
          const cx = escalaX(est.progresiva);
          return (
            <g key={est.codigo}>
              <circle cx={cx} cy={altoSVG - margenY} r={3} fill="#1e3a8a" />
              <text
                x={cx}
                y={altoSVG - margenY - 12}
                textAnchor="middle"
                fontSize="8"
                fill="#1e3a8a"
              >
                {est.codigo}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}