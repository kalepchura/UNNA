/**
 * Modal para visualizar una imagen en grande.
 *
 * Muestra la imagen al tamaño que tenga (hasta 80% de pantalla),
 * el nombre del archivo y un botón para descargar.
 *
 * Patrón controlado: el padre maneja el estado `open` y cuál
 * imagen está seleccionada (vía `url` y `nombre`).
 */

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ImagenModalProps {
  /** Estado abierto/cerrado del modal. */
  open: boolean;
  /** Handler para cerrar el modal. */
  onOpenChange: (open: boolean) => void;
  /** URL firmada de la imagen. Null/undefined si aún no se ha cargado. */
  url: string | null;
  /** Nombre original del archivo. */
  nombre: string | null;
}

export function ImagenModal({
  open,
  onOpenChange,
  url,
  nombre,
}: ImagenModalProps) {
  /**
   * Descarga la imagen creando un link temporal con atributo `download`.
   * Como la URL es firmada de Supabase, el navegador descarga el archivo
   * directamente con el nombre original.
   */
  const handleDescargar = () => {
    if (!url || !nombre) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogTitle>{nombre ?? 'Imagen'}</DialogTitle>
        <DialogDescription className="sr-only">
          Visualización ampliada de la imagen seleccionada
        </DialogDescription>

        {/* Imagen */}
        <div className="flex justify-center bg-muted/30 rounded-md p-2">
          {url ? (
            <img
              src={url}
              alt={nombre ?? 'Imagen de falla'}
              className="max-h-[70vh] max-w-full object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground py-12">
              Cargando imagen...
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handleDescargar} disabled={!url}>
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}