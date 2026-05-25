import { useState } from 'react';
import { Plus } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { temperaturaApi } from '@/lib/api/temperatura.api';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

import { FiltrosImportaciones } from './filtros-importaciones';
import { TablaImportaciones } from './tabla-importaciones';
import { FormImportar } from './form-importar';
import type { FiltrosImportaciones as FiltrosType } from '../types/importacion-types';

export function ImportacionesPage() {
  const [filtros, setFiltros] = useState<FiltrosType>({ page: 1, limit: 20 });
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosType>({
    page: 1,
    limit: 20,
  });
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Importaciones de Temperatura"
        subtitle="Suba archivos CSV, Excel o XML con lecturas de temperatura."
        breadcrumb={[
          { label: 'Temperatura' },
          { label: 'Importaciones' },
        ]}
        actions={
          <Button size="sm" onClick={() => setMostrarForm(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva importación
          </Button>
        }
      />

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
            handleBuscar();
          }}
        />
      )}
    </div>
  );
}
