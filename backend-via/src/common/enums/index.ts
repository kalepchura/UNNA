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
  // ------- existentes (no tocar) -------
  ACCION = 'ACCION',                       // solo soldadura
  CARRIL = 'CARRIL',                       // solo riel
  UBICACION_FALLA = 'UBICACION_FALLA',     // solo soldadura
  VIA = 'VIA',                             // ambas
 
  // ------- FASE 2.D — nuevas dimensiones (solo riel) -------
  TIPO_DEFECTO = 'TIPO_DEFECTO',
  ELEMENTO_AFECTADO = 'ELEMENTO_AFECTADO',
  ZONA_AFECTADA = 'ZONA_AFECTADA',
  PERFIL = 'PERFIL',
  ALTA_BAJA = 'ALTA_BAJA',
  ESTADO_ACTUAL = 'ESTADO_ACTUAL',
  ACCION_ACTUAL_RIEL = 'ACCION_ACTUAL_RIEL',
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


// ============================================================
// MÓDULO FALLAS — FALLA RIEL (extensión Fase 2)
// ============================================================
// Estos enums son específicos del módulo Fallas Riel.
// NO se reusan en Soldadura (que tiene UbicacionFalla y AccionFalla
// como enums propios). NO se reusan en Desgaste (que tiene PerfilRiel
// como enum propio con solo 100RE y 115RE).
//
// Patrón "Null Object": casi todos los enums incluyen SIN_DEFINIR
// como valor por defecto. Esto evita columnas nullable y permite
// queries y gráficos más limpios (no hay que manejar IS NULL).
// El inspector puede registrar la falla con datos parciales y luego
// completar los campos que faltan.
// ============================================================

/**
 * Tipo de defecto físico detectado en el riel.
 * SIN_DEFINIR es el default cuando el inspector aún no clasificó.
 */
export enum TipoDefectoRiel {
  SIN_DEFINIR = 'SIN_DEFINIR',
  ASTILLAMIENTO_RCF = 'ASTILLAMIENTO_RCF',
  SQUAT = 'SQUAT',
  REBORDE = 'REBORDE',
  ONDULACION = 'ONDULACION',
  FISURA = 'FISURA',
  DESGASTE_LATERAL = 'DESGASTE_LATERAL',
  CORRUGACION = 'CORRUGACION',
  OTRO = 'OTRO',
}

/**
 * Elemento físico donde ocurrió la falla (dentro de vía corrida).
 * NO confundir con FallaSoldaduraInox (que es para soldaduras de cambiavía).
 */
export enum ElementoAfectadoRiel {
  SIN_DEFINIR = 'SIN_DEFINIR',
  BARRA = 'BARRA',
  SOLDADURA_ELECTROFUSION = 'SOLDADURA_ELECTROFUSION',
  SOLDADURA_ALUMINOTERMICA = 'SOLDADURA_ALUMINOTERMICA',
  JUNTA = 'JUNTA',
}

/**
 * Zona del perfil del riel donde se manifiesta el defecto.
 */
export enum ZonaAfectadaRiel {
  SIN_DEFINIR = 'SIN_DEFINIR',
  BANDA_RODADURA = 'BANDA_RODADURA',
  CARA_ACTIVA = 'CARA_ACTIVA',
  CARA_PASIVA = 'CARA_PASIVA',
  HONGO = 'HONGO',
  ALMA = 'ALMA',
  PATIN = 'PATIN',
}

/**
 * Perfil técnico del riel donde se detectó la falla.
 *
 * ⚠️ Independiente de PerfilRiel (Desgaste), que solo tiene 100RE/115RE.
 * Este enum tiene más valores porque las fallas pueden detectarse en
 * tramos con perfiles que no necesariamente son los mismos donde se
 * mide desgaste.
 */
export enum PerfilFallaRiel {
  SIN_DEFINIR = 'SIN_DEFINIR',
  P_115RE = '115RE',
  P_100RE = '100RE',
  P_ASCE75 = 'ASCE75',
  P_50UNI = '50UNI',
  P_36UNI = '36UNI',
  P_UIC_1_10 = 'UIC 1:10',
}

/**
 * Indica si la falla está en el riel ALTO o BAJO de una curva.
 * NO_APLICA es el default y corresponde a tangentes.
 */
export enum AltaBaja {
  NO_APLICA = 'NO_APLICA',
  ALTA = 'ALTA',
  BAJA = 'BAJA',
}

/**
 * Estado del ciclo de vida de la falla.
 *
 * - NO_ATENDIDO: recién creada, sin acción asignada
 * - PROGRAMADO: hay acción programada pero no ejecutada
 * - EN_EJECUCION: acción en proceso
 * - RESUELTO: acción ejecutada y cerrada con éxito
 * - CANCELADO: se decidió no atender (falsa alarma, no aplica, etc.)
 * - FALTA_VERIFICAR: ejecutada pero pendiente de inspección final
 *
 * Este enum aplica tanto a FallaRiel.estadoActual (desnormalizado)
 * como a FallaRielAccion.conclusion (estado de cada intervención).
 */
export enum EstadoFalla {
  NO_ATENDIDO = 'NO_ATENDIDO',
  PROGRAMADO = 'PROGRAMADO',
  EN_EJECUCION = 'EN_EJECUCION',
  RESUELTO = 'RESUELTO',
  CANCELADO = 'CANCELADO',
  FALTA_VERIFICAR = 'FALTA_VERIFICAR',
}

/**
 * Tipo de intervención de mantenimiento sobre una falla de riel.
 * NO confundir con AccionFalla (soldadura inox).
 */
export enum AccionRiel {
  ESMERILADO = 'ESMERILADO',
  ESMERILADO_PREVENTIVO = 'ESMERILADO_PREVENTIVO',
  REEMPLAZO = 'REEMPLAZO',
  RECARGA_RIEL = 'RECARGA_RIEL',
  MONITOREO = 'MONITOREO',
  OTRO = 'OTRO',
}