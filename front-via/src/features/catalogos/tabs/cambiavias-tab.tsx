// frontend/src/features/catalogos/tabs/cambiavias-tab.tsx

import { useState, useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type Cambiavia } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import { DataTable } from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatearEntero } from '@/lib/format';
import type { ColumnDef } from '@tanstack/react-table';

// Tipo extendido que incluye el campo extra tramoCodigo
type CambiaviaConTramo = Cambiavia & {
  tramoCodigo: string;
};

export function CambiaviasTab() {
  // Estados
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina = 20;

  // ✅ Una sola llamada al backend para CAMBIAVÍAS
  const { data: cambiavias, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.cambiaviasTabla,
    queryFn: () => catalogosApi.cambiavias.listarParaTabla({ limit: 1000 }),
  });

  // ✅ Una sola llamada al backend para TRAMOS (necesario para decodificar tramoId → codigo)
  const { data: tramos } = useApiQuery({
    queryKey: queryKeys.catalogos.tramosSelector,
    queryFn: () => catalogosApi.tramos.listarParaSelector(),
  });

  // ✅ Mapa: tramoId → codigo (ej: 1 → "VES-PIN")
  const tramosPorId = useMemo(() => {
    const map = new Map<number, string>();
    tramos?.forEach((tramo) => map.set(tramo.id, tramo.codigo));
    return map;
  }, [tramos]);

  // ✅ Filtro en frontend (NO va al backend)
  const datosFiltrados = useMemo(() => {
    if (!cambiavias) return [];
    if (!filtro) return cambiavias;
    const busqueda = filtro.toLowerCase();
    return cambiavias.filter((c: Cambiavia) => {
      return (
        c.codigoBd.toLowerCase().includes(busqueda) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(busqueda))
      );
    });
  }, [cambiavias, filtro]);

  // ✅ Paginación en frontend (NO va al backend)
  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const inicio = (pagina - 1) * itemsPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, inicio + itemsPorPagina);

  // ✅ Agregar tramoCodigo a cada cambiavía (convierte tramoId → codigo string)
  const datosConTramo: CambiaviaConTramo[] = useMemo(() => {
    return datosPagina.map((c: Cambiavia) => ({
      ...c,
      tramoCodigo: tramosPorId.get(c.tramoId) || '—',
    }));
  }, [datosPagina, tramosPorId]);

  // ✅ Columnas de la tabla usando el tipo CambiaviaConTramo
  const columnas: ColumnDef<CambiaviaConTramo>[] = [
    { accessorKey: 'codigoBd', header: 'Código BD' },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => row.original.descripcion || '—',
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => <Badge variant="outline">{row.original.tipo}</Badge>,
    },
    {
      accessorKey: 'norma',
      header: 'Norma',
      cell: ({ row }) => <Badge variant="secondary">{row.original.norma}</Badge>,
    },
    {
      accessorKey: 'via',
      header: 'Vía',
      cell: ({ row }) => (
        <Badge variant={row.original.via === 'PAR' ? 'default' : 'destructive'}>
          {row.original.via}
        </Badge>
      ),
    },
    {
      accessorKey: 'derivacion',
      header: 'Derivación',
      cell: ({ row }) => row.original.derivacion || '—',
    },
    {
      accessorKey: 'agujaTipo',
      header: 'Tipo Aguja',
      cell: ({ row }) => row.original.agujaTipo || '—',
    },
    {
      accessorKey: 'progresiva',
      header: 'Progresiva',
      cell: ({ row }) => `${formatearEntero(row.original.progresiva)} m`,
    },
    {
      id: 'tramo',
      header: 'Tramo',
      cell: ({ row }) => row.original.tramoCodigo, // ← Muestra "VES-PIN", no el ID
    },
    {
      accessorKey: 'velocidadKmh',
      header: 'Velocidad',
      cell: ({ row }) =>
        row.original.velocidadKmh ? `${row.original.velocidadKmh} km/h` : '—',
    },
  ];

  // Resetear página al filtrar
  const handleFiltroChange = (valor: string) => {
    setFiltro(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-4">
      {/* Filtro de búsqueda */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código BD o descripción..."
          value={filtro}
          onChange={(e) => handleFiltroChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Tabla */}
      <DataTable
        columns={columnas}
        data={datosConTramo}
        loading={isLoading}
        mensajeVacio="No hay cambiavías"
      />

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-between items-center pt-4">
          <span className="text-sm text-muted-foreground">
            Mostrando {inicio + 1} - {Math.min(inicio + itemsPorPagina, datosFiltrados.length)} de{' '}
            {datosFiltrados.length} cambiavías
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => p - 1)}
              disabled={pagina === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="px-2 py-1 text-sm">
              Página {pagina} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => p + 1)}
              disabled={pagina === totalPaginas}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}