import { useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { temperaturaApi } from '@/lib/api/temperatura.api';
import { FiltrosImportaciones } from './filtros-importaciones';
import { TablaImportaciones } from './tabla-importaciones';
import { FormImportar } from './form-importar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { FiltrosImportaciones as FiltrosType } from '../types/importacion-types';

export function ImportacionesPage() {
  const [filtros, setFiltros] = useState<FiltrosType>({ page: 1, limit: 20 });
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosType>({ page: 1, limit: 20 });
  const [mostrarForm, setMostrarForm] = useState(false);

  const { data, isLoading } = useApiQuery({
    queryKey: ['temperatura', 'importaciones', filtrosAplicados],
    queryFn: () => temperaturaApi.importaciones.buscar(filtrosAplicados),
  });

  const handleBuscar = () => {
    setFiltrosAplicados({ ...filtros, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFiltrosAplicados((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Importaciones de Temperatura</h1>
          <p className="text-sm text-muted-foreground">
            Suba archivos CSV, Excel o XML con lecturas de temperatura
          </p>
        </div>
        <Button onClick={() => setMostrarForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva importación
        </Button>
      </div>

      <FiltrosImportaciones
        filtros={filtros}
        onChange={setFiltros}
        onBuscar={handleBuscar}
        isLoading={isLoading}
      />

      <TablaImportaciones
        data={data}
        isLoading={isLoading}
        onPageChange={handlePageChange}
      />

      {mostrarForm && (
        <FormImportar
          onClose={() => setMostrarForm(false)}
          onSuccess={() => {
            setMostrarForm(false);
            handleBuscar(); // refresca la tabla
          }}
        />
      )}
    </div>
  );
}