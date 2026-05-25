import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

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

  const formatBytes = (b: number) =>
    b < 1024
      ? `${b} B`
      : b < 1024 * 1024
        ? `${(b / 1024).toFixed(1)} KB`
        : `${(b / 1024 / 1024).toFixed(1)} MB`;

  const formId = 'form-importar';

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" size="md">
        <SheetHeader>
          <SheetTitle>Nueva importación</SheetTitle>
          <SheetDescription>
            Suba un archivo CSV, Excel o XML con lecturas de temperatura.
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          <form id={formId} onSubmit={handleSubmit} className="space-y-5">
            {/* Dropzone-style file input */}
            <div className="space-y-1.5">
              <Label>Archivo</Label>
              <label
                htmlFor="imp-archivo"
                className="
                  relative flex cursor-pointer items-center gap-3 rounded-lg
                  border border-dashed border-border bg-muted/30 p-4
                  transition-colors hover:border-border-strong hover:bg-muted/50
                "
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-soft-foreground">
                  {archivo ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {archivo ? (
                    <>
                      <p className="truncate text-sm font-medium text-foreground">
                        {archivo.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(archivo.size)} · Click para cambiar
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">
                        Seleccionar archivo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        CSV, Excel (.xlsx, .xls) o XML
                      </p>
                    </>
                  )}
                </div>
                <Input
                  id="imp-archivo"
                  type="file"
                  accept=".csv,.xlsx,.xls,.xml"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imp-progresiva">Progresiva (m)</Label>
              <Input
                id="imp-progresiva"
                type="number"
                value={progresiva}
                onChange={(e) => setProgresiva(e.target.value)}
                placeholder="Ej: 2500"
                className="tabular-nums"
              />
              <p className="text-xs text-muted-foreground">
                Posición longitudinal en metros donde se tomaron las lecturas.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imp-comentario">Comentario (opcional)</Label>
              <Textarea
                id="imp-comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Observaciones del especialista…"
                rows={4}
              />
            </div>

            {importMut.error && (
              <div className="rounded-md border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm text-destructive-soft-foreground">
                <strong>Error:</strong> {importMut.error.message}
              </div>
            )}
          </form>
        </SheetBody>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={importMut.isPending || !archivo}
          >
            {importMut.isPending ? 'Subiendo…' : 'Importar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
