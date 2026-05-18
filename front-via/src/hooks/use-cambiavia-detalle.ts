/**
 * Hook para obtener el detalle completo de un cambiavía por su id.
 * Útil en formularios donde el usuario selecciona un cambiavía y
 * queremos mostrar sus datos (tramo, vía, velocidad, etc.).
 */

import { useApiQuery } from '@/hooks/use-api-query';
import { catalogosApi } from '@/lib/api/catalogos.api';

export function useCambiaviaDetalle(id: number | null) {
  return useApiQuery({
    queryKey: ['catalogos', 'cambiavias', 'detalle', id],
    queryFn: () => catalogosApi.cambiavias.obtenerPorId(id!),
    enabled: id != null && id > 0,
  });
}