/**
 * Uploader de imágenes múltiples para FallaSoldaduraInox.
 *
 * Flujo:
 *  1. Usuario selecciona 1 o más archivos (drag o click).
 *  2. Aparecen previews pequeños de lo seleccionado.
 *  3. Usuario puede quitar previews antes de subir.
 *  4. Click en "Subir" → sube secuencialmente.
 *  5. Al terminar, la galería se refresca automáticamente
 *     gracias a la invalidación de caché.
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useSubirImagen } from '@/features/fallas/hooks/use-imagenes-falla';

interface ImagenesUploaderProps {
  fallaId: number;
}

export function ImagenesUploader({ fallaId }: ImagenesUploaderProps) {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const subirMut = useSubirImagen();

  /**
   * Genera URLs locales (blob) para mostrar previews de los archivos
   * antes de subirlos. Importante: revocar al limpiar para no
   * filtrar memoria.
   */
  useEffect(() => {
    const urls = archivos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);

    // Cleanup: cuando cambia `archivos` o se desmonta el componente
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [archivos]);

  const handleSeleccionar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setArchivos((prev) => [...prev, ...Array.from(files)]);
    // Limpiar el input para permitir seleccionar el mismo archivo otra vez
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleQuitar = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubir = async () => {
    if (archivos.length === 0) return;

    // Subir uno por uno (secuencial)
    for (const archivo of archivos) {
      await subirMut.mutateAsync({ fallaId, archivo });
    }

    // Limpiar selección al terminar
    setArchivos([]);
  };

  const handleLimpiarTodo = () => {
    setArchivos([]);
  };

  return (
    <div className="imagenes-uploader space-y-3">
      <Label>Subir imágenes</Label>

      {/* Zona de selección estilo "drag to upload" */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed p-4 text-center transition-colors hover:bg-muted/20">
        <span className="text-sm font-medium text-muted-foreground">
          Haz clic para seleccionar imágenes
        </span>
        <span className="text-xs text-muted-foreground">
          JPG, PNG o WebP · máx. 10 MB cada una · puedes seleccionar varias
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleSeleccionar}
          disabled={subirMut.isPending}
        />
      </label>

      {/* Previews de archivos seleccionados (antes de subir) */}
      {archivos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {archivos.length} imagen{archivos.length !== 1 ? 'es' : ''} seleccionada{archivos.length !== 1 ? 's' : ''}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLimpiarTodo}
              disabled={subirMut.isPending}
            >
              Quitar todas
            </Button>
          </div>

          {/* Grilla de previews */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {archivos.map((archivo, idx) => (
              <div
                key={`${archivo.name}-${idx}`}
                className="relative border rounded overflow-hidden bg-muted/30"
              >
                <img
                  src={previews[idx]}
                  alt={archivo.name}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleQuitar(idx)}
                  disabled={subirMut.isPending}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 disabled:opacity-50"
                  title="Quitar de la selección"
                >
                  <X className="h-3 w-3" />
                </button>
                <p
                  className="text-xs px-1 py-0.5 truncate"
                  title={archivo.name}
                >
                  {archivo.name}
                </p>
              </div>
            ))}
          </div>

          {/* Botón subir */}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSubir}
              disabled={subirMut.isPending}
            >
              {subirMut.isPending
                ? 'Subiendo...'
                : `Subir ${archivos.length} imagen${archivos.length !== 1 ? 'es' : ''}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}