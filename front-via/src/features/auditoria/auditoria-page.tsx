import { useState } from 'react';
import { History, Trash2 } from 'lucide-react';

import { useApiQuery } from '@/hooks/use-api-query';
import { auditoriaApi } from '@/lib/api/auditoria.api';

import { PageHeader } from '@/components/layout/page-header';

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
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<FiltrarAuditoriaFiltros>({
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
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Auditoría"
        subtitle="Historial de operaciones y registros eliminados"
        breadcrumb={[{ label: 'Administración' }, { label: 'Auditoría' }]}
      />

      {/* SECCIÓN 1: Registros eliminados */}
      <section className="flex flex-col gap-4">
        <SectionLabel icon={Trash2}>Registros eliminados</SectionLabel>
        <ResumenEliminadosCards
          data={resumenData ?? null}
          isLoading={resumenLoading}
        />
        <ListadoEliminados />
      </section>

      {/* SECCIÓN 2: Historial de operaciones */}
      <section className="flex flex-col gap-4">
        <SectionLabel icon={History}>Historial de operaciones</SectionLabel>
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

// ── Section label (encabezado de sub-sección dentro de una página) ────────────

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
        {children}
      </h2>
    </div>
  );
}
