/**
 * Galería de imágenes de una falla soldadura.
 *
 * Características UX:
 *  - Thumbnails reales (URLs firmadas, cargadas bajo demanda)
 *  - Hover muestra acciones: descargar y eliminar
 *  - Click en thumbnail abre modal con la imagen grande
 *  - Botón "Descargar todas" descarga una por una
 *
 * Cada thumbnail es un sub-componente que se encarga de obtener
 * su propia URL firmada cuando se monta (lazy loading).
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ImagenModal } from '@/features/fallas/components/imagen-modal';
import { Download, Trash2 } from 'lucide-react';
import {
  useImagenesFalla,
  useEliminarImagen,
  useObtenerUrlImagen,
} from '@/features/fallas/hooks/use-imagenes-falla';
import { fallasApi } from '@/lib/api/fallas.api';
import type { ImagenFalla } from '@/features/fallas/types/imagen-falla.types';

interface ImagenesGaleriaProps {
  fallaId: number;
}

export function ImagenesGaleria({ fallaId }: ImagenesGaleriaProps) {
  const { data: imagenes, isLoading } = useImagenesFalla(fallaId);
  const eliminarMut = useEliminarImagen();

  // Estado del modal de "ver imagen grande"
  const [imagenModal, setImagenModal] = useState<{
    url: string;
    nombre: string;
  } | null>(null);

  // Estado de confirmación de eliminar
  const [imagenAEliminar, setImagenAEliminar] = useState<number | null>(null);

  const handleConfirmarEliminar = async () => {
    if (imagenAEliminar == null) return;
    await eliminarMut.mutateAsync({ imagenId: imagenAEliminar, fallaId });
    setImagenAEliminar(null);
  };

  /**
   * Descarga todas las imágenes una por una.
   * Crea links temporales y los dispara secuencialmente.
   */
  const handleDescargarTodas = async () => {
    if (!imagenes || imagenes.length === 0) return;

    for (const img of imagenes) {
      try {
        const { url, nombre } = await fallasApi.soldadura.obtenerUrlImagen(img.id);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombre;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Pequeño delay entre descargas para que el navegador no las bloquee
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.error(`Error descargando imagen ${img.id}:`, err);
      }
    }
  };

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Cargando imágenes...</p>
    );
  }

  if (!imagenes || imagenes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay imágenes asociadas a esta falla.
      </p>
    );
  }

  return (
    <div className="imagenes-galeria space-y-3">
      {/* Encabezado con contador y acción global */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {imagenes.length} imagen{imagenes.length !== 1 ? 'es' : ''}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDescargarTodas}
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar todas
        </Button>
      </div>

      {/* Grilla de thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {imagenes.map((img) => (
          <ThumbnailImagen
            key={img.id}
            imagen={img}
            onAbrirModal={(url, nombre) => setImagenModal({ url, nombre })}
            onEliminar={() => setImagenAEliminar(img.id)}
          />
        ))}
      </div>

      {/* Modal: ver imagen grande */}
      <ImagenModal
        open={imagenModal !== null}
        onOpenChange={(open) => !open && setImagenModal(null)}
        url={imagenModal?.url ?? null}
        nombre={imagenModal?.nombre ?? null}
      />

      {/* Confirmar eliminar */}
      <ConfirmDialog
        open={imagenAEliminar != null}
        onOpenChange={(open) => !open && setImagenAEliminar(null)}
        titulo="Eliminar imagen"
        descripcion="¿Estás seguro? Esta acción NO se puede deshacer. La imagen se eliminará permanentemente."
        etiquetaConfirmar="Eliminar"
        variante="destructive"
        onConfirmar={handleConfirmarEliminar}
      />
    </div>
  );
}

// ============================================================
// SUB-COMPONENTE: Thumbnail individual con lazy load de URL
// ============================================================

interface ThumbnailImagenProps {
  imagen: ImagenFalla;
  onAbrirModal: (url: string, nombre: string) => void;
  onEliminar: () => void;
}

/**
 * Thumbnail individual.
 *
 * Pide su URL firmada al montarse. Mientras carga, muestra placeholder.
 * Al hover muestra botones de descargar y eliminar.
 * Click en la imagen abre el modal con la versión grande.
 */
function ThumbnailImagen({
  imagen,
  onAbrirModal,
  onEliminar,
}: ThumbnailImagenProps) {
  const obtenerUrlMut = useObtenerUrlImagen();
  const [url, setUrl] = useState<string | null>(null);

  // Cargar URL firmada al montar
  useEffect(() => {
    let activo = true;
    obtenerUrlMut
      .mutateAsync(imagen.id)
      .then((res) => {
        if (activo) setUrl(res.url);
      })
      .catch(() => {
        // Error ya manejado por el toast del hook
      });
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagen.id]);

  const handleClickImagen = () => {
    if (url) onAbrirModal(url, imagen.nombreArchivo);
  };

  const handleDescargar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = imagen.nombreArchivo;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEliminar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEliminar();
  };

  return (
    <div className="group relative border rounded overflow-hidden bg-muted/30">
      {/* Imagen (o placeholder mientras carga) */}
      <button
        type="button"
        onClick={handleClickImagen}
        disabled={!url}
        className="block w-full h-32 cursor-pointer disabled:cursor-wait"
      >
        {url ? (
          <img
            src={url}
            alt={imagen.nombreArchivo}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Cargando...</span>
          </div>
        )}
      </button>

      {/* Acciones al hover */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleDescargar}
          disabled={!url}
          className="bg-black/60 text-white rounded-full p-1 hover:bg-black/80 disabled:opacity-50"
          title="Descargar"
        >
          <Download className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={handleEliminar}
          className="bg-red-600/80 text-white rounded-full p-1 hover:bg-red-600"
          title="Eliminar"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Nombre del archivo */}
      <p
        className="text-xs px-1.5 py-1 truncate border-t bg-background"
        title={imagen.nombreArchivo}
      >
        {imagen.nombreArchivo}
      </p>
    </div>
  );
}