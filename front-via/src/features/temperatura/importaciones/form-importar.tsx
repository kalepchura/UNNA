import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { useInvalidate } from '@/hooks/use-invalidate';
import { temperaturaApi } from '@/lib/api/temperatura.api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function FormImportar({ onClose, onSuccess }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [progresiva, setProgresiva] = useState('');
  const [comentario, setComentario] = useState('');

  const invalidate = useInvalidate();

  const importMut = useApiMutation({
    mutationFn: async () => {
      if (!archivo) throw new Error('Seleccione un archivo');
      return temperaturaApi.importaciones.importar(archivo, {
        progresiva: Number(progresiva),
        comentarioEspecialista: comentario || undefined,
      });
    },
    onSuccess: () => {
      invalidate(['temperatura', 'importaciones']);
      onSuccess();
    },
    mensajeExito: 'Archivo importado correctamente',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    importMut.mutate(undefined);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva importación</DialogTitle>
          {/* ✅ Requerido por Radix para accesibilidad */}
          <DialogDescription>
            Suba un archivo CSV, Excel o XML con lecturas de temperatura.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Archivo (CSV, Excel, XML)</Label>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls,.xml"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <Label>Progresiva (m)</Label>
            <Input
              type="number"
              value={progresiva}
              onChange={(e) => setProgresiva(e.target.value)}
              placeholder="Ej: 2500"
            />
          </div>

          <div>
            <Label>Comentario (opcional)</Label>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Observaciones del especialista"
            />
          </div>

          {importMut.error && (
            <p className="text-sm text-red-600">
              Error: {importMut.error.message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={importMut.isPending}>
              {importMut.isPending ? 'Subiendo...' : 'Importar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}