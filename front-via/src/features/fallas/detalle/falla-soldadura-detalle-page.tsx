/**
 * Página de detalle de una falla soldadura inox.
 *
 * Muestra:
 *  - Todos los datos de la falla + contexto del cambiavía aplanado
 *  - Galería de imágenes + uploader
 *  - Botones: Editar, Eliminar, Volver
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  useFallaSoldadura,
  useEliminarFallaSoldadura,
} from '@/features/fallas/hooks/use-fallas-soldadura';
import { ImagenesUploader } from '@/features/fallas/components/imagenes-uploader';
import { ImagenesGaleria } from './imagenes-galeria';

export function FallaSoldaduraDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const fallaId = Number(id);
  const { data: falla, isLoading } = useFallaSoldadura(fallaId);
  const eliminarMut = useEliminarFallaSoldadura();

  if (isLoading) {
    return <p className="p-4">Cargando falla...</p>;
  }

  if (!falla) {
    return (
      <div className="p-4 space-y-2">
        <p>Falla no encontrada.</p>
        <Button asChild variant="outline">
          <Link to="/fallas/soldadura">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  const handleEliminar = async () => {
    await eliminarMut.mutateAsync(fallaId);
    navigate('/fallas/soldadura');
  };

  return (
    <div className="pagina-detalle-soldadura p-4 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Falla Soldadura #{falla.id}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/fallas/soldadura">Volver</Link>
          </Button>
          <Button asChild>
            <Link to={`/fallas/soldadura/${falla.id}/editar`}>Editar</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setMostrarConfirmar(true)}
          >
            Eliminar
          </Button>
        </div>
      </header>

      {/* Datos principales */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Datos principales</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Campo
            label="Fecha de detección"
            valor={formatearFecha(falla.fechaDeteccion)}
          />
          <Campo label="Ubicación de falla" valor={falla.ubicacionFalla} />
          <CampoConBadge
            label="Acción"
            valor={falla.accion}
            varianteBadge={badgeVarianteAccion(falla.accion)}
          />
          <Campo label="PT (ensayo)" valor={falla.pt ?? '—'} />
        </div>
      </Card>

      {/* Cambiavía (datos heredados) */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Cambiavía asociado</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Campo label="Código" valor={falla.cambiaviaCodigoBd} />
          <Campo
            label="Descripción"
            valor={falla.cambiaviaDescripcion ?? '—'}
          />
          <Campo label="Tipo" valor={falla.cambiaviaTipo} />
          <Campo label="Norma" valor={falla.cambiaviaNorma} />
          <Campo label="Vía" valor={falla.via} />
          <Campo label="Velocidad" valor={`${falla.velocidadKmh} km/h`} />
        </div>
      </Card>

      {/* Contexto geográfico */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Contexto geográfico</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Campo label="Progresiva" valor={`${falla.progresiva} m`} />
          <Campo
            label="Tramo"
            valor={`${falla.tramoCodigo} — ${falla.tramoNombre}`}
          />
        </div>
      </Card>

      {/* Observación y ensayo */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Notas y ensayo</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Campo
            label="Observación"
            valor={falla.observacion ?? '—'}
            multilinea
          />
          <Campo label="Ensayo" valor={falla.ensayo ?? '—'} multilinea />
        </div>
      </Card>

      {/* Imágenes */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Imágenes</h2>
        <ImagenesUploader fallaId={falla.id} />
        <ImagenesGaleria fallaId={falla.id} />
      </Card>

      {/* Auditoría */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Auditoría</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Campo label="Creado" valor={formatearFechaHora(falla.creadoEn)} />
          <Campo
            label="Última modificación"
            valor={formatearFechaHora(falla.actualizadoEn)}
          />
        </div>
      </Card>

      {/* Confirmar eliminar */}
      <ConfirmDialog
        open={mostrarConfirmar}
        onOpenChange={setMostrarConfirmar}
        titulo="Eliminar falla"
        descripcion="¿Estás seguro? La falla pasará a estado eliminado. Solo un administrador podrá restaurarla. Las imágenes asociadas no se eliminarán pero quedarán inaccesibles."
        etiquetaConfirmar="Eliminar"
        variante="destructive"
        onConfirmar={handleEliminar}
      />
    </div>
  );
}

// ============================================================
// Sub-componentes locales
// ============================================================

interface CampoProps {
  label: string;
  valor: string;
  multilinea?: boolean;
}

function Campo({ label, valor, multilinea }: CampoProps) {
  return (
    <div className="campo-detalle">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={multilinea ? 'whitespace-pre-wrap' : ''}>{valor}</p>
    </div>
  );
}

interface CampoConBadgeProps {
  label: string;
  valor: string;
  varianteBadge: 'default' | 'secondary' | 'destructive' | 'outline';
}

function CampoConBadge({ label, valor, varianteBadge }: CampoConBadgeProps) {
  return (
    <div className="campo-detalle">
      <p className="text-xs text-muted-foreground">{label}</p>
      <Badge variant={varianteBadge}>{valor}</Badge>
    </div>
  );
}

// ============================================================
// Helpers locales
// ============================================================

function formatearFecha(iso: string): string {
  const [yyyy, mm, dd] = iso.split('T')[0].split('-');
  return `${dd}/${mm}/${yyyy}`;
}

function formatearFechaHora(iso: string): string {
  const d = new Date(iso);
  const fecha = formatearFecha(d.toISOString());
  const hora = d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${fecha} ${hora}`;
}

function badgeVarianteAccion(
  accion: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (accion) {
    case 'CONSOLIDADO':
      return 'default';
    case 'POR_DEFINIR':
      return 'destructive';
    case 'SUSTITUIDO':
      return 'secondary';
    default:
      return 'outline';
  }
}