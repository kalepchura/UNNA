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
 * ============================================================
 */

// ============================================================
// CAMPOS DE LA FALLA
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
 * - ACCION: solo soldadura (CONSOLIDADO / POR_DEFINIR / SUSTITUIDO)
 * - CARRIL: solo riel (IZQUIERDA / DERECHA)
 * - UBICACION_FALLA: solo soldadura (ALMA / PATIN / HONGO / RIEL)
 * - VIA: ambas (PAR / IMPAR)
 *
 * IMPORTANTE: el backend tiene una whitelist con estos exactos
 * valores. No agregar opciones aquí sin agregarlas también allá.
 */
export enum CategoriaG2 {
  ACCION = 'ACCION',
  CARRIL = 'CARRIL',
  UBICACION_FALLA = 'UBICACION_FALLA',
  VIA = 'VIA',
}