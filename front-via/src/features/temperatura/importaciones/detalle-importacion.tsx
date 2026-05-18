import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';

import { useApiQuery } from '@/hooks/use-api-query';
import { temperaturaApi } from '@/lib/api/temperatura.api';

import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import type { TemperaturaRegistroResponse } from '../types/importacion-types';
import { formatearFecha } from '@/lib/format';

export function DetalleImportacionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const importacionId = Number(id);

  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 100,
    fechaDesde: undefined as string | undefined,
    fechaHasta: undefined as string | undefined,
  });

  const { data: importacion } = useApiQuery({
    queryKey: ['temperatura', 'importaciones', importacionId],
    queryFn: () => temperaturaApi.importaciones.obtener(importacionId),
  });

  const { data, isLoading } = useApiQuery({
    queryKey: ['temperatura', 'importaciones', importacionId, 'registros', filtros],
    queryFn: () =>
      temperaturaApi.importaciones.listarRegistros(importacionId, filtros),
  });

  const columns: ColumnDef<TemperaturaRegistroResponse>[] = [
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }) => formatearFecha(row.original.fecha),
    },
    {
      accessorKey: 'hora',
      header: 'Hora',
      cell: ({ row }) => row.original.hora,
    },
    {
      accessorKey: 'temperatura',
      header: 'Temperatura (°C)',
      cell: ({ row }) => row.original.temperatura.toFixed(2),
    },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/temperatura/importaciones')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <h1 className="text-2xl font-bold">
        Registros de: {importacion?.nombreArchivo ?? '...'}
      </h1>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        paginacion={{
          page: data?.page ?? 1,
          limit: data?.limit ?? 100,
          total: data?.total ?? 0,
          totalPages: data?.totalPages ?? 1,
          onPageChange: (page) => setFiltros((prev) => ({ ...prev, page })),
        }}
      />
    </div>
  );
}