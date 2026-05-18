import { useState, useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useInvalidate } from '@/hooks/use-invalidate';
import { desgasteApi } from '@/lib/api/desgaste.api';
import { FiltrosMediciones } from './filtros-mediciones';
import { GrillaDesgaste } from './grilla-desgaste';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { CargarGrillaFiltros, CeldaModificadaDto, GrillaResponse } from '../types/mediciones.types';

const LIMIT = 10; // filas por página

export function MedicionesPage() {
  const [filtros, setFiltros] = useState<CargarGrillaFiltros>({});
  const [filtrosAplicados, setFiltrosAplicados] = useState<CargarGrillaFiltros>({});
  const [celdasModificadas, setCeldasModificadas] = useState<CeldaModificadaDto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const invalidate = useInvalidate();

  const { data, isLoading } = useApiQuery({
    queryKey: ['desgaste', 'mediciones', 'grilla', filtrosAplicados],
    queryFn: () => desgasteApi.mediciones.cargarGrilla(filtrosAplicados),
  });

  // ✅ Filtrado local por búsqueda (elemento, progresiva, vía)
  const filasFiltradas = useMemo(() => {
    if (!data?.filas) return [];
    if (!busqueda.trim()) return data.filas;
    const q = busqueda.toLowerCase();
    return data.filas.filter(
      (f) =>
        String(f.codigoElemento).toLowerCase().includes(q) ||
        String(f.progresiva).includes(q) ||
        f.via.toLowerCase().includes(q),
    );
  }, [data?.filas, busqueda]);

  // ✅ Paginación local
  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / LIMIT));
  const filasPagina = filasFiltradas.slice((pagina - 1) * LIMIT, pagina * LIMIT);

  const grillaPaginada: GrillaResponse | undefined = data
    ? { ...data, filas: filasPagina }
    : undefined;

  const guardarMut = useApiMutation({
    mutationFn: () =>
      desgasteApi.mediciones.guardarCambios({ cambios: celdasModificadas }),
    onSuccess: () => {
      invalidate(['desgaste', 'mediciones', 'grilla']);
      setCeldasModificadas([]);
    },
    mensajeExito: 'Cambios guardados correctamente',
  });

  const handleAplicar = () => {
    setFiltrosAplicados(filtros);
    setPagina(1);
    setBusqueda('');
  };

  const handleBusqueda = (v: string) => {
    setBusqueda(v);
    setPagina(1);
  };

  const handleCeldaChange = (celda: CeldaModificadaDto) => {
    setCeldasModificadas((prev) => {
      const idx = prev.findIndex(
        (c) =>
          c.elementoId === celda.elementoId &&
          c.anio === celda.anio &&
          c.trimestre === celda.trimestre &&
          c.punto === celda.punto,
      );
      if (idx >= 0) {
        const nueva = [...prev];
        if (celda.valor === null) nueva.splice(idx, 1);
        else nueva[idx] = celda;
        return nueva;
      }
      return celda.valor === null ? prev : [...prev, celda];
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Carga de Mediciones</h1>
        <p className="text-sm text-muted-foreground">
          Filtre por tramo y año, busque un elemento y edite las celdas.
        </p>
      </div>

      <FiltrosMediciones
        filtros={filtros}
        onChange={setFiltros}
        onAplicar={handleAplicar}
        busqueda={busqueda}
        onBusquedaChange={handleBusqueda}
        isLoading={isLoading}
      />

      {grillaPaginada && (
        <>
          <GrillaDesgaste
            grilla={grillaPaginada}
            celdasModificadas={celdasModificadas}
            onCeldaChange={handleCeldaChange}
          />

          {/* ✅ Paginación simple */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filasFiltradas.length} elementos
                {busqueda ? ` — filtrando por "${busqueda}"` : ''}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina <= 1}
                >
                  Anterior
                </Button>
                <span>Página {pagina} de {totalPaginas}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina >= totalPaginas}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {celdasModificadas.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={() => guardarMut.mutate(undefined)}
            disabled={guardarMut.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {guardarMut.isPending
              ? 'Guardando...'
              : `Guardar ${celdasModificadas.length} cambios`}
          </Button>
        </div>
      )}
    </div>
  );
}