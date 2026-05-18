// frontend/src/features/catalogos/tabs/estaciones-tab.tsx

import { useState, useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type Estacion } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import { DataTable } from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { formatearEntero } from '@/lib/format';
import type { ColumnDef } from '@tanstack/react-table';

// ✅ Tipo extendido con tramoCodigo
type EstacionConTramo = Estacion & {
  tramoCodigo: string;
};

const columnas: ColumnDef<EstacionConTramo>[] = [
  { accessorKey: 'codigo', header: 'Código' },
  { accessorKey: 'nombre', header: 'Nombre' },
  {
    accessorKey: 'progresiva',
    header: 'Progresiva',
    cell: ({ row }) => `${formatearEntero(row.original.progresiva)} m`,
  },
  {
    id: 'tramo',
    header: 'Tramo',
    cell: ({ row }) => row.original.tramoCodigo,
  },
];

export function EstacionesTab() {
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina = 20;

  // ✅ Una sola llamada para estaciones
  const { data: estaciones, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.estacionesTabla,
    queryFn: () => catalogosApi.estaciones.listarParaTabla({ limit: 1000 }),
  });

  // ✅ Llamada a tramos para decodificar tramoId → codigo
  const { data: tramos } = useApiQuery({
    queryKey: queryKeys.catalogos.tramosSelector,
    queryFn: () => catalogosApi.tramos.listarParaSelector(),
  });

  // ✅ Mapa: tramoId → codigo
  const tramosPorId = useMemo(() => {
    const map = new Map<number, string>();
    tramos?.forEach(t => map.set(t.id, t.codigo));
    return map;
  }, [tramos]);

  // ✅ Filtro en frontend
  const datosFiltrados = useMemo(() => {
    if (!estaciones) return [];
    if (!filtro) return estaciones;
    const busqueda = filtro.toLowerCase();
    return estaciones.filter(e => 
      e.codigo.toLowerCase().includes(busqueda) ||
      e.nombre.toLowerCase().includes(busqueda) ||
      tramosPorId.get(e.tramoId)?.toLowerCase().includes(busqueda)
    );
  }, [estaciones, filtro, tramosPorId]);

  // ✅ Paginación en frontend
  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const inicio = (pagina - 1) * itemsPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, inicio + itemsPorPagina);

  // ✅ Agregar tramoCodigo
  const datosConTramo: EstacionConTramo[] = useMemo(() => {
    return datosPagina.map(e => ({
      ...e,
      tramoCodigo: tramosPorId.get(e.tramoId) || '—'
    }));
  }, [datosPagina, tramosPorId]);

  const handleFiltro = (valor: string) => {
    setFiltro(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, nombre o tramo..."
          value={filtro}
          onChange={(e) => handleFiltro(e.target.value)}
          className="pl-8"
        />
      </div>

      <DataTable
        columns={columnas}
        data={datosConTramo}
        loading={isLoading}
        mensajeVacio="No hay estaciones"
      />

      {totalPaginas > 1 && (
        <div className="flex justify-between items-center pt-4">
          <span className="text-sm text-muted-foreground">
            Mostrando {inicio + 1} - {Math.min(inicio + itemsPorPagina, datosFiltrados.length)} de {datosFiltrados.length} estaciones
          </span>
          <div className="flex gap-2">
            <Button onClick={() => setPagina(p => p-1)} disabled={pagina === 1}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="px-2 py-1 text-sm">Página {pagina} de {totalPaginas}</span>
            <Button onClick={() => setPagina(p => p+1)} disabled={pagina === totalPaginas}>
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}