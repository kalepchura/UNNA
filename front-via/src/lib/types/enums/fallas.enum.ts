/**
 * ============================================================
 * ENUMS DEL MÓDULO FALLAS
 * ============================================================
 * Todos los enums específicos del módulo de fallas (riel y
 * soldadura inox), incluyendo gráficos y archivos adjuntos.
 *
 * Espejo exacto del backend en:
 *   src/common/enums/index.ts (secciones "MÓDULO FALLAS" y
 *   "ANÁLISIS / GRÁFICOS")
 *
 * ESTRUCTURA:
 *  1. Enums (contrato técnico — valores que viajan al backend)
 *  2. LABEL_* (diccionarios para mostrar en UI — textos legibles)
 *
 * Los enums NO llevan prefijo en sus keys. Los textos legibles
 * van separados en los LABEL_*.
 * ============================================================
 */

// ============================================================
// CAMPOS DE LA FALLA (SOLDADURA INOX)
// ============================================================

/**
 * Ubicación física donde se detectó la falla en la soldadura.
 * Solo aplica a FallaSoldaduraInox.
 *
 * - ALMA: parte central vertical del riel
 * - PATIN: base del riel
 * - HONGO: parte superior donde rueda la rueda del tren
 * - RIEL: cuerpo general del riel
 */
export enum UbicacionFalla {
  ALMA = 'ALMA',
  PATIN = 'PATIN',
  HONGO = 'HONGO',
  RIEL = 'RIEL',
}

/**
 * Estado / acción tomada sobre una falla de soldadura.
 * Solo aplica a FallaSoldaduraInox.
 *
 * - CONSOLIDADO: la falla fue consolidada (revisada y aceptada
 *   sin necesidad de sustituir)
 * - POR_DEFINIR: aún no se decidió qué hacer (es el KPI 3:
 *   "soldaduras sin acción")
 * - SUSTITUIDO: la pieza fue reemplazada físicamente
 */
export enum AccionFalla {
  CONSOLIDADO = 'CONSOLIDADO',
  POR_DEFINIR = 'POR_DEFINIR',
  SUSTITUIDO = 'SUSTITUIDO',
}

// ============================================================
// CAMPOS DE LA FALLA RIEL (FASE 2)
// ============================================================
// Estos enums son específicos del módulo FallaRiel. NO se reusan
// en soldadura (que tiene UbicacionFalla y AccionFalla propios).
//
// Casi todos incluyen SIN_DEFINIR como valor por defecto,
// permitiendo que el inspector registre una falla con datos
// parciales y complete los campos más tarde.

/**
 * Tipo de defecto físico detectado en el riel.
 * SIN_DEFINIR cuando el inspector aún no clasificó.
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
 * Elemento físico afectado (en vía corrida).
 * NO confundir con FallaSoldaduraInox (que es para cambiavías).
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
 * Perfil técnico del riel.
 *
 * ⚠️ Independiente del PerfilRiel de Desgaste (que solo tiene 100RE/115RE).
 * En Fallas hay más perfiles posibles, por eso se llama PerfilFallaRiel.
 *
 * Los valores conservan el formato original ('115RE', 'UIC 1:10')
 * porque así viene en los reportes y documentación de campo.
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
 * NO_APLICA es el default (tangentes).
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
 * - CANCELADO: se decidió no atender (falsa alarma, etc.)
 * - FALTA_VERIFICAR: ejecutada pero pendiente de inspección final
 *
 * Este enum aplica tanto a:
 *  - FallaRiel.estadoActual (estado desnormalizado de la última acción)
 *  - FallaRielAccion.conclusion (estado de cada intervención)
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
 * Tipo de intervención de mantenimiento sobre falla riel.
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

// ============================================================
// ARCHIVOS ADJUNTOS
// ============================================================

/**
 * Tipo de archivo adjunto a una falla de riel.
 * Solo aplica a FallaRiel (soldadura usa imágenes múltiples,
 * no archivos tipificados).
 *
 * - INTERNO: informe técnico interno de la empresa
 * - EXTERNO: informe del cliente o consultor externo
 *
 * Cada falla puede tener máximo 1 archivo de cada tipo.
 *
 * NOTA: los valores son minúsculas ('interno', 'externo')
 * porque viajan en la URL: /fallas/riel/:id/archivo/:tipo
 */
export enum TipoArchivoFalla {
  INTERNO = 'interno',
  EXTERNO = 'externo',
}

// ============================================================
// FILTROS DE GRÁFICOS
// ============================================================

/**
 * Filtro de tipo de falla en gráficos.
 * Permite ver solo riel, solo soldadura, o ambas combinadas.
 */
export enum TipoFallaFiltro {
  RIEL = 'RIEL',
  SOLDADURA = 'SOLDADURA',
  AMBAS = 'AMBAS',
}

/**
 * Granularidad temporal del Gráfico 1 (evolución temporal).
 * Define cómo se agrupan los datos en el eje X.
 */
export enum GranularidadTemporal {
  MENSUAL = 'MENSUAL',
  ANUAL = 'ANUAL',
}

/**
 * Categoría dinámica del Gráfico 2 (distribución por categoría).
 *
 * Cada valor representa por qué campo agrupar las barras del gráfico.
 *
 * Originales:
 *  - ACCION: solo soldadura (CONSOLIDADO / POR_DEFINIR / SUSTITUIDO)
 *  - CARRIL: solo riel (IZQUIERDA / DERECHA)
 *  - UBICACION_FALLA: solo soldadura (ALMA / PATIN / HONGO / RIEL)
 *  - VIA: ambas (PAR / IMPAR)
 *
 * FASE 2.D — Nuevas dimensiones (todas solo riel):
 *  - TIPO_DEFECTO
 *  - ELEMENTO_AFECTADO
 *  - ZONA_AFECTADA
 *  - PERFIL
 *  - ALTA_BAJA
 *  - ESTADO_ACTUAL
 *  - ACCION_ACTUAL_RIEL (acción desnormalizada en la falla;
 *    NO confundir con ACCION que es de soldadura)
 *
 * IMPORTANTE: el backend tiene una whitelist con estos exactos
 * valores. No agregar opciones aquí sin agregarlas también allá.
 */
export enum CategoriaG2 {
  // ---------- originales ----------
  ACCION = 'ACCION',
  CARRIL = 'CARRIL',
  UBICACION_FALLA = 'UBICACION_FALLA',
  VIA = 'VIA',

  // ---------- FASE 2.D (solo riel) ----------
  TIPO_DEFECTO = 'TIPO_DEFECTO',
  ELEMENTO_AFECTADO = 'ELEMENTO_AFECTADO',
  ZONA_AFECTADA = 'ZONA_AFECTADA',
  PERFIL = 'PERFIL',
  ALTA_BAJA = 'ALTA_BAJA',
  ESTADO_ACTUAL = 'ESTADO_ACTUAL',
  ACCION_ACTUAL_RIEL = 'ACCION_ACTUAL_RIEL',
}

// ============================================================
// LABELS PARA UI (Fase 2)
// ============================================================
// Estos diccionarios convierten los valores técnicos del enum
// en textos legibles para mostrar en selects, tablas y gráficos.
// Centralizar aquí evita repetir el mapeo en cada componente.
// ============================================================

export const LABEL_TIPO_DEFECTO: Record<TipoDefectoRiel, string> = {
  [TipoDefectoRiel.SIN_DEFINIR]: 'Sin definir',
  [TipoDefectoRiel.ASTILLAMIENTO_RCF]: 'Astillamiento RCF',
  [TipoDefectoRiel.SQUAT]: 'Squat',
  [TipoDefectoRiel.REBORDE]: 'Reborde',
  [TipoDefectoRiel.ONDULACION]: 'Ondulación',
  [TipoDefectoRiel.FISURA]: 'Fisura',
  [TipoDefectoRiel.DESGASTE_LATERAL]: 'Desgaste lateral',
  [TipoDefectoRiel.CORRUGACION]: 'Corrugación',
  [TipoDefectoRiel.OTRO]: 'Otro',
};

export const LABEL_ELEMENTO_AFECTADO: Record<ElementoAfectadoRiel, string> = {
  [ElementoAfectadoRiel.SIN_DEFINIR]: 'Sin definir',
  [ElementoAfectadoRiel.BARRA]: 'Barra',
  [ElementoAfectadoRiel.SOLDADURA_ELECTROFUSION]: 'Soldadura electrofusión',
  [ElementoAfectadoRiel.SOLDADURA_ALUMINOTERMICA]: 'Soldadura aluminotérmica',
  [ElementoAfectadoRiel.JUNTA]: 'Junta',
};

export const LABEL_ZONA_AFECTADA: Record<ZonaAfectadaRiel, string> = {
  [ZonaAfectadaRiel.SIN_DEFINIR]: 'Sin definir',
  [ZonaAfectadaRiel.BANDA_RODADURA]: 'Banda de rodadura',
  [ZonaAfectadaRiel.CARA_ACTIVA]: 'Cara activa',
  [ZonaAfectadaRiel.CARA_PASIVA]: 'Cara pasiva',
  [ZonaAfectadaRiel.HONGO]: 'Hongo',
  [ZonaAfectadaRiel.ALMA]: 'Alma',
  [ZonaAfectadaRiel.PATIN]: 'Patín',
};

export const LABEL_PERFIL_FALLA: Record<PerfilFallaRiel, string> = {
  [PerfilFallaRiel.SIN_DEFINIR]: 'Sin definir',
  [PerfilFallaRiel.P_115RE]: '115RE',
  [PerfilFallaRiel.P_100RE]: '100RE',
  [PerfilFallaRiel.P_ASCE75]: 'ASCE75',
  [PerfilFallaRiel.P_50UNI]: '50UNI',
  [PerfilFallaRiel.P_36UNI]: '36UNI',
  [PerfilFallaRiel.P_UIC_1_10]: 'UIC 1:10',
};

export const LABEL_ALTA_BAJA: Record<AltaBaja, string> = {
  [AltaBaja.NO_APLICA]: 'No aplica',
  [AltaBaja.ALTA]: 'Alta',
  [AltaBaja.BAJA]: 'Baja',
};

export const LABEL_ESTADO_FALLA: Record<EstadoFalla, string> = {
  [EstadoFalla.NO_ATENDIDO]: 'No atendido',
  [EstadoFalla.PROGRAMADO]: 'Programado',
  [EstadoFalla.EN_EJECUCION]: 'En ejecución',
  [EstadoFalla.RESUELTO]: 'Resuelto',
  [EstadoFalla.CANCELADO]: 'Cancelado',
  [EstadoFalla.FALTA_VERIFICAR]: 'Falta verificar',
};

export const LABEL_ACCION_RIEL: Record<AccionRiel, string> = {
  [AccionRiel.ESMERILADO]: 'Esmerilado',
  [AccionRiel.ESMERILADO_PREVENTIVO]: 'Esmerilado preventivo',
  [AccionRiel.REEMPLAZO]: 'Reemplazo',
  [AccionRiel.RECARGA_RIEL]: 'Recarga de riel',
  [AccionRiel.MONITOREO]: 'Monitoreo',
  [AccionRiel.OTRO]: 'Otro',
};

export const LABEL_CATEGORIA_G2: Record<CategoriaG2, string> = {
  [CategoriaG2.ACCION]: 'Acción (soldadura)',
  [CategoriaG2.CARRIL]: 'Carril',
  [CategoriaG2.UBICACION_FALLA]: 'Ubicación (soldadura)',
  [CategoriaG2.VIA]: 'Vía',
  [CategoriaG2.TIPO_DEFECTO]: 'Tipo de defecto',
  [CategoriaG2.ELEMENTO_AFECTADO]: 'Elemento afectado',
  [CategoriaG2.ZONA_AFECTADA]: 'Zona afectada',
  [CategoriaG2.PERFIL]: 'Perfil',
  [CategoriaG2.ALTA_BAJA]: 'Alta/Baja',
  [CategoriaG2.ESTADO_ACTUAL]: 'Estado actual',
  [CategoriaG2.ACCION_ACTUAL_RIEL]: 'Acción (riel)',
};