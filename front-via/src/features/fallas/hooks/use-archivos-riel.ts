/**
 * Hooks para los archivos adjuntos (interno/externo) de FallaRiel.
 * Cada falla tiene máximo 1 archivo interno y 1 externo.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { fallasApi } from '@/lib/api/fallas.api';
import { queryKeys } from '@/lib/query-keys';
import type { TipoArchivoFalla } from '@/lib/types/common';

// ============================================================
// MUTATIONS
// ============================================================

interface SubirArchivoParams {
  fallaId: number;
  tipo: TipoArchivoFalla;
  archivo: File;
}

/** Subir archivo (interno o externo) a una falla riel. */
export function useSubirArchivoRiel() {
  const queryClient = useQueryClient();

  return useApiMutation<unknown, SubirArchivoParams>({
    mutationFn: ({ fallaId, tipo, archivo }) =>
      fallasApi.riel.subirArchivo(fallaId, tipo, archivo),

    mensajeExito: 'Archivo subido correctamente',

    onSuccess: (_, { fallaId }) => {
      // Refrescar detalle para mostrar el nuevo archivo
      queryClient.invalidateQueries({
        queryKey: queryKeys.fallas.rielDetail(fallaId),
      });
    },
  });
}

interface EliminarArchivoParams {
  fallaId: number;
  tipo: TipoArchivoFalla;
}

/** Eliminar archivo de una falla riel. */
export function useEliminarArchivoRiel() {
  const queryClient = useQueryClient();

  return useApiMutation<void, EliminarArchivoParams>({
    mutationFn: ({ fallaId, tipo }) =>
      fallasApi.riel.eliminarArchivo(fallaId, tipo),

    mensajeExito: 'Archivo eliminado',

    onSuccess: (_, { fallaId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fallas.rielDetail(fallaId),
      });
    },
  });
}

/**
 * Obtener URL firmada temporal para descargar un archivo.
 * NO usa caché (la URL caduca en 1 hora).
 *
 * Uso:
 * const { mutateAsync } = useObtenerUrlArchivoRiel();
 * const data = await mutateAsync({ fallaId, tipo });
 */
export function useObtenerUrlArchivoRiel() {
  return useApiMutation<
    { url: string; nombre: string },
    { fallaId: number; tipo: TipoArchivoFalla }
  >({
    mutationFn: ({ fallaId, tipo }) =>
      fallasApi.riel.obtenerUrlArchivo(fallaId, tipo),

    // Sin mensaje porque solo obtiene URL
    mostrarToastError: true,
  });
}