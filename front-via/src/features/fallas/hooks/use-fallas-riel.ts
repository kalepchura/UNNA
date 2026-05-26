/**
 * Hooks de React Query para FallaRiel.
 *
 * Optimización:
 *  - useFallaRiel (detalle): staleTime 30s para evitar refetch
 *    excesivo cuando se edita o se navega entre páginas.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { fallasApi } from '@/lib/api/fallas.api';
import { queryKeys } from '@/lib/query-keys';

import type {
  CrearFallaRielDto,
  ActualizarFallaRielDto,
  FiltrosFallaRiel,
  FallaRiel,
} from '@/features/fallas/types/falla-riel.types';

import type { PaginatedResponse } from '@/lib/types/common';

// ============================================================
// QUERIES
// ============================================================

export function useFallasRiel(filtros: FiltrosFallaRiel) {
  return useApiQuery<PaginatedResponse<FallaRiel>>({
    queryKey: queryKeys.fallas.rielList(filtros),
    queryFn: () => fallasApi.riel.buscar(filtros),
  });
}

/**
 * Detalle de una falla riel por id.
 * staleTime alto: el detalle no cambia constantemente, evitamos
 * refetches innecesarios al cambiar de pestaña o re-renderizar.
 */
export function useFallaRiel(id: number, habilitado = true) {
  return useApiQuery<FallaRiel>({
    queryKey: queryKeys.fallas.rielDetail(id),
    queryFn: () => fallasApi.riel.obtener(id),
    enabled: habilitado && id > 0,
    staleTime: 0, // 🔑 30s: evita refetches al ganar foco
  });
}

// ============================================================
// MUTATIONS
// ============================================================

function useInvalidarFallas() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.fallas.all });
  };
}

export function useCrearFallaRiel() {
  const invalidar = useInvalidarFallas();
  return useApiMutation<FallaRiel, CrearFallaRielDto>({
    mutationFn: (dto) => fallasApi.riel.crear(dto),
    mensajeExito: 'Falla de riel creada correctamente',
    onSuccess: () => invalidar(),
  });
}

export function useActualizarFallaRiel() {
  const invalidar = useInvalidarFallas();

  return useApiMutation<
    FallaRiel,
    { id: number; dto: ActualizarFallaRielDto }
  >({
    mutationFn: ({ id, dto }) =>
      fallasApi.riel.actualizar(id, dto),

    mensajeExito: 'Falla de riel actualizada',

    onSuccess: () => invalidar(),
  });
}

export function useEliminarFallaRiel() {
  const invalidar = useInvalidarFallas();
  return useApiMutation<void, number>({
    mutationFn: (id) => fallasApi.riel.eliminar(id),
    mensajeExito: 'Falla de riel eliminada',
    onSuccess: () => invalidar(),
  });
}

export function useRestaurarFallaRiel() {
  const invalidar = useInvalidarFallas();
  return useApiMutation<void, number>({
    mutationFn: (id) => fallasApi.riel.restaurar(id),
    mensajeExito: 'Falla restaurada',
    onSuccess: () => invalidar(),
  });
}