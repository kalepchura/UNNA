import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpisDesgasteResponse } from '../types/kpis-desgaste.types';

interface Props {
  data: KpisDesgasteResponse | null;
  isLoading: boolean;
}

export function KpisDesgaste({ data, isLoading }: Props) {
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
      {/* KPI 1 - Elementos en zona roja */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Elementos en zona roja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getColorClass(data.zonaRoja.color)}`}>
            {data.zonaRoja.cantidad}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Último trimestre
          </p>
        </CardContent>
      </Card>

      {/* KPI 2 - Mayor desgaste actual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Mayor desgaste
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.mayorDesgaste.codigoElemento !== null ? (
            <>
              <div className={`text-3xl font-bold ${getColorClass(data.mayorDesgaste.color)}`}>
                {data.mayorDesgaste.valorMm} mm
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Elemento {data.mayorDesgaste.codigoElemento} – {data.mayorDesgaste.punto}
              </p>
              <p className="text-xs text-muted-foreground">
                Tramo {data.mayorDesgaste.tramoCodigo}, {data.mayorDesgaste.trimestre}T{data.mayorDesgaste.anio}
              </p>
            </>
          ) : (
            <div className="text-3xl font-bold text-gray-400">--</div>
          )}
        </CardContent>
      </Card>

      {/* KPI 3 - Elementos sin medición */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sin medición en {data.sinMedicionUltimoAnio.anioReferencia || '...'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getColorClass(data.sinMedicionUltimoAnio.color)}`}>
            {data.sinMedicionUltimoAnio.cantidad}
          </div>
          {data.sinMedicionUltimoAnio.primerosElementos.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {data.sinMedicionUltimoAnio.primerosElementos.map(e => `E${e.codigoElemento}`).join(', ')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}