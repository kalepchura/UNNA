import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpisFallasResponse } from '../types/kpis-fallas.types';

interface Props {
  data: KpisFallasResponse | null;
  isLoading: boolean;
}

export function KpisFallas({ data, isLoading }: Props) {
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
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* KPI 1 - Total mes actual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Fallas en {data.totalMesActual.periodo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getColorClass(data.totalMesActual.color)}`}>
            {data.totalMesActual.total}
          </div>
        </CardContent>
      </Card>

      {/* KPI 2 - Tramo con más fallas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tramo con más fallas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold truncate">
            {data.tramoTop.tramoCodigo || 'Sin datos'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.tramoTop.cantidadFallas} fallas
          </p>
          <p className="text-xs text-muted-foreground">
            {data.tramoTop.rango}
          </p>
        </CardContent>
      </Card>

      {/* KPI 3 - Soldaduras sin acción */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Soldaduras sin acción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${data.soldadurasSinAccion.critico ? 'text-red-600' : ''}`}>
            {data.soldadurasSinAccion.cantidad}
          </div>
          {data.soldadurasSinAccion.critico && (
            <p className="text-xs text-red-500 mt-1">Requiere atención</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}