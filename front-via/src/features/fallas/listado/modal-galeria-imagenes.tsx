/**
 * Modal wrapper para la galería de imágenes de una falla soldadura.
 *
 * Reutiliza los componentes existentes:
 *  - ImagenesUploader (para agregar imágenes)
 *  - ImagenesGaleria (para ver/descargar/eliminar)
 *
 * Solo agrega: el Dialog que los envuelve.
 *
 * Se renderiza solo cuando el modal está abierto, por eso es
 * "lazy" — no hace fetch innecesario en el listado.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ImagenesUploader } from '@/features/fallas/components/imagenes-uploader';
import { ImagenesGaleria } from '@/features/fallas/detalle/imagenes-galeria';

interface ModalGaleriaImagenesProps {
  fallaId: number | null;
  abierto: boolean;
  onClose: () => void;
}

export function ModalGaleriaImagenes({
  fallaId,
  abierto,
  onClose,
}: ModalGaleriaImagenesProps) {
  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Imágenes de la falla {fallaId !== null ? `#${fallaId}` : ''}
          </DialogTitle>
          <DialogDescription>
            Agrega, descarga o elimina imágenes asociadas a esta falla.
          </DialogDescription>
        </DialogHeader>

        {/* Solo renderiza si hay fallaId. Como el componente se monta cada vez
            que se abre el modal con un id distinto, los queries se disparan
            con lazy load gracias a esa condición. */}
        {fallaId !== null && (
          <div className="space-y-4">
            {/* Uploader para agregar más imágenes */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium mb-2">Agregar imágenes</h3>
              <ImagenesUploader fallaId={fallaId} />
            </div>

            {/* Galería: ya tiene contador, descargar-todas, ver, eliminar */}
            <ImagenesGaleria fallaId={fallaId} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}