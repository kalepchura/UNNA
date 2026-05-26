/**
 * ============================================================
 * Hooks de React Query para FallaRielAccion
 * ============================================================
 * Gestiona el historial de intervenciones (acciones) sobre fallas
 * de riel.
 *
 * INVALIDACIÓN INTELIGENTE — punto clave del diseño:
 *
 * Cada vez que se crea/actualiza/elimina/restaura una acción, el
 * backend sincroniza automáticamente los 4 campos desnormalizados
 * en la falla padre (estadoActual, accionActual, ptActual,
 * fechaEjecucionActual). Por eso, en el frontend invalidamos:
 *
 *   1. queryKeys.fallas.rielDetail(fallaId)
 *      → para refrescar el timeline + el bloque "Estado actual"
 *   2. queryKeys.fallas.all
 *      → porque listado y KPIs muestran el estado de cada falla,
 *        que pudo cambiar
 *
 * staleTime alto en el timeline porque las acciones cambian solo
 * cuando el usuario las edita explícitamente, no por refetches.
 * ============================================================
 */

import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { fallasApi } from '@/lib/api/fallas.api';
import { queryKeys } from '@/lib/query-keys';

import type {
  AccionRielResponse,
  CrearAccionRielDto,
  ActualizarAccionRielDto,
} from '@/features/fallas/types/accion-riel.types';

// ============================================================
// QUERIES
// ============================================================

/**
 * Timeline de acciones de una falla.
 *
 * NOTA: en el detalle de falla, las acciones VIENEN incluidas
 * en el response (campo `falla.acciones`). Este hook se ofrece
 * para casos donde se necesite refrescar solo el timeline sin
 * recargar toda la falla — pero el uso por defecto es leer
 * `falla.acciones` del detalle.
 */
export function useAccionesRiel(fallaId: number, habilitado = true) {
  return useApiQuery<AccionRielResponse[]>({
    queryKey: queryKeys.fallas.accionesPorFalla(fallaId),
    queryFn: () => fallasApi.acciones.listarPorFalla(fallaId),
    enabled: habilitado && fallaId > 0,
    staleTime: 30_000,
  });
}

/**
 * Timeline incluyendo acciones eliminadas (página de auditoría/admin).
 */
export function useAccionesRielConEliminadas(
  fallaId: number,
  habilitado = true,
) {
  return useApiQuery<AccionRielResponse[]>({
    queryKey: queryKeys.fallas.accionesEliminadasPorFalla(fallaId),
    queryFn: () => fallasApi.acciones.listarConEliminadas(fallaId),
    enabled: habilitado && fallaId > 0,
    staleTime: 30_000,
  });
}

// ============================================================
// MUTATIONS — Hook helper de invalidación
// ============================================================

/**
 * Invalida todas las queries afectadas por un cambio en acciones.
 *
 * Por qué invalidar `fallas.all`:
 *  - El estadoActual desnormalizado cambia en la falla padre
 *  - El listado de fallas muestra estado actual → debe refrescarse
 *  - Los KPIs cuentan fallas por estado → cambian
 *  - Los gráficos también filtran por estado → cambian
 */
function useInvalidarAcciones() {
  const queryClient = useQueryClient();

  return (fallaId: number) => {
    // 1. Refrescar el detalle de la falla (timeline + estado actual)
    queryClient.invalidateQueries({
      queryKey: queryKeys.fallas.rielDetail(fallaId),
    });
    // 2. Refrescar timeline standalone (por si el hook se usa solo)
    queryClient.invalidateQueries({
      queryKey: queryKeys.fallas.accionesPorFalla(fallaId),
    });
    // 3. Invalidar TODO el módulo fallas (listado, KPIs, gráficos)
    queryClient.invalidateQueries({
      queryKey: queryKeys.fallas.all,
    });
  };
}

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Crear una acción sobre una falla.
 *
 * Variables: { fallaId, dto }
 * El fallaId va en la URL, el dto en el body.
 */
export function useCrearAccionRiel() {
  const invalidar = useInvalidarAcciones();

  return useApiMutation<
    AccionRielResponse,
    { fallaId: number; dto: CrearAccionRielDto }
  >({
    mutationFn: ({ fallaId, dto }) =>
      fallasApi.acciones.crear(fallaId, dto),
    mensajeExito: 'Acción registrada correctamente',
    onSuccess: (_data, { fallaId }) => invalidar(fallaId),
  });
}

/**
 * Actualizar una acción existente.
 *
 * Variables: { id, fallaId, dto }
 * - id: id de la acción (va en URL)
 * - fallaId: id de la falla padre (NO va en API, solo para invalidar)
 * - dto: campos a actualizar
 */
export function useActualizarAccionRiel() {
  const invalidar = useInvalidarAcciones();

  return useApiMutation<
    AccionRielResponse,
    { id: number; fallaId: number; dto: ActualizarAccionRielDto }
  >({
    mutationFn: ({ id, dto }) => fallasApi.acciones.actualizar(id, dto),
    mensajeExito: 'Acción actualizada',
    onSuccess: (_data, { fallaId }) => invalidar(fallaId),
  });
}

/**
 * Eliminar (soft delete) una acción.
 *
 * Variables: { id, fallaId }
 */
export function useEliminarAccionRiel() {
  const invalidar = useInvalidarAcciones();

  return useApiMutation<void, { id: number; fallaId: number }>({
    mutationFn: ({ id }) => fallasApi.acciones.eliminar(id),
    mensajeExito: 'Acción eliminada',
    onSuccess: (_data, { fallaId }) => invalidar(fallaId),
  });
}

/**
 * Restaurar una acción eliminada (solo ADMIN).
 *
 * Variables: { id, fallaId }
 */
export function useRestaurarAccionRiel() {
  const invalidar = useInvalidarAcciones();

  return useApiMutation<void, { id: number; fallaId: number }>({
    mutationFn: ({ id }) => fallasApi.acciones.restaurar(id),
    mensajeExito: 'Acción restaurada',
    onSuccess: (_data, { fallaId }) => invalidar(fallaId),
  });
}