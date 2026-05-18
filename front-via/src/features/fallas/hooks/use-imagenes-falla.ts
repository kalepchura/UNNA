/**
 * Hooks para imágenes asociadas a FallaSoldaduraInox.
 * Una falla puede tener N imágenes (sin límite).
 */

import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '@/hooks/use-api-query';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { fallasApi } from '@/lib/api/fallas.api';
import { queryKeys } from '@/lib/query-keys';
import type {
  ImagenFalla,
  UrlImagenFalla,
} from '@/features/fallas/types/imagen-falla.types';

// ============================================================
// QUERIES
// ============================================================

/** Query key específico para imágenes de una falla. */
const imagenesKey = (fallaId: number) =>
  ['fallas', 'soldadura', 'imagenes', fallaId] as const;

/** Lista de imágenes de una falla soldadura. */
export function useImagenesFalla(fallaId: number, habilitado = true) {
  return useApiQuery<ImagenFalla[]>({
    queryKey: imagenesKey(fallaId),
    queryFn: () => fallasApi.soldadura.listarImagenes(fallaId),
    enabled: habilitado && fallaId > 0,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

interface SubirImagenParams {
  fallaId: number;
  archivo: File;
}

/** Subir una nueva imagen a una falla. */
export function useSubirImagen() {
  const queryClient = useQueryClient();

  return useApiMutation<ImagenFalla, SubirImagenParams>({
    mutationFn: ({ fallaId, archivo }) =>
      fallasApi.soldadura.subirImagen(fallaId, archivo),
    mensajeExito: 'Imagen subida correctamente',
    onSuccess: (_, { fallaId }) => {
      // Refrescar lista de imágenes y detalle de la falla
      queryClient.invalidateQueries({ queryKey: imagenesKey(fallaId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.fallas.soldaduraDetail(fallaId),
      });
    },
  });
}

interface EliminarImagenParams {
  imagenId: number;
  /** Se pasa para poder invalidar la lista correcta. */
  fallaId: number;
}

/** Eliminar una imagen específica. */
export function useEliminarImagen() {
  const queryClient = useQueryClient();

  return useApiMutation<void, EliminarImagenParams>({
    mutationFn: ({ imagenId }) => fallasApi.soldadura.eliminarImagen(imagenId),
    mensajeExito: 'Imagen eliminada',
    onSuccess: (_, { fallaId }) => {
      queryClient.invalidateQueries({ queryKey: imagenesKey(fallaId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.fallas.soldaduraDetail(fallaId),
      });
    },
  });
}

/**
 * Obtener URL firmada temporal para mostrar una imagen.
 * Se usa como mutation porque la URL caduca y no se cachea.
 */
export function useObtenerUrlImagen() {
  return useApiMutation<UrlImagenFalla, number>({
    mutationFn: (imagenId) => fallasApi.soldadura.obtenerUrlImagen(imagenId),
    mostrarToastError: true,
  });
}