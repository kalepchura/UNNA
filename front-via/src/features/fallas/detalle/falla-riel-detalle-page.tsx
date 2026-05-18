/**
 * Página de detalle de una falla riel.
 *
 * UX:
 *  - Curva H/V null → "Tangente" en cursiva gris (sección recta).
 *  - Causa/Origen null → "Sin información" en cursiva gris.
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useState } from 'react';
import {
  useFallaRiel,
  useEliminarFallaRiel,
} from '@/features/fallas/hooks/use-fallas-riel';
import { ArchivoUploader } from '@/features/fallas/components/archivo-uploader';
import { TipoArchivoFalla } from '@/lib/types/common';

export function FallaRielDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const fallaId = Number(id);
  const { data: falla, isLoading } = useFallaRiel(fallaId);
  const eliminarMut = useEliminarFallaRiel();

  if (isLoading) {
    return <p className="p-4">Cargando falla...</p>;
  }

  if (!falla) {
    return (
      <div className="p-4 space-y-2">
        <p>Falla no encontrada.</p>
        <Button asChild variant="outline">
          <Link to="/fallas/riel">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  const handleEliminar = async () => {
    await eliminarMut.mutateAsync(fallaId);
    navigate('/fallas/riel');
  };

  return (
    <div className="pagina-detalle-riel p-4 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Falla de Riel #{falla.id}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/fallas/riel">Volver</Link>
          </Button>
          <Button asChild>
            <Link to={`/fallas/riel/${falla.id}/editar`}>Editar</Link>
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
            valor={formatearFecha(falla.fecha)}
          />
          <Campo label="Progresiva" valor={`${falla.progresiva} m`} />
          <Campo label="Vía" valor={falla.via} />
          <Campo label="Carril" valor={falla.carril} />
          <Campo
            label="Velocidad"
            valor={
              falla.velocidadKmh != null
                ? `${falla.velocidadKmh} km/h`
                : '—'
            }
          />
        </div>
      </Card>

      {/* Contexto geográfico */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Contexto geográfico</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Campo
            label="Tramo"
            valor={`${falla.tramoCodigo} — ${falla.tramoNombre}`}
          />
          {/* Curva H: null = Tangente */}
          <CampoTangente
            label="Curva horizontal"
            valor={falla.curvaHorizontalNombre}
          />
          {/* Curva V: null = Tangente */}
          <CampoTangente
            label="Curva vertical"
            valor={falla.curvaVerticalNombre}
          />
        </div>
      </Card>

      {/* Causa y origen */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Causa y origen</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <CampoOpcional
            label="Causa"
            valor={falla.causa}
            placeholder="Sin causa registrada"
            multilinea
          />
          <CampoOpcional
            label="Origen"
            valor={falla.origen}
            placeholder="Sin origen registrado"
            multilinea
          />
        </div>
      </Card>

      {/* Archivos */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Informes adjuntos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ArchivoUploader
            fallaId={falla.id}
            tipo={TipoArchivoFalla.INTERNO}
            nombreActual={falla.nombreInformeInterno}
            label="Informe interno"
          />
          <ArchivoUploader
            fallaId={falla.id}
            tipo={TipoArchivoFalla.EXTERNO}
            nombreActual={falla.nombreInformeExterno}
            label="Informe externo"
          />
        </div>
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
        descripcion="¿Estás seguro? La falla pasará a estado eliminado. Solo un administrador podrá restaurarla."
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

/**
 * Campo donde null = "Tangente" (sección recta).
 * Aplica a curva horizontal y vertical de Riel.
 */
function CampoTangente({
  label,
  valor,
}: {
  label: string;
  valor: string | null;
}) {
  return (
    <div className="campo-detalle">
      <p className="text-xs text-muted-foreground">{label}</p>
      {valor ? (
        <p>{valor}</p>
      ) : (
        <p className="italic text-muted-foreground">Tangente</p>
      )}
    </div>
  );
}

/**
 * Campo opcional con placeholder customizable cuando es null.
 */
function CampoOpcional({
  label,
  valor,
  placeholder,
  multilinea,
}: {
  label: string;
  valor: string | null;
  placeholder: string;
  multilinea?: boolean;
}) {
  return (
    <div className="campo-detalle">
      <p className="text-xs text-muted-foreground">{label}</p>
      {valor ? (
        <p className={multilinea ? 'whitespace-pre-wrap' : ''}>{valor}</p>
      ) : (
        <p className="italic text-muted-foreground">{placeholder}</p>
      )}
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