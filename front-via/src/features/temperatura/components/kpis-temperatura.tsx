import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpisTemperaturaResponse } from '../types/kpis-temperatura.types';

interface Props {
  data: KpisTemperaturaResponse | null;
  isLoading: boolean;
}

export function KpisTemperatura({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const getColorClass = (color: string) => {
    switch (color) {
      case 'VERDE': return 'text-green-600';
      case 'AMARILLO': return 'text-yellow-600';
      case 'ROJO': return 'text-red-600';
      case 'GRIS': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* KPI 1 - Temperatura máxima del último mes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Máxima en {data.maximaUltimoMes.rango}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.maximaUltimoMes.valorCelsius !== null ? (
            <>
              <div className={`text-3xl font-bold ${getColorClass(data.maximaUltimoMes.color)}`}>
                {data.maximaUltimoMes.valorCelsius} °C
              </div>
              {data.maximaUltimoMes.tramoCodigo && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tramo {data.maximaUltimoMes.tramoCodigo} – Prog. {data.maximaUltimoMes.progresiva}
                </p>
              )}
            </>
          ) : (
            <div className="text-3xl font-bold text-gray-400">--</div>
          )}
        </CardContent>
      </Card>

      {/* KPI 2 - Tramos en alerta en el año */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Zonas en alerta ({data.zonasAlertaAnio.anio})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getColorClass(data.zonasAlertaAnio.color)}`}>
            {data.zonasAlertaAnio.cantidad}
          </div>
          {data.zonasAlertaAnio.tramos.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {data.zonasAlertaAnio.tramos.map(t => t.codigo).join(', ')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* KPI 3 - Días consecutivos críticos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Días consecutivos críticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getColorClass(data.diasConsecutivos.color)}`}>
            {data.diasConsecutivos.dias}
          </div>
          {data.diasConsecutivos.tramoCodigo && (
            <p className="text-xs text-muted-foreground mt-1">
              Tramo {data.diasConsecutivos.tramoCodigo} – Prom. {data.diasConsecutivos.promedioCelsius} °C
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}