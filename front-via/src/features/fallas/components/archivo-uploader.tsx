/**
 * Uploader genérico para 1 archivo (interno o externo) de FallaRiel.
 *
 * Muestra:
 *  - Si NO hay archivo: input file + botón "Subir"
 *  - Si HAY archivo: nombre + botón "Descargar" + botón "Eliminar"
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TipoArchivoFalla } from '@/lib/types/common';
import {
  useSubirArchivoRiel,
  useEliminarArchivoRiel,
  useObtenerUrlArchivoRiel,
} from '@/features/fallas/hooks/use-archivos-riel';

interface ArchivoUploaderProps {
  fallaId: number;
  tipo: TipoArchivoFalla;
  /** Nombre del archivo actual (si existe). */
  nombreActual: string | null;
  /** Etiqueta visible: "Informe interno" o "Informe externo". */
  label: string;
}

export function ArchivoUploader({
  fallaId,
  tipo,
  nombreActual,
  label,
}: ArchivoUploaderProps) {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);

  const subirMut = useSubirArchivoRiel();
  const eliminarMut = useEliminarArchivoRiel();
  const obtenerUrlMut = useObtenerUrlArchivoRiel();

  const tieneArchivo = nombreActual != null;

  const handleSubir = () => {
    if (!archivoSeleccionado) return;
    subirMut.mutate(
      { fallaId, tipo, archivo: archivoSeleccionado },
      { onSuccess: () => setArchivoSeleccionado(null) },
    );
  };

  const handleEliminar = () => {
    if (!confirm(`¿Eliminar el ${label.toLowerCase()}?`)) return;
    eliminarMut.mutate({ fallaId, tipo });
  };

  const handleDescargar = () => {
    obtenerUrlMut.mutate(
      { fallaId, tipo },
      {
        onSuccess: ({ url }) => {
          // Abrir en nueva pestaña
          window.open(url, '_blank');
        },
      },
    );
  };

  return (
    <div className="archivo-uploader border rounded p-4 space-y-2">
      <Label className="font-semibold">{label}</Label>

      {tieneArchivo ? (
        // ----- Estado: hay archivo -----
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm flex-1 truncate" title={nombreActual ?? ''}>
            📎 {nombreActual}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDescargar}
            disabled={obtenerUrlMut.isPending}
          >
            {obtenerUrlMut.isPending ? 'Generando...' : 'Descargar'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEliminar}
            disabled={eliminarMut.isPending}
          >
            Eliminar
          </Button>
        </div>
      ) : (
        // ----- Estado: sin archivo -----
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setArchivoSeleccionado(e.target.files?.[0] ?? null)}
            className="flex-1"
          />
          <Button
            onClick={handleSubir}
            disabled={!archivoSeleccionado || subirMut.isPending}
          >
            {subirMut.isPending ? 'Subiendo...' : 'Subir'}
          </Button>
        </div>
      )}

      {/* Texto de ayuda */}
      <p className="text-xs text-muted-foreground">
        Formatos: PDF, Word, Excel, imágenes. Máx 10 MB.
      </p>
    </div>
  );
}