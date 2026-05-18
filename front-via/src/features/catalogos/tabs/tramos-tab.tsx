// frontend/src/components/catalogos/tabs/tramos-tab.tsx

import { useState, useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type Tramo } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import { DataTable } from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { formatearEntero } from '@/lib/format';

const columnas: ColumnDef<Tramo>[] = [
  { accessorKey: 'codigo', header: 'Código' },
  { accessorKey: 'nombre', header: 'Nombre' },
  {
    accessorKey: 'progresivaInicio',
    header: 'Progresiva Inicio',
    cell: ({ row }) => `${formatearEntero(row.original.progresivaInicio)} m`,
  },
  {
    accessorKey: 'progresivaFin',
    header: 'Progresiva Fin',
    cell: ({ row }) => `${formatearEntero(row.original.progresivaFin)} m`,
  },
  {
    id: 'longitud',
    header: 'Longitud',
    cell: ({ row }) =>
      `${formatearEntero(row.original.progresivaFin - row.original.progresivaInicio)} m`,
  },
  { accessorKey: 'orden', header: 'Orden' },
];

export function TramosTab() {
  // Estados
  const [pagina, setPagina] = useState(1);
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const itemsPorPagina = 20;

  // ✅ UNA SOLA LLAMADA AL BACKEND
  const { data: todosLosTramos, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.tramosTabla,
    queryFn: () => catalogosApi.tramos.listarParaTabla({ limit: 1000 }),
  });

  // ✅ Filtros en FRONTEND (instantáneo, no va al backend)
  const tramosFiltrados = useMemo(() => {
    if (!todosLosTramos) return [];
    
    return todosLosTramos.filter((tramo) => {
      const matchCodigo = !filtroCodigo || 
        tramo.codigo.toLowerCase().includes(filtroCodigo.toLowerCase());
      const matchNombre = !filtroNombre || 
        tramo.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
      return matchCodigo && matchNombre;
    });
  }, [todosLosTramos, filtroCodigo, filtroNombre]);

  // ✅ Paginación en FRONTEND (instantáneo, no va al backend)
  const totalPaginas = Math.ceil(tramosFiltrados.length / itemsPorPagina);
  const inicio = (pagina - 1) * itemsPorPagina;
  const tramosPagina = tramosFiltrados.slice(inicio, inicio + itemsPorPagina);

  // Resetear página al cambiar filtros
  const handleFiltroCodigo = (valor: string) => {
    setFiltroCodigo(valor);
    setPagina(1);
  };

  const handleFiltroNombre = (valor: string) => {
    setFiltroNombre(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por código..."
            value={filtroCodigo}
            onChange={(e) => handleFiltroCodigo(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por nombre..."
            value={filtroNombre}
            onChange={(e) => handleFiltroNombre(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabla */}
      <DataTable
        columns={columnas}
        data={tramosPagina}
        loading={isLoading}
        mensajeVacio="No hay tramos"
      />

      {/* Información y paginación */}
      {!isLoading && tramosFiltrados.length > 0 && (
        <div className="flex justify-between items-center pt-4">
          <span className="text-sm text-muted-foreground">
            Mostrando {inicio + 1} - {Math.min(inicio + itemsPorPagina, tramosFiltrados.length)} de {tramosFiltrados.length} tramos
            {(filtroCodigo || filtroNombre) && " (filtrados)"}
          </span>
          
          {totalPaginas > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagina(pagina - 1)}
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
                onClick={() => setPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}