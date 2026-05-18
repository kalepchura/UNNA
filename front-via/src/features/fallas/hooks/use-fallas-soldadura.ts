/**
 * Hooks de React Query para FallaSoldaduraInox.
 * Mismo patrón que use-fallas-riel.ts.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { fallasApi } from '@/lib/api/fallas.api';
import { queryKeys } from '@/lib/query-keys';

import type {
  CrearFallaSoldaduraDto,
  ActualizarFallaSoldaduraDto,
  FiltrosFallaSoldadura,
  FallaSoldaduraInox,
} from '@/features/fallas/types/falla-soldadura.types';

import type { PaginatedResponse } from '@/lib/types/common';

// ============================================================
// QUERIES
// ============================================================

export function useFallasSoldadura(filtros: FiltrosFallaSoldadura) {
  return useApiQuery<PaginatedResponse<FallaSoldaduraInox>>({
    queryKey: queryKeys.fallas.soldaduraList(filtros),
    queryFn: () => fallasApi.soldadura.buscar(filtros),
  });
}

/**
 * Detalle de una falla soldadura.
 * staleTime 30s para evitar refetches innecesarios.
 */
export function useFallaSoldadura(id: number, habilitado = true) {
  return useApiQuery<FallaSoldaduraInox>({
    queryKey: queryKeys.fallas.soldaduraDetail(id),
    queryFn: () => fallasApi.soldadura.obtener(id),
    enabled: habilitado && id > 0,
    staleTime: 30_000, // 🔑 30s
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

export function useCrearFallaSoldadura() {
  const invalidar = useInvalidarFallas();
  return useApiMutation<FallaSoldaduraInox, CrearFallaSoldaduraDto>({
    mutationFn: (dto) => fallasApi.soldadura.crear(dto),
    mensajeExito: 'Falla de soldadura creada correctamente',
    onSuccess: () => invalidar(),
  });
}

export function useActualizarFallaSoldadura() {
  const invalidar = useInvalidarFallas();

  return useApiMutation<
    FallaSoldaduraInox,
    { id: number; dto: ActualizarFallaSoldaduraDto }
  >({
    mutationFn: ({ id, dto }) =>
      fallasApi.soldadura.actualizar(id, dto),

    mensajeExito: 'Falla de soldadura actualizada',

    onSuccess: () => invalidar(),
  });
}

export function useEliminarFallaSoldadura() {
  const invalidar = useInvalidarFallas();
  return useApiMutation<void, number>({
    mutationFn: (id) => fallasApi.soldadura.eliminar(id),
    mensajeExito: 'Falla de soldadura eliminada',
    onSuccess: () => invalidar(),
  });
}

export function useRestaurarFallaSoldadura() {
  const invalidar = useInvalidarFallas();
  return useApiMutation<void, number>({
    mutationFn: (id) => fallasApi.soldadura.restaurar(id),
    mensajeExito: 'Falla restaurada',
    onSuccess: () => invalidar(),
  });
}