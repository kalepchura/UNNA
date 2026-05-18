import { useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { auditoriaApi } from '@/lib/api/auditoria.api';
import { FiltrosAuditoria } from './filtros-auditoria';
import { TablaAuditoria } from './tabla-auditoria';
import { ResumenEliminadosCards } from './resumen-eliminados-cards';
import { ListadoEliminados } from './listado-eliminados';
import type { FiltrarAuditoriaFiltros } from './types/auditoria.types';

export function AuditoriaPage() {
  const [filtros, setFiltros] = useState<FiltrarAuditoriaFiltros>({
    page: 1,
    limit: 50,
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrarAuditoriaFiltros>({
    page: 1,
    limit: 50,
  });

  const { data: logData, isLoading: logLoading } = useApiQuery({
    queryKey: ['auditoria', 'log', filtrosAplicados],
    queryFn: () => auditoriaApi.listar(filtrosAplicados),
  });

  const { data: resumenData, isLoading: resumenLoading } = useApiQuery({
    queryKey: ['auditoria', 'eliminados', 'resumen'],
    queryFn: () => auditoriaApi.obtenerResumenEliminados(),
    staleTime: 0,
  });

  const handleBuscar = () => {
    setFiltrosAplicados({ ...filtros, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFiltrosAplicados((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Auditoría</h1>
        <p className="text-sm text-muted-foreground">
          Historial de operaciones y registros eliminados
        </p>
      </div>

      {/* SECCIÓN 1: Registros eliminados */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Registros eliminados</h2>
        <ResumenEliminadosCards data={resumenData ?? null} isLoading={resumenLoading} />
        <ListadoEliminados />
      </section>

      {/* SECCIÓN 2: Historial de operaciones */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Historial de operaciones</h2>
        <FiltrosAuditoria
          filtros={filtros}
          onChange={setFiltros}
          onBuscar={handleBuscar}
          isLoading={logLoading}
        />
        <TablaAuditoria
          data={logData}
          loading={logLoading}
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
}