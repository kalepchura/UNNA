/**
 * ============================================================
 * ENUMS COMPARTIDOS DEL SISTEMA
 * ============================================================
 * Estos enums son la fuente única de verdad para los valores
 * permitidos en el sistema. Se usan en:
 *  - Entidades (validación a nivel de BD con CHECK constraints)
 *  - DTOs (validación de requests)
 *  - Lógica de negocio (services)
 *  - Frontend (mismos valores en selects y filtros)
 * 
 * Si necesitas agregar un valor nuevo, se hace AQUÍ y solo aquí.
 * ============================================================
 */

// ------------------------------------------------------------
// GEOGRÁFICOS / FÍSICOS
// ------------------------------------------------------------

/** Tipo de vía dentro de la línea férrea. */
export enum TipoVia {
  PAR = 'PAR',
  IMPAR = 'IMPAR',
  TERCERA = 'TERCERA',
  CERO = 'CERO',
}

/** Lado del riel. Usado en Fallas (carril) y Desgaste (riel). */
export enum LadoRiel {
  IZQUIERDA = 'IZQUIERDA',
  DERECHA = 'DERECHA',
}

/** Perfil técnico del riel. Solo módulo Desgaste. */
export enum PerfilRiel {
  P_100RE = '100RE',
  P_115RE = '115RE',
}

/** Clasificación del carril en curvas. Solo Desgaste. */
export enum CarrilCurva {
  ALTA = 'ALTA',
  BAJA = 'BAJA',
  NA = 'N.A',
}

// ------------------------------------------------------------
// MÓDULO FALLAS
// ------------------------------------------------------------

/** Ubicación física donde se detectó la falla en la soldadura. */
export enum UbicacionFalla {
  ALMA = 'ALMA',
  PATIN = 'PATIN',
  HONGO = 'HONGO',
  RIEL = 'RIEL',
}

/** Estado / acción tomada sobre una falla de soldadura. */
export enum AccionFalla {
  CONSOLIDADO = 'CONSOLIDADO',
  POR_DEFINIR = 'POR_DEFINIR',
  SUSTITUIDO = 'SUSTITUIDO',
}

// ------------------------------------------------------------
// CATÁLOGO CAMBIAVÍAS (usado por Fallas)
// ------------------------------------------------------------

/** Geometría del cambiavía. */
export enum TipoCambiavia {
  T_0_12 = '0:12',
  T_1_7 = '1:7',
  T_1_8 = '1:8',
  T_1_10 = '1:10',
}

/** Norma técnica de fabricación del cambiavía. */
export enum NormaCambiavia {
  AREMA = 'AREMA',
  AREMA_ASCE_75 = 'AREMA_ASCE_75',
  UIC = 'UIC',
  UNIFER_36 = 'UNIFER_36',
  UNIFER_50 = 'UNIFER_50',
}

/** Tipo de aguja del cambiavía. */
export enum TipoAguja {
  NA = 'N.A',
  CURVA = 'CURVA',
  RECTA = 'RECTA',
}

/** Sentido de derivación del cambiavía. */
export enum Derivacion {
  IZQUIERDA = 'IZQUIERDA',
  DERECHA = 'DERECHA',
}

// ------------------------------------------------------------
// MÓDULO TEMPERATURA
// ------------------------------------------------------------

/** Formato del archivo importado de temperatura. */
export enum TipoArchivoTemperatura {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  XML = 'XML',
}

// ------------------------------------------------------------
// AUTENTICACIÓN / TRANSVERSAL
// ------------------------------------------------------------

/** Rol del usuario. Define qué páginas puede ver. */
export enum RolUsuario {
  USUARIO = 'USUARIO',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

// ------------------------------------------------------------
// MAPA DE CALOR (transversal)
// ------------------------------------------------------------

/** Nivel de alerta visualizado en el mapa de calor. */
export enum NivelAlertaColor {
  VERDE = 'VERDE',
  AMARILLO = 'AMARILLO',
  ROJO = 'ROJO',
  GRIS = 'GRIS',
}

// ------------------------------------------------------------
// AUDITORÍA
// ------------------------------------------------------------

/** Módulo del sistema donde ocurrió la operación auditada. */
export enum ModuloAuditoria {
  FALLAS = 'FALLAS',
  TEMPERATURA = 'TEMPERATURA',
  DESGASTE = 'DESGASTE',
  USUARIOS = 'USUARIOS',
}

/** Tipo de operación registrada en auditoría. */
export enum OperacionAuditoria {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
  IMPORT = 'IMPORT',
  BULK_LOAD = 'BULK_LOAD',
}

// ------------------------------------------------------------
// ANÁLISIS / GRÁFICOS
// ------------------------------------------------------------

/** Granularidad temporal de gráficos. */
export enum GranularidadTemporal {
  MENSUAL = 'MENSUAL',
  ANUAL = 'ANUAL',
}

/**
 * Filtro de tipo de falla en gráficos.
 * AMBAS incluye Riel + Soldadura.
 */
export enum TipoFallaFiltro {
  RIEL = 'RIEL',
  SOLDADURA = 'SOLDADURA',
  AMBAS = 'AMBAS',
}

/**
 * Filtro de tipo de vía en gráficos.
 * Es un sub-conjunto de TipoVia (solo PAR/IMPAR) + AMBAS.
 */
export enum TipoViaFiltro {
  PAR = 'PAR',
  IMPAR = 'IMPAR',
  AMBAS = 'AMBAS',
}

export enum CategoriaG2 {
  ACCION = 'ACCION',           // solo soldadura
  CARRIL = 'CARRIL',           // solo riel
  UBICACION_FALLA = 'UBICACION_FALLA', // solo soldadura
  VIA = 'VIA',                 // ambas
}

/**
 * Granularidad temporal específica del módulo Temperatura.
 * Tiene 3 valores (Fallas solo tiene 2: MENSUAL/ANUAL).
 */
export enum GranularidadTempG1 {
  DIARIA = 'DIARIA',
  MENSUAL = 'MENSUAL',
  ANUAL = 'ANUAL',
}

/**
 * Tipo de agregación para temperatura.
 * Aplica a los gráficos G1, G2 y G3 del módulo Temperatura.
 */
export enum TipoValorTemperatura {
  MIN = 'MIN',
  AVG = 'AVG',
  MAX = 'MAX',
}

// ------------------------------------------------------------
// MÓDULO DESGASTE
// ------------------------------------------------------------

/**
 * Punto de medición de desgaste.
 * Se usa como filtro multi-select en gráficos G1 y G3 del módulo Desgaste.
 */
export enum PuntoW {
  W1 = 'W1',
  W2 = 'W2',
  W3R = 'W3R',
  W3L = 'W3L',
}

/**
 * Tipo de agrupación espacial para el wizard de filtros (G1 y G3).
 * Define el primer nivel del filtro cascada.
 */
export enum TipoAgrupacionDesgaste {
  TRAMO = 'TRAMO',
  CURVA_HORIZONTAL = 'CURVA_HORIZONTAL',
  CURVA_VERTICAL = 'CURVA_VERTICAL',
}


/**
 * Tipo de archivo adjunto a una falla de riel.
 *  - INTERNO: informe interno (técnico)
 *  - EXTERNO: informe externo (cliente/consultor)
 *
 * Cada falla puede tener máximo 1 de cada tipo.
 */
export enum TipoArchivoFalla {
  INTERNO = 'interno',
  EXTERNO = 'externo',
}