import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useInvalidate } from '@/hooks/use-invalidate';
import { fallasApi } from '@/lib/api/fallas.api';
import { temperaturaApi } from '@/lib/api/temperatura.api';
import { desgasteApi } from '@/lib/api/desgaste.api';
import type { ColumnDef } from '@tanstack/react-table';
import { RotateCcw, Eye, Search } from 'lucide-react';
import { formatearFecha, formatearFechaHora } from '@/lib/format';

// Configuración de cada entidad eliminable
const ENTIDADES_CONFIG: Record<string, {
  nombre: string;
  listar: (filtros: { page: number; limit: number }) => Promise<any>;
  restaurar: (id: number) => Promise<void>;
  rutaDetalle: (id: number) => string;
}> = {
  'fallas-riel': {
    nombre: 'Fallas en Riel',
    listar: (filtros) => fallasApi.riel.listarEliminados(filtros),
    restaurar: (id) => fallasApi.riel.restaurar(id),
    rutaDetalle: (id) => `/fallas/riel/${id}`,
  },
  'fallas-soldadura-inox': {
    nombre: 'Fallas Soldadura Inox',
    listar: (filtros) => fallasApi.soldadura.listarEliminados(filtros),
    restaurar: (id) => fallasApi.soldadura.restaurar(id),
    rutaDetalle: (id) => `/fallas/soldadura/${id}`,
  },
  'temperatura-importaciones': {
    nombre: 'Importaciones de Temperatura',
    listar: (filtros) => temperaturaApi.importaciones.listarEliminadas(filtros),
    restaurar: (id) => temperaturaApi.importaciones.restaurar(id),
    rutaDetalle: (id) => `/temperatura/importaciones/${id}`,
  },
  'desgaste-escenarios-mtb': {
    nombre: 'Escenarios MTB',
    listar: (filtros) => desgasteApi.escenarios.listarEliminados(filtros),
    restaurar: (id) => desgasteApi.escenarios.restaurar(id),
    rutaDetalle: (id) => `/desgaste/escenarios/${id}/valores`,
  },
};

interface FilaUnificada {
  id: number;
  entidadCodigo: string;
  entidadNombre: string;
  fecha: string;        // ISO
  usuario: string;      // nombre o UUID
  datosOriginales: any;
}

export function ListadoEliminados() {
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const [page, setPage] = useState(1);
  const [filtroEntidad, setFiltroEntidad] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');
  const LIMIT = 20;

  const fallasRiel = useApiQuery({
    queryKey: ['auditoria', 'eliminados', 'fallas-riel'],
    queryFn: () => ENTIDADES_CONFIG['fallas-riel'].listar({ page: 1, limit: 100 }),
  });
  const fallasSold = useApiQuery({
    queryKey: ['auditoria', 'eliminados', 'fallas-soldadura-inox'],
    queryFn: () => ENTIDADES_CONFIG['fallas-soldadura-inox'].listar({ page: 1, limit: 100 }),
  });
  const tempImp = useApiQuery({
    queryKey: ['auditoria', 'eliminados', 'temperatura-importaciones'],
    queryFn: () => ENTIDADES_CONFIG['temperatura-importaciones'].listar({ page: 1, limit: 100 }),
  });
  const desgasteEsc = useApiQuery({
    queryKey: ['auditoria', 'eliminados', 'desgaste-escenarios-mtb'],
    queryFn: () => ENTIDADES_CONFIG['desgaste-escenarios-mtb'].listar({ page: 1, limit: 100 }),
  });

  // Combinar filas y extraer fecha + usuario
  const todasLasFilas = useMemo<FilaUnificada[]>(() => {
    const combinar = (codigo: string, resultado: any) => {
      if (!resultado?.data) return [];
      return resultado.data.map((item: any) => {
        // Intentar obtener la fecha de última actualización (eliminación)
        const fecha = item.actualizadoEn ?? item.fecha ?? item.fechaSubida ?? '';
        // Intentar obtener el nombre del usuario que eliminó (si no, UUID o placeholder)
        const usuario =
          item.usuarioNombre ??           // si viene en el objeto
          item.creadoPor ??               // UUID del creador (fallback)
          '—';
        return {
          id: item.id,
          entidadCodigo: codigo,
          entidadNombre: ENTIDADES_CONFIG[codigo].nombre,
          fecha,
          usuario,
          datosOriginales: item,
        };
      });
    };
    return [
      ...combinar('fallas-riel', fallasRiel.data),
      ...combinar('fallas-soldadura-inox', fallasSold.data),
      ...combinar('temperatura-importaciones', tempImp.data),
      ...combinar('desgaste-escenarios-mtb', desgasteEsc.data),
    ];
  }, [fallasRiel.data, fallasSold.data, tempImp.data, desgasteEsc.data]);

  // Filtros locales
  const filasFiltradas = useMemo(() => {
    let result = todasLasFilas;
    if (filtroEntidad !== 'todas') {
      result = result.filter((f) => f.entidadCodigo === filtroEntidad);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      result = result.filter((f) => f.entidadNombre.toLowerCase().includes(q));
    }
    return result;
  }, [todasLasFilas, filtroEntidad, busqueda]);

  const totalFiltrado = filasFiltradas.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltrado / LIMIT));
  const paginated = filasFiltradas.slice((page - 1) * LIMIT, page * LIMIT);

  const restaurarMut = useApiMutation({
    mutationFn: async ({ entidadCodigo, id }: { entidadCodigo: string; id: number }) => {
      await ENTIDADES_CONFIG[entidadCodigo].restaurar(id);
    },
    onSuccess: () => {
      invalidate(['auditoria', 'eliminados', 'resumen']);
      invalidate(['auditoria', 'eliminados', 'fallas-riel']);
      invalidate(['auditoria', 'eliminados', 'fallas-soldadura-inox']);
      invalidate(['auditoria', 'eliminados', 'temperatura-importaciones']);
      invalidate(['auditoria', 'eliminados', 'desgaste-escenarios-mtb']);
    },
  });

  const columns: ColumnDef<FilaUnificada>[] = [
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }) => {
        const fecha = row.original.fecha;
        if (!fecha) return '—';
        return (
          <div>
            <div className="text-sm">{formatearFecha(fecha)}</div>
            <div className="text-xs text-muted-foreground">
              {formatearFechaHora(fecha).split(' ')[1] ?? ''}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'usuario',
      header: 'Usuario',
      cell: ({ row }) => <span className="text-sm">{row.original.usuario}</span>,
    },
    {
      accessorKey: 'entidadNombre',
      header: 'Entidad',
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.entidadNombre}</span>,
    },
    {
      header: 'Acciones',
      cell: ({ row }) => {
        const ruta = ENTIDADES_CONFIG[row.original.entidadCodigo]?.rutaDetalle(row.original.id);
        return (
          <div className="flex items-center gap-2">
            {ruta && (
              <Button variant="ghost" size="sm" onClick={() => navigate(ruta)}>
                <Eye className="mr-1 h-4 w-4" /> Ver detalle
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                restaurarMut.mutate({
                  entidadCodigo: row.original.entidadCodigo,
                  id: row.original.id,
                })
              }
              disabled={restaurarMut.isPending}
            >
              <RotateCcw className="mr-1 h-3 w-3" /> Restaurar
            </Button>
          </div>
        );
      },
    },
  ];

  const cargando = fallasRiel.isLoading || fallasSold.isLoading || tempImp.isLoading || desgasteEsc.isLoading;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-sm">Entidad</Label>
          <Select value={filtroEntidad} onValueChange={setFiltroEntidad}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {Object.entries(ENTIDADES_CONFIG).map(([codigo, cfg]) => (
                <SelectItem key={codigo} value={codigo}>{cfg.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label className="text-sm">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar entidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        loading={cargando}
        paginacion={{
          page,
          limit: LIMIT,
          total: totalFiltrado,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}