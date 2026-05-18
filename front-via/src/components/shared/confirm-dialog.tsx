import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descripcion: string;
  /** Etiqueta del botón de confirmación. Por defecto: "Confirmar". */
  etiquetaConfirmar?: string;
  /** Variante del botón. Para destructive (eliminar) usá "destructive". */
  variante?: 'default' | 'destructive';
  /** Función a ejecutar al confirmar. Puede ser async. */
  onConfirmar: () => Promise<void> | void;
}

/**
 * Diálogo "¿Estás seguro?" reutilizable.
 *
 * Uso:
 *   const [open, setOpen] = useState(false);
 *
 *   <Button onClick={() => setOpen(true)}>Eliminar</Button>
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     titulo="¿Eliminar falla?"
 *     descripcion="Esta acción puede revertirse desde Auditoría."
 *     variante="destructive"
 *     onConfirmar={async () => {
 *       await fallasApi.eliminar(id);
 *       refetch();
 *     }}
 *   />
 *
 * Maneja loading internamente y cierra el diálogo al terminar.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  titulo,
  descripcion,
  etiquetaConfirmar = 'Confirmar',
  variante = 'default',
  onConfirmar,
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirmar() {
    setSubmitting(true);
    try {
      await onConfirmar();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variante === 'destructive' && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            {titulo}
          </DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant={variante}
            onClick={handleConfirmar}
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {etiquetaConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}