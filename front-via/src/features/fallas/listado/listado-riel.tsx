/**
 * Tabla de fallas riel.
 *
 * Características:
 *  - Curva H/V null → "Tangente" cursiva.
 *  - Causa null → "Sin causa" cursiva.
 *  - Archivos: columnas separadas (Interno/Externo)
 *  - Manejo de errores con toast
 *  - Skeleton loading
 *  - Accesibilidad ARIA
 */

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, Trash2, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SkeletonFallasRiel } from '@/components/shared/skeleton-table';
import {
  useObtenerUrlArchivoRiel,
  useEliminarArchivoRiel,
  useSubirArchivoRiel,
} from '@/features/fallas/hooks/use-archivos-riel';
import { TipoArchivoFalla } from '@/lib/types/common';
import { formatearFechaTabla, formatearVelocidad } from '@/lib/format';
import type { FallaRiel } from '@/features/fallas/types/falla-riel.types';

interface ListadoRielProps {
  fallas: FallaRiel[];
  isLoading: boolean;
  onEliminar: (id: number) => void;
  eliminandoId?: number | null;
  /** Si se provee, "Ver" abre via callback en vez de navegar. */
  onVer?: (id: number) => void;
  /** Si se provee, "Editar" abre via callback en vez de navegar. */
  onEditar?: (id: number) => void;
}

export function ListadoRiel({
  fallas,
  isLoading,
  onEliminar,
  eliminandoId,
  onVer,
  onEditar,
}: ListadoRielProps) {
  const [archivoAEliminar, setArchivoAEliminar] = useState<{
    fallaId: number;
    tipo: TipoArchivoFalla;
  } | null>(null);

  const urlMut = useObtenerUrlArchivoRiel();
  const eliminarArchivoMut = useEliminarArchivoRiel();

  const handleVer = async (fallaId: number, tipo: TipoArchivoFalla) => {
    try {
      const res = await urlMut.mutateAsync({ fallaId, tipo });
      if (res?.url) {
        window.open(res.url, '_blank');
      } else {
        toast.error('No se pudo abrir el archivo');
      }
    } catch (error) {
      toast.error('Error al abrir el archivo');
      console.error(error);
    }
  };

  const handleDescargar = async (
    fallaId: number,
    tipo: TipoArchivoFalla,
    nombre: string,
  ) => {
    try {
      const res = await urlMut.mutateAsync({ fallaId, tipo });
      if (!res?.url) {
        toast.error('No se pudo descargar el archivo');
        return;
      }
      const link = document.createElement('a');
      link.href = res.url;
      link.download = nombre;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Descargando archivo...');
    } catch (error) {
      toast.error('Error al descargar el archivo');
      console.error(error);
    }
  };

  const handleConfirmarEliminarArchivo = async () => {
    if (!archivoAEliminar) return;
    try {
      await eliminarArchivoMut.mutateAsync(archivoAEliminar);
      toast.success('Archivo eliminado correctamente');
      setArchivoAEliminar(null);
    } catch (error) {
      toast.error('Error al eliminar el archivo');
      console.error(error);
    }
  };

  if (isLoading) {
    return <SkeletonFallasRiel />;
  }

  if (fallas.length === 0) {
    return (
      <p className="text-center p-4 text-muted-foreground" role="status">
        No se encontraron fallas con los filtros aplicados.
      </p>
    );
  }

  return (
    <>
      <div 
        className="tabla-wrapper overflow-x-auto"
        role="region"
        aria-label="Listado de fallas de riel"
      >
        <table 
          className="tabla-fallas w-full border-collapse"
          aria-label="Tabla de fallas de riel"
          role="table"
        >
          <thead role="rowgroup">
            <tr role="row" className="border-b">
              <th role="columnheader" scope="col" className="text-left p-2">Fecha</th>
              <th role="columnheader" scope="col" className="text-left p-2">Progresiva</th>
              <th role="columnheader" scope="col" className="text-left p-2">Vía</th>
              <th role="columnheader" scope="col" className="text-left p-2">Carril</th>
              <th role="columnheader" scope="col" className="text-left p-2">Tramo</th>
              <th role="columnheader" scope="col" className="text-left p-2">Curva H</th>
              <th role="columnheader" scope="col" className="text-left p-2">Curva V</th>
              <th role="columnheader" scope="col" className="text-left p-2">Velocidad</th>
              <th role="columnheader" scope="col" className="text-left p-2">Causa</th>
              <th role="columnheader" scope="col" className="text-center p-2">Interno</th>
              <th role="columnheader" scope="col" className="text-center p-2">Externo</th>
              <th role="columnheader" scope="col" className="text-right p-2">Acciones</th>
             </tr>
          </thead>
          <tbody role="rowgroup">
            {fallas.map((f) => (
              <tr key={f.id} role="row" className="border-b hover:bg-muted/50">
                <td role="cell" className="p-2">{formatearFechaTabla(f.fecha)}</td>
                <td role="cell" className="p-2">{f.progresiva} m</td>
                <td role="cell" className="p-2">{f.via}</td>
                <td role="cell" className="p-2">{f.carril}</td>
                <td role="cell" className="p-2">{f.tramoCodigo}</td>
                <td role="cell" className="p-2">
                  {f.curvaHorizontalNombre ?? (
                    <span className="italic text-muted-foreground text-sm">
                      Tangente
                    </span>
                  )}
                </td>
                <td role="cell" className="p-2">
                  {f.curvaVerticalNombre ?? (
                    <span className="italic text-muted-foreground text-sm">
                      Tangente
                    </span>
                  )}
                </td>
                <td role="cell" className="p-2">
                  {formatearVelocidad(f.velocidadKmh)}
                </td>
                <td role="cell" className="p-2 max-w-[200px] truncate" title={f.causa ?? ''}>
                  {f.causa ?? (
                    <span className="italic text-muted-foreground text-sm">
                      Sin causa
                    </span>
                  )}
                </td>
                <td role="cell" className="p-2 text-center">
                  <CeldaArchivoRiel
                    fallaId={f.id}
                    tipo={TipoArchivoFalla.INTERNO}
                    nombre={f.nombreInformeInterno}
                    onVer={() => handleVer(f.id, TipoArchivoFalla.INTERNO)}
                    onDescargar={() =>
                      handleDescargar(
                        f.id,
                        TipoArchivoFalla.INTERNO,
                        f.nombreInformeInterno ?? 'archivo',
                      )
                    }
                    onEliminar={() =>
                      setArchivoAEliminar({
                        fallaId: f.id,
                        tipo: TipoArchivoFalla.INTERNO,
                      })
                    }
                  />
                </td>
                <td role="cell" className="p-2 text-center">
                  <CeldaArchivoRiel
                    fallaId={f.id}
                    tipo={TipoArchivoFalla.EXTERNO}
                    nombre={f.nombreInformeExterno}
                    onVer={() => handleVer(f.id, TipoArchivoFalla.EXTERNO)}
                    onDescargar={() =>
                      handleDescargar(
                        f.id,
                        TipoArchivoFalla.EXTERNO,
                        f.nombreInformeExterno ?? 'archivo',
                      )
                    }
                    onEliminar={() =>
                      setArchivoAEliminar({
                        fallaId: f.id,
                        tipo: TipoArchivoFalla.EXTERNO,
                      })
                    }
                  />
                </td>
                <td role="cell" className="p-2 text-right">
                  <div className="flex gap-1 justify-end">
                    {onVer ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVer(f.id)}
                        aria-label={`Ver falla ${f.id}`}
                      >
                        Ver
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/fallas/riel/${f.id}`} aria-label={`Ver falla ${f.id}`}>
                          Ver
                        </Link>
                      </Button>
                    )}
                    {onEditar ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditar(f.id)}
                        aria-label={`Editar falla ${f.id}`}
                      >
                        Editar
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/fallas/riel/${f.id}/editar`} aria-label={`Editar falla ${f.id}`}>
                          Editar
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onEliminar(f.id)}
                      disabled={eliminandoId === f.id}
                      aria-label={`Eliminar falla ${f.id}`}
                    >
                      {eliminandoId === f.id ? '...' : 'Eliminar'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={archivoAEliminar !== null}
        onOpenChange={(open) => !open && setArchivoAEliminar(null)}
        titulo="Eliminar archivo"
        descripcion={`¿Eliminar el archivo ${archivoAEliminar?.tipo === TipoArchivoFalla.INTERNO ? 'interno' : 'externo'}? Esta acción no se puede deshacer.`}
        etiquetaConfirmar="Eliminar"
        variante="destructive"
        onConfirmar={handleConfirmarEliminarArchivo}
      />
    </>
  );
}

// ============================================================
// SUB-COMPONENTE: celda de archivo
// ============================================================

interface CeldaArchivoRielProps {
  fallaId: number;
  tipo: TipoArchivoFalla;
  nombre: string | null;
  onVer: () => void;
  onDescargar: () => void;
  onEliminar: () => void;
}

function CeldaArchivoRiel({
  fallaId,
  tipo,
  nombre,
  onVer,
  onDescargar,
  onEliminar,
}: CeldaArchivoRielProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subirMut = useSubirArchivoRiel();
  const [isUploading, setIsUploading] = useState(false);

  const handleSubir = async (archivo: File) => {
    setIsUploading(true);
    try {
      await subirMut.mutateAsync({ fallaId, tipo, archivo });
      toast.success('Archivo subido correctamente');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('Error al subir el archivo');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isUploading) {
    return (
      <div className="flex justify-center">
        <div 
          className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Subiendo archivo..."
        />
      </div>
    );
  }

  if (!nombre) {
    return (
      <>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={subirMut.isPending}
          className="inline-flex items-center justify-center w-7 h-7 rounded border border-dashed hover:bg-muted disabled:opacity-50"
          title="Subir archivo"
          aria-label="Subir archivo"
        >
          {subirMut.isPending ? (
            <span className="text-xs">...</span>
          ) : (
            <Plus className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleSubir(file);
          }}
          aria-label="Seleccionar archivo"
        />
      </>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1" title={nombre}>
      <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <button
        type="button"
        onClick={onVer}
        className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-muted"
        title="Ver (abre en nueva pestaña)"
        aria-label="Ver archivo"
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDescargar}
        className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-muted"
        title="Descargar"
        aria-label="Descargar archivo"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onEliminar}
        className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-muted text-destructive"
        title="Eliminar"
        aria-label="Eliminar archivo"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}