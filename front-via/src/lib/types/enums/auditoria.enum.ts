/**
 * ============================================================
 * ENUMS DE AUDITORÍA Y ALERTAS TRANSVERSALES
 * ============================================================
 * Sistema de auditoría: qué módulo, qué operación.
 * Colores de alerta: usados en KPIs y mapa de calor.
 *
 * Espejo exacto del backend en:
 *   src/common/enums/index.ts (secciones "AUDITORÍA" y "MAPA DE CALOR")
 * ============================================================
 */

/**
 * Módulo del sistema donde ocurrió la operación auditada.
 * Usado al filtrar el log de auditoría.
 */
export enum ModuloAuditoria {
  FALLAS = 'FALLAS',
  TEMPERATURA = 'TEMPERATURA',
  DESGASTE = 'DESGASTE',
  USUARIOS = 'USUARIOS',
}

/**
 * Tipo de operación registrada en auditoría.
 *
 * - CREATE: se creó un registro
 * - UPDATE: se modificó un registro existente
 * - DELETE: soft delete (registro marcado como eliminado)
 * - RESTORE: se restauró un registro eliminado (solo admin)
 * - IMPORT: importación de datos masiva (típicamente Temperatura)
 * - BULK_LOAD: carga masiva manual
 */
export enum OperacionAuditoria {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
  IMPORT = 'IMPORT',
  BULK_LOAD = 'BULK_LOAD',
}

/**
 * Nivel de alerta visualizado en KPIs, mapa de calor y badges.
 *
 * - VERDE: situación normal
 * - AMARILLO: requiere atención
 * - ROJO: crítico, acción inmediata
 * - GRIS: sin datos suficientes / no aplica
 */
export enum NivelAlertaColor {
  VERDE = 'VERDE',
  AMARILLO = 'AMARILLO',
  ROJO = 'ROJO',
  GRIS = 'GRIS',
}