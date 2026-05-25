/**
 * Tabla de fallas soldadura inox.
 *
 * Características:
 *  - PT null → "Sin PT" cursiva.
 *  - Columna "Imágenes": ícono que abre modal de galería.
 *  - Manejo de errores con toast
 *  - Skeleton loading
 *  - Accesibilidad ARIA
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonFallasSoldadura } from '@/components/shared/skeleton-table';
import { ModalGaleriaImagenes } from './modal-galeria-imagenes';
import { formatearFechaTabla, formatearVelocidad } from '@/lib/format';
import { AccionFalla } from '@/lib/types/common';
import type { FallaSoldaduraInox } from '@/features/fallas/types/falla-soldadura.types';

interface ListadoSoldaduraProps {
  fallas: FallaSoldaduraInox[];
  isLoading: boolean;
  onEliminar: (id: number) => void;
  eliminandoId?: number | null;
  /** Si se provee, "Ver" abre via callback en vez de navegar. */
  onVer?: (id: number) => void;
  /** Si se provee, "Editar" abre via callback en vez de navegar. */
  onEditar?: (id: number) => void;
}

export function ListadoSoldadura({
  fallas,
  isLoading,
  onEliminar,
  eliminandoId,
  onVer,
  onEditar,
}: ListadoSoldaduraProps) {
  const [fallaIdGaleria, setFallaIdGaleria] = useState<number | null>(null);

  const handleAbrirGaleria = (fallaId: number) => {
    try {
      setFallaIdGaleria(fallaId);
    } catch (error) {
      toast.error('Error al abrir la galería');
      console.error(error);
    }
  };

  if (isLoading) {
    return <SkeletonFallasSoldadura />;
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
        aria-label="Listado de fallas de soldadura"
      >
        <table 
          className="tabla-fallas w-full border-collapse"
          aria-label="Tabla de fallas de soldadura"
          role="table"
        >
          <thead role="rowgroup">
            <tr role="row" className="border-b">
              <th role="columnheader" scope="col" className="text-left p-2">Fecha</th>
              <th role="columnheader" scope="col" className="text-left p-2">Cambiavía</th>
              <th role="columnheader" scope="col" className="text-left p-2">Tramo</th>
              <th role="columnheader" scope="col" className="text-left p-2">Vía</th>
              <th role="columnheader" scope="col" className="text-left p-2">Progresiva</th>
              <th role="columnheader" scope="col" className="text-left p-2">Ubicación</th>
              <th role="columnheader" scope="col" className="text-left p-2">Acción</th>
              <th role="columnheader" scope="col" className="text-left p-2">PT</th>
              <th role="columnheader" scope="col" className="text-left p-2">Velocidad</th>
              <th role="columnheader" scope="col" className="text-center p-2">Imágenes</th>
              <th role="columnheader" scope="col" className="text-right p-2">Acciones</th>
             </tr>
          </thead>
          <tbody role="rowgroup">
            {fallas.map((f) => (
              <tr key={f.id} role="row" className="border-b hover:bg-muted/50">
                <td role="cell" className="p-2">{formatearFechaTabla(f.fechaDeteccion)}</td>
                <td role="cell" className="p-2">{f.cambiaviaCodigoBd}</td>
                <td role="cell" className="p-2">{f.tramoCodigo}</td>
                <td role="cell" className="p-2">{f.via}</td>
                <td role="cell" className="p-2">{f.progresiva} m</td>
                <td role="cell" className="p-2">{f.ubicacionFalla}</td>
                <td role="cell" className="p-2">
                  <Badge variant={badgeVarianteAccion(f.accion)}>
                    {f.accion}
                  </Badge>
                </td>
                <td role="cell" className="p-2">
                  {f.pt ?? (
                    <span className="italic text-muted-foreground text-sm">
                      Sin PT
                    </span>
                  )}
                </td>
                <td role="cell" className="p-2">{formatearVelocidad(f.velocidadKmh)}</td>
                <td role="cell" className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleAbrirGaleria(f.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-muted"
                    title="Ver galería de imágenes"
                    aria-label={`Ver galería de imágenes de falla ${f.id}`}
                  >
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
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
                        <Link to={`/fallas/soldadura/${f.id}`} aria-label={`Ver falla ${f.id}`}>
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
                        <Link to={`/fallas/soldadura/${f.id}/editar`} aria-label={`Editar falla ${f.id}`}>
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

      <ModalGaleriaImagenes
        fallaId={fallaIdGaleria}
        abierto={fallaIdGaleria !== null}
        onClose={() => setFallaIdGaleria(null)}
      />
    </>
  );
}

function badgeVarianteAccion(
  accion: AccionFalla,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (accion) {
    case AccionFalla.CONSOLIDADO:
      return 'default';
    case AccionFalla.POR_DEFINIR:
      return 'destructive';
    case AccionFalla.SUSTITUIDO:
      return 'secondary';
    default:
      return 'outline';
  }
}