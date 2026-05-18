// frontend/src/features/catalogos/tabs/velocidades-tab.tsx

import { useState, useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi, type Velocidad } from '@/lib/api/catalogos.api';
import { queryKeys } from '@/lib/query-keys';
import { DataTable } from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { formatearEntero } from '@/lib/format';
import type { ColumnDef } from '@tanstack/react-table';

const columnas: ColumnDef<Velocidad>[] = [
  {
    accessorKey: 'velocidadKmh',
    header: 'Velocidad',
    cell: ({ row }) => (
      <span className="font-medium">{formatearEntero(row.original.velocidadKmh)} km/h</span>
    ),
  },
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
    cell: ({ row }) => `${formatearEntero(row.original.progresivaFin - row.original.progresivaInicio)} m`,
  },
];

export function VelocidadesTab() {
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina = 20;

  // ✅ Una sola llamada
  const { data: todos, isLoading } = useApiQuery({
    queryKey: queryKeys.catalogos.velocidadesTabla,
    queryFn: () => catalogosApi.velocidades.listarParaTabla({ limit: 1000 }),
  });

  // ✅ Filtro en frontend
  const datosFiltrados = useMemo(() => {
    if (!todos) return [];
    if (!filtro) return todos;
    const busqueda = filtro.toLowerCase();
    return todos.filter(v => 
      String(v.velocidadKmh).includes(busqueda)
    );
  }, [todos, filtro]);

  // ✅ Paginación en frontend
  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const inicio = (pagina - 1) * itemsPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, inicio + itemsPorPagina);

  const handleFiltro = (valor: string) => {
    setFiltro(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por velocidad..."
          value={filtro}
          onChange={(e) => handleFiltro(e.target.value)}
          className="pl-8"
        />
      </div>

      <DataTable
        columns={columnas}
        data={datosPagina}
        loading={isLoading}
        mensajeVacio="No hay velocidades"
      />

      {totalPaginas > 1 && (
        <div className="flex justify-between items-center pt-4">
          <span className="text-sm text-muted-foreground">
            Mostrando {inicio + 1} - {Math.min(inicio + itemsPorPagina, datosFiltrados.length)} de {datosFiltrados.length} velocidades
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