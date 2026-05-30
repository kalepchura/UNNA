import * as XLSX from 'xlsx';
import {
  TipoVia,
  LadoRiel,
  TipoDefectoRiel,
  ElementoAfectadoRiel,
  ZonaAfectadaRiel,
  PerfilFallaRiel,
  AltaBaja,
  AccionRiel,
  EstadoFalla,
} from '../../../common/enums';

// ============================================================
// TIPOS DE RESULTADO
// ============================================================

export interface FilaDeteccionParseada {
  tipo: 'DETECCION';
  fila: number;
  progresiva: number;
  via: TipoVia;
  fecha: string;            // YYYY-MM-DD
  carril: LadoRiel;
  causa?: string;
  origen?: string;
  tipoDefecto?: TipoDefectoRiel;
  elementoAfectado?: ElementoAfectadoRiel;
  zonaAfectada?: ZonaAfectadaRiel;
  perfil?: PerfilFallaRiel;
  altaBaja?: AltaBaja;
  progresivaFinal?: number;
  largo?: number;
  ancho?: number;
  profundidad?: number;
  numeroFoto?: number;
  tipoOnda?: string;
}

export interface FilaAccionParseada {
  tipo: 'ACCION';
  fila: number;
  /** Clave para emparejar con la detección: "progresiva|via" */
  claveDeteccion: string;
  accion: AccionRiel;
  conclusion: EstadoFalla;
  pt?: string;
  fechaEjecucion?: string;  // YYYY-MM-DD
  observaciones?: string;
}

export interface ErrorParseo {
  fila: number;
  columna?: string;
  mensaje: string;
}

export interface ResultadoParseoFallasRiel {
  detecciones: FilaDeteccionParseada[];
  acciones: FilaAccionParseada[];
  errores: ErrorParseo[];
  totalFilas: number;
}

// ============================================================
// COLUMNAS ESPERADAS
// ============================================================

/**
 * La primera columna "TIPO" indica si la fila es DETECCION o ACCION.
 *
 * Columnas para DETECCION (obligatorias: TIPO, PROGRESIVA, VIA, FECHA, CARRIL):
 *   TIPO | PROGRESIVA | VIA | FECHA | CARRIL | CAUSA | ORIGEN |
 *   TIPO_DEFECTO | ELEMENTO_AFECTADO | ZONA_AFECTADA | PERFIL | ALTA_BAJA |
 *   PROGRESIVA_FINAL | LARGO_MM | ANCHO_MM | PROFUNDIDAD_MM | NUMERO_FOTO | TIPO_ONDA
 *
 * Columnas para ACCION (obligatorias: TIPO, PROGRESIVA, VIA, ACCION, CONCLUSION):
 *   TIPO | PROGRESIVA | VIA | ACCION | CONCLUSION | PT | FECHA_EJECUCION | OBSERVACIONES
 *
 * La misma hoja contiene ambos tipos de fila intercaladas.
 * Una ACCION sin DETECCION previa de la misma (progresiva+via) en el mismo
 * archivo es un error — se reporta pero no detiene el procesamiento.
 */

// ============================================================
// HELPERS
// ============================================================

function normalizar(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim().toUpperCase();
}

function normalizarTexto(val: unknown): string | undefined {
  if (val === null || val === undefined) return undefined;
  const s = String(val).trim();
  return s.length > 0 ? s : undefined;
}

function parsearFecha(val: unknown, fila: number, col: string): string | null {
  if (val === null || val === undefined || val === '') return null;

  // Si XLSX lo entregó como número serial de Excel
  if (typeof val === 'number') {
    const fecha = XLSX.SSF.parse_date_code(val);
    if (!fecha) return null;
    const mm = String(fecha.m).padStart(2, '0');
    const dd = String(fecha.d).padStart(2, '0');
    return `${fecha.y}-${mm}-${dd}`;
  }

  // Si viene como string
  const s = String(val).trim();
  // Aceptar YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Aceptar DD/MM/YYYY
  const partes = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (partes) return `${partes[3]}-${partes[2]}-${partes[1]}`;

  return null;
}

function parsearEntero(val: unknown): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(val);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

function parsearDecimal(val: unknown): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(val);
  return !isNaN(n) && n >= 0 ? Math.round(n * 100) / 100 : undefined;
}

function validarEnum<T extends Record<string, string>>(
  enumObj: T,
  val: string,
): T[keyof T] | undefined {
  return (Object.values(enumObj) as string[]).includes(val)
    ? (val as T[keyof T])
    : undefined;
}

// ============================================================
// PARSER PRINCIPAL
// ============================================================

export function parsearExcelFallasRiel(
  buffer: Buffer,
): ResultadoParseoFallasRiel {
  const resultado: ResultadoParseoFallasRiel = {
    detecciones: [],
    acciones: [],
    errores: [],
    totalFilas: 0,
  };

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  } catch {
    resultado.errores.push({ fila: 0, mensaje: 'No se pudo leer el archivo. Asegúrese de que sea un archivo Excel válido (.xlsx o .xls).' });
    return resultado;
  }

  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  if (!hoja) {
    resultado.errores.push({ fila: 0, mensaje: 'El archivo está vacío o no tiene hojas.' });
    return resultado;
  }

  const filas: Record<string, unknown>[] = XLSX.utils.sheet_to_json(hoja, {
    defval: null,
    raw: true,
  });

  resultado.totalFilas = filas.length;

  if (filas.length === 0) {
    resultado.errores.push({ fila: 0, mensaje: 'El archivo no contiene datos (solo encabezados o está vacío).' });
    return resultado;
  }

  // Mapa para validar que una ACCION tiene su DETECCION en el mismo archivo
  // Clave: "progresiva|via"
  const deteccionesVistas = new Set<string>();

  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];
    const nFila = i + 2; // +2 porque fila 1 = encabezado

    const tipo = normalizar(fila['TIPO']);

    if (!tipo) {
      resultado.errores.push({ fila: nFila, columna: 'TIPO', mensaje: 'La columna TIPO es obligatoria. Debe ser DETECCION o ACCION.' });
      continue;
    }

    if (tipo !== 'DETECCION' && tipo !== 'ACCION') {
      resultado.errores.push({ fila: nFila, columna: 'TIPO', mensaje: `TIPO inválido "${tipo}". Solo se permite DETECCION o ACCION.` });
      continue;
    }

    // ---------- CAMPOS COMUNES ----------
    const progresivaRaw = parsearEntero(fila['PROGRESIVA']);
    if (progresivaRaw === undefined) {
      resultado.errores.push({ fila: nFila, columna: 'PROGRESIVA', mensaje: 'PROGRESIVA es obligatoria y debe ser un número entero positivo.' });
      continue;
    }

    const viaRaw = normalizar(fila['VIA']);
    const via = validarEnum(TipoVia, viaRaw);
    if (!via) {
      resultado.errores.push({ fila: nFila, columna: 'VIA', mensaje: `VIA inválida "${viaRaw}". Valores permitidos: ${Object.values(TipoVia).join(', ')}.` });
      continue;
    }

    const claveDeteccion = `${progresivaRaw}|${via}`;

    // ============================================================
    // FILA DETECCIÓN
    // ============================================================
    if (tipo === 'DETECCION') {
      const fechaRaw = parsearFecha(fila['FECHA'], nFila, 'FECHA');
      if (!fechaRaw) {
        resultado.errores.push({ fila: nFila, columna: 'FECHA', mensaje: 'FECHA es obligatoria. Formatos aceptados: YYYY-MM-DD o DD/MM/YYYY.' });
        continue;
      }

      const carrilRaw = normalizar(fila['CARRIL']);
      const carril = validarEnum(LadoRiel, carrilRaw);
      if (!carril) {
        resultado.errores.push({ fila: nFila, columna: 'CARRIL', mensaje: `CARRIL inválido "${carrilRaw}". Valores permitidos: ${Object.values(LadoRiel).join(', ')}.` });
        continue;
      }

      // Opcionales con validación de enum
      const tipoDefectoRaw = normalizar(fila['TIPO_DEFECTO']);
      const tipoDefecto = tipoDefectoRaw ? validarEnum(TipoDefectoRiel, tipoDefectoRaw) : undefined;
      if (tipoDefectoRaw && !tipoDefecto) {
        resultado.errores.push({ fila: nFila, columna: 'TIPO_DEFECTO', mensaje: `TIPO_DEFECTO inválido "${tipoDefectoRaw}". Valores permitidos: ${Object.values(TipoDefectoRiel).join(', ')}.` });
        continue;
      }

      const elementoRaw = normalizar(fila['ELEMENTO_AFECTADO']);
      const elementoAfectado = elementoRaw ? validarEnum(ElementoAfectadoRiel, elementoRaw) : undefined;
      if (elementoRaw && !elementoAfectado) {
        resultado.errores.push({ fila: nFila, columna: 'ELEMENTO_AFECTADO', mensaje: `ELEMENTO_AFECTADO inválido "${elementoRaw}". Valores permitidos: ${Object.values(ElementoAfectadoRiel).join(', ')}.` });
        continue;
      }

      const zonaRaw = normalizar(fila['ZONA_AFECTADA']);
      const zonaAfectada = zonaRaw ? validarEnum(ZonaAfectadaRiel, zonaRaw) : undefined;
      if (zonaRaw && !zonaAfectada) {
        resultado.errores.push({ fila: nFila, columna: 'ZONA_AFECTADA', mensaje: `ZONA_AFECTADA inválida "${zonaRaw}". Valores permitidos: ${Object.values(ZonaAfectadaRiel).join(', ')}.` });
        continue;
      }

      const perfilRaw = normalizar(fila['PERFIL']);
      const perfil = perfilRaw ? validarEnum(PerfilFallaRiel, perfilRaw) : undefined;
      if (perfilRaw && !perfil) {
        resultado.errores.push({ fila: nFila, columna: 'PERFIL', mensaje: `PERFIL inválido "${perfilRaw}". Valores permitidos: ${Object.values(PerfilFallaRiel).join(', ')}.` });
        continue;
      }

      const altaBajaRaw = normalizar(fila['ALTA_BAJA']);
      const altaBaja = altaBajaRaw ? validarEnum(AltaBaja, altaBajaRaw) : undefined;
      if (altaBajaRaw && !altaBaja) {
        resultado.errores.push({ fila: nFila, columna: 'ALTA_BAJA', mensaje: `ALTA_BAJA inválido "${altaBajaRaw}". Valores permitidos: ${Object.values(AltaBaja).join(', ')}.` });
        continue;
      }

      deteccionesVistas.add(claveDeteccion);

      resultado.detecciones.push({
        tipo: 'DETECCION',
        fila: nFila,
        progresiva: progresivaRaw,
        via,
        fecha: fechaRaw,
        carril,
        causa: normalizarTexto(fila['CAUSA']),
        origen: normalizarTexto(fila['ORIGEN']),
        tipoDefecto,
        elementoAfectado,
        zonaAfectada,
        perfil,
        altaBaja,
        progresivaFinal: parsearEntero(fila['PROGRESIVA_FINAL']),
        largo: parsearDecimal(fila['LARGO_MM']),
        ancho: parsearDecimal(fila['ANCHO_MM']),
        profundidad: parsearDecimal(fila['PROFUNDIDAD_MM']),
        numeroFoto: parsearEntero(fila['NUMERO_FOTO']),
        tipoOnda: normalizarTexto(fila['TIPO_ONDA']),
      });
    }

    // ============================================================
    // FILA ACCIÓN
    // ============================================================
    if (tipo === 'ACCION') {
      const accionRaw = normalizar(fila['ACCION']);
      const accion = validarEnum(AccionRiel, accionRaw);
      if (!accion) {
        resultado.errores.push({ fila: nFila, columna: 'ACCION', mensaje: `ACCION inválida "${accionRaw}". Valores permitidos: ${Object.values(AccionRiel).join(', ')}.` });
        continue;
      }

      const conclusionRaw = normalizar(fila['CONCLUSION']);
      const conclusion = validarEnum(EstadoFalla, conclusionRaw);
      if (!conclusion) {
        resultado.errores.push({ fila: nFila, columna: 'CONCLUSION', mensaje: `CONCLUSION inválida "${conclusionRaw}". Valores permitidos: ${Object.values(EstadoFalla).join(', ')}.` });
        continue;
      }

      // Advertencia: la detección debe existir en el mismo archivo
      // (la validamos más adelante en el service, aquí solo parseamos)
      if (!deteccionesVistas.has(claveDeteccion)) {
        resultado.errores.push({
          fila: nFila,
          columna: 'PROGRESIVA/VIA',
          mensaje: `No se encontró una DETECCION previa para progresiva=${progresivaRaw} vía=${via} en este archivo. La acción no puede asociarse.`,
        });
        continue;
      }

      const fechaEjecucion = parsearFecha(fila['FECHA_EJECUCION'], nFila, 'FECHA_EJECUCION') ?? undefined;

      resultado.acciones.push({
        tipo: 'ACCION',
        fila: nFila,
        claveDeteccion,
        accion,
        conclusion,
        pt: normalizarTexto(fila['PT']),
        fechaEjecucion,
        observaciones: normalizarTexto(fila['OBSERVACIONES']),
      });
    }
  }

  return resultado;
}