import { useState, useCallback } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { fallasApi } from '@/lib/api/fallas.api';

// ============================================================
// TIPOS
// ============================================================

interface ResultadoImportacion {
  totalFilas: number;
  deteccionesCreadas: number;
  accionesCreadas: number;
  errores: number;
  detalleErrores: { fila: number; columna?: string; mensaje: string }[];
}

interface Props {
  onClose: () => void;
}

// ============================================================
// DATOS DE LA PLANTILLA
// ============================================================

const COLUMNAS_DETECCION = [
  { col: 'TIPO', req: true, ejemplo: 'DETECCION', desc: 'Siempre "DETECCION" para esta fila' },
  { col: 'PROGRESIVA', req: true, ejemplo: '4689', desc: 'Entero positivo (metros)' },
  { col: 'VIA', req: true, ejemplo: 'PAR', desc: 'PAR | IMPAR | TERCERA | CERO' },
  { col: 'FECHA', req: true, ejemplo: '2024-03-15', desc: 'YYYY-MM-DD o DD/MM/YYYY' },
  { col: 'CARRIL', req: true, ejemplo: 'IZQUIERDA', desc: 'IZQUIERDA | DERECHA' },
  { col: 'CAUSA', req: false, ejemplo: 'Fatiga por tráfico', desc: 'Texto libre (opcional)' },
  { col: 'ORIGEN', req: false, ejemplo: 'Inspección rutinaria', desc: 'Texto libre (opcional)' },
  { col: 'TIPO_DEFECTO', req: false, ejemplo: 'SQUAT', desc: 'SIN_DEFINIR | ASTILLAMIENTO_RCF | SQUAT | REBORDE | ONDULACION | FISURA | DESGASTE_LATERAL | CORRUGACION | OTRO' },
  { col: 'ELEMENTO_AFECTADO', req: false, ejemplo: 'BARRA', desc: 'SIN_DEFINIR | BARRA | SOLDADURA_ELECTROFUSION | SOLDADURA_ALUMINOTERMICA | JUNTA' },
  { col: 'ZONA_AFECTADA', req: false, ejemplo: 'BANDA_RODADURA', desc: 'SIN_DEFINIR | BANDA_RODADURA | CARA_ACTIVA | CARA_PASIVA | HONGO | ALMA | PATIN' },
  { col: 'PERFIL', req: false, ejemplo: '115RE', desc: 'SIN_DEFINIR | 115RE | 100RE | ASCE75 | 50UNI | 36UNI | UIC 1:10' },
  { col: 'ALTA_BAJA', req: false, ejemplo: 'NO_APLICA', desc: 'NO_APLICA | ALTA | BAJA' },
  { col: 'PROGRESIVA_FINAL', req: false, ejemplo: '4886', desc: 'Entero positivo (metros), si el defecto abarca un tramo' },
  { col: 'LARGO_MM', req: false, ejemplo: '45.5', desc: 'Decimal positivo en milímetros' },
  { col: 'ANCHO_MM', req: false, ejemplo: '12.0', desc: 'Decimal positivo en milímetros' },
  { col: 'PROFUNDIDAD_MM', req: false, ejemplo: '3.2', desc: 'Decimal positivo en milímetros' },
  { col: 'NUMERO_FOTO', req: false, ejemplo: '7', desc: 'Entero positivo (correlativo de foto en reporte)' },
  { col: 'TIPO_ONDA', req: false, ejemplo: 'Corta', desc: 'Texto libre (opcional)' },
];

const COLUMNAS_ACCION = [
  { col: 'TIPO', req: true, ejemplo: 'ACCION', desc: 'Siempre "ACCION" para esta fila' },
  { col: 'PROGRESIVA', req: true, ejemplo: '4689', desc: 'Debe coincidir con la DETECCION en este archivo' },
  { col: 'VIA', req: true, ejemplo: 'PAR', desc: 'Debe coincidir con la DETECCION en este archivo' },
  { col: 'ACCION', req: true, ejemplo: 'ESMERILADO', desc: 'ESMERILADO | ESMERILADO_PREVENTIVO | REEMPLAZO | RECARGA_RIEL | MONITOREO | OTRO' },
  { col: 'CONCLUSION', req: true, ejemplo: 'PROGRAMADO', desc: 'NO_ATENDIDO | PROGRAMADO | EN_EJECUCION | RESUELTO | CANCELADO | FALTA_VERIFICAR' },
  { col: 'PT', req: false, ejemplo: 'GYMF-1785461', desc: 'Código de orden de trabajo (opcional)' },
  { col: 'FECHA_EJECUCION', req: false, ejemplo: '2024-04-01', desc: 'YYYY-MM-DD o DD/MM/YYYY (opcional)' },
  { col: 'OBSERVACIONES', req: false, ejemplo: 'Pendiente de revisión', desc: 'Texto libre (opcional)' },
];

// ============================================================
// FUNCIÓN: GENERAR PLANTILLA EXCEL
// ============================================================

function descargarPlantilla() {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Datos (plantilla con ejemplos)
  const filaEncabezado = [
    'TIPO', 'PROGRESIVA', 'VIA', 'FECHA', 'CARRIL',
    'CAUSA', 'ORIGEN', 'TIPO_DEFECTO', 'ELEMENTO_AFECTADO',
    'ZONA_AFECTADA', 'PERFIL', 'ALTA_BAJA', 'PROGRESIVA_FINAL',
    'LARGO_MM', 'ANCHO_MM', 'PROFUNDIDAD_MM', 'NUMERO_FOTO', 'TIPO_ONDA',
    // Columnas de acción (solo aplican cuando TIPO=ACCION)
    'ACCION', 'CONCLUSION', 'PT', 'FECHA_EJECUCION', 'OBSERVACIONES',
  ];

  const filaEjemploDeteccion = [
    'DETECCION', 4689, 'PAR', '2024-03-15', 'IZQUIERDA',
    'Fatiga por tráfico', 'Inspección rutinaria', 'SQUAT', 'BARRA',
    'BANDA_RODADURA', '115RE', 'NO_APLICA', 4886,
    45.5, 12.0, 3.2, 7, '',
    '', '', '', '', '',
  ];

  const filaEjemploAccion = [
    'ACCION', 4689, 'PAR', '', '',
    '', '', '', '',
    '', '', '', '',
    '', '', '', '', '',
    'ESMERILADO', 'PROGRAMADO', 'GYMF-1785461', '2024-04-01', 'Programado para semana 15',
  ];

  const filaEjemploDeteccion2 = [
    'DETECCION', 5100, 'IMPAR', '2024-03-20', 'DERECHA',
    '', '', 'FISURA', 'SIN_DEFINIR',
    'HONGO', '100RE', 'NO_APLICA', '',
    '', '', '', '', '',
    '', '', '', '', '',
  ];

  const ws = XLSX.utils.aoa_to_sheet([
    filaEncabezado,
    filaEjemploDeteccion,
    filaEjemploAccion,
    filaEjemploDeteccion2,
  ]);

  // Ancho de columnas
  ws['!cols'] = filaEncabezado.map((_, i) => ({ wch: i < 4 ? 16 : 22 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Fallas');

  // Hoja 2: Instrucciones con valores permitidos
  const instrucciones = [
    ['INSTRUCCIONES DE USO'],
    [''],
    ['1. La primera columna TIPO indica si la fila es una DETECCION o una ACCION.'],
    ['2. Las columnas obligatorias para DETECCION son: TIPO, PROGRESIVA, VIA, FECHA, CARRIL.'],
    ['3. Las columnas obligatorias para ACCION son: TIPO, PROGRESIVA, VIA, ACCION, CONCLUSION.'],
    ['4. Una ACCION debe tener la misma PROGRESIVA y VIA que su DETECCION en el mismo archivo.'],
    ['5. Los campos vacíos en columnas opcionales se ignoran (el sistema usará el valor por defecto).'],
    ['6. Las fechas aceptan formato YYYY-MM-DD o DD/MM/YYYY.'],
    ['7. Los valores de enum deben escribirse exactamente como se indica (mayúsculas, sin tildes).'],
    [''],
    ['VALORES PERMITIDOS POR CAMPO'],
    [''],
    ['VIA:', 'PAR | IMPAR | TERCERA | CERO'],
    ['CARRIL:', 'IZQUIERDA | DERECHA'],
    ['TIPO_DEFECTO:', 'SIN_DEFINIR | ASTILLAMIENTO_RCF | SQUAT | REBORDE | ONDULACION | FISURA | DESGASTE_LATERAL | CORRUGACION | OTRO'],
    ['ELEMENTO_AFECTADO:', 'SIN_DEFINIR | BARRA | SOLDADURA_ELECTROFUSION | SOLDADURA_ALUMINOTERMICA | JUNTA'],
    ['ZONA_AFECTADA:', 'SIN_DEFINIR | BANDA_RODADURA | CARA_ACTIVA | CARA_PASIVA | HONGO | ALMA | PATIN'],
    ['PERFIL:', 'SIN_DEFINIR | 115RE | 100RE | ASCE75 | 50UNI | 36UNI | UIC 1:10'],
    ['ALTA_BAJA:', 'NO_APLICA | ALTA | BAJA'],
    ['ACCION:', 'ESMERILADO | ESMERILADO_PREVENTIVO | REEMPLAZO | RECARGA_RIEL | MONITOREO | OTRO'],
    ['CONCLUSION:', 'NO_ATENDIDO | PROGRAMADO | EN_EJECUCION | RESUELTO | CANCELADO | FALTA_VERIFICAR'],
  ];

  const wsInstr = XLSX.utils.aoa_to_sheet(instrucciones);
  wsInstr['!cols'] = [{ wch: 25 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, 'Instrucciones');

  XLSX.writeFile(wb, 'plantilla-fallas-riel.xlsx');
}

// ============================================================
// HELPERS UI
// ============================================================

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function FormImportarFallasRiel({ onClose }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [vista, setVista] = useState<'form' | 'resultado'>('form');

  const invalidate = useInvalidate();

  const importMut = useApiMutation<ResultadoImportacion, void>({
    mutationFn: async () => {
      if (!archivo) throw new Error('Seleccione un archivo');
      return fallasApi.riel.importar(archivo);
    },
    onSuccess: (data) => {
      setResultado(data);
      setVista('resultado');
      // Solo invalidar si hubo al menos una creación exitosa
      if (data.deteccionesCreadas > 0 || data.accionesCreadas > 0) {
        invalidate(['fallas']);
      }
    },
  });

  const handleSubmit = useCallback(() => {
    importMut.mutate(undefined);
  }, [importMut]);

  const handleNuevaImportacion = () => {
    setArchivo(null);
    setResultado(null);
    setVista('form');
    importMut.reset();
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" size="lg">
        <SheetHeader>
          <SheetTitle>Importar fallas de riel</SheetTitle>
          <SheetDescription>
            Carga masiva desde Excel. El archivo puede contener detecciones y sus acciones.
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-6">

          {/* ── VISTA: FORMULARIO ── */}
          {vista === 'form' && (
            <>
              {/* Instrucciones */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Info className="h-4 w-4 text-brand" />
                  Estructura del archivo
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cada fila debe tener la columna <span className="font-semibold text-foreground">TIPO</span> con
                  valor <span className="font-mono bg-muted px-1 rounded">DETECCION</span> o{' '}
                  <span className="font-mono bg-muted px-1 rounded">ACCION</span>.
                  Una acción debe tener la misma <strong>PROGRESIVA</strong> y <strong>VIA</strong> que
                  su detección en el mismo archivo.
                </p>

                {/* Tabla detección */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1.5">
                    Columnas para DETECCION
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border px-2 py-1 text-left font-medium">Columna</th>
                          <th className="border border-border px-2 py-1 text-left font-medium">Req.</th>
                          <th className="border border-border px-2 py-1 text-left font-medium">Ejemplo / Valores</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COLUMNAS_DETECCION.map((c) => (
                          <tr key={c.col} className="even:bg-muted/20">
                            <td className="border border-border px-2 py-1 font-mono font-medium">{c.col}</td>
                            <td className="border border-border px-2 py-1 text-center">
                              {c.req
                                ? <span className="text-destructive font-bold">Sí</span>
                                : <span className="text-muted-foreground">No</span>}
                            </td>
                            <td className="border border-border px-2 py-1 text-muted-foreground">{c.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabla acción */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1.5">
                    Columnas para ACCION
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border px-2 py-1 text-left font-medium">Columna</th>
                          <th className="border border-border px-2 py-1 text-left font-medium">Req.</th>
                          <th className="border border-border px-2 py-1 text-left font-medium">Ejemplo / Valores</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COLUMNAS_ACCION.map((c) => (
                          <tr key={c.col} className="even:bg-muted/20">
                            <td className="border border-border px-2 py-1 font-mono font-medium">{c.col}</td>
                            <td className="border border-border px-2 py-1 text-center">
                              {c.req
                                ? <span className="text-destructive font-bold">Sí</span>
                                : <span className="text-muted-foreground">No</span>}
                            </td>
                            <td className="border border-border px-2 py-1 text-muted-foreground">{c.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={descargarPlantilla}
                >
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Descargar plantilla con ejemplos
                </Button>
              </div>

              {/* Selector de archivo */}
              <div className="space-y-1.5">
                <label
                  htmlFor="imp-archivo-riel"
                  className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 transition-colors hover:border-border-strong hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-soft-foreground">
                    {archivo ? <FileText className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    {archivo ? (
                      <>
                        <p className="truncate text-sm font-medium text-foreground">{archivo.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(archivo.size)} · Click para cambiar</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-foreground">Seleccionar archivo</p>
                        <p className="text-xs text-muted-foreground">Excel (.xlsx o .xls) · Máx. 10 MB</p>
                      </>
                    )}
                  </div>
                  <Input
                    id="imp-archivo-riel"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>
              </div>

              {importMut.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm text-destructive-soft-foreground">
                  <strong>Error:</strong> {importMut.error.message}
                </div>
              )}
            </>
          )}

          {/* ── VISTA: RESULTADO ── */}
          {vista === 'resultado' && resultado && (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {resultado.errores === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : resultado.deteccionesCreadas > 0 ? (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="font-medium text-foreground">
                    {resultado.errores === 0
                      ? 'Importación completada sin errores'
                      : resultado.deteccionesCreadas > 0
                        ? 'Importación completada con algunos errores'
                        : 'Importación fallida'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-muted px-3 py-2">
                    <p className="text-xs text-muted-foreground">Total filas procesadas</p>
                    <p className="text-lg font-semibold tabular-nums">{resultado.totalFilas}</p>
                  </div>
                  <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2">
                    <p className="text-xs text-green-700">Detecciones creadas</p>
                    <p className="text-lg font-semibold tabular-nums text-green-800">{resultado.deteccionesCreadas}</p>
                  </div>
                  <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2">
                    <p className="text-xs text-blue-700">Acciones creadas</p>
                    <p className="text-lg font-semibold tabular-nums text-blue-800">{resultado.accionesCreadas}</p>
                  </div>
                  <div className={`rounded-md px-3 py-2 ${resultado.errores > 0 ? 'bg-red-50 border border-red-200' : 'bg-muted'}`}>
                    <p className={`text-xs ${resultado.errores > 0 ? 'text-red-700' : 'text-muted-foreground'}`}>Filas con error</p>
                    <p className={`text-lg font-semibold tabular-nums ${resultado.errores > 0 ? 'text-red-800' : ''}`}>{resultado.errores}</p>
                  </div>
                </div>
              </div>

              {/* Detalle de errores */}
              {resultado.detalleErrores.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Detalle de errores {resultado.errores > 50 ? `(mostrando primeros 50 de ${resultado.errores})` : ''}
                  </p>
                  <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                    {resultado.detalleErrores.map((err, i) => (
                      <div key={i} className="px-3 py-2 text-xs">
                        <span className="font-semibold text-muted-foreground">Fila {err.fila}</span>
                        {err.columna && (
                          <span className="ml-2 font-mono bg-muted px-1 rounded text-foreground">{err.columna}</span>
                        )}
                        <span className="ml-2 text-destructive">{err.mensaje}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleNuevaImportacion}
              >
                Importar otro archivo
              </Button>
            </div>
          )}

        </SheetBody>

        <SheetFooter>
          {vista === 'form' ? (
            <>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={importMut.isPending || !archivo}
              >
                {importMut.isPending ? 'Procesando…' : 'Importar'}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}