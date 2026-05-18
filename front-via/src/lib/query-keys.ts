/**
 * ============================================================
 * QUERY KEYS centralizadas
 * ============================================================
 * Convenciones:
 *  - Primer elemento = nombre del módulo (para invalidar todo el módulo)
 *  - Segundo elemento = tipo de query (list, detail, kpis, grafico1, etc.)
 *  - Tercer elemento (opcional) = parámetros (id o filtros)
 *
 * Beneficios:
 *  - Sin typos
 *  - Refactor fácil
 *  - Invalidación clara: invalidate('fallas') refresca TODAS las queries
 *    que empiezan con 'fallas'
 * ============================================================
 */

export const queryKeys = {
  // ----- Auth / Usuarios -----
  authMe: () => ['auth', 'me'] as const,

  usuarios: {
    all: ['usuarios'] as const,
    list: (filtros: unknown) => ['usuarios', 'list', filtros] as const,
    detail: (id: string) => ['usuarios', 'detail', id] as const,
  },

  // ----- Auditoría -----
  auditoria: {
    all: ['auditoria'] as const,
    log: (filtros: unknown) => ['auditoria', 'log', filtros] as const,
    eliminadosResumen: () => ['auditoria', 'eliminados', 'resumen'] as const,
    eliminadosPorEntidad: (codigo: string) => ['auditoria', 'eliminados', codigo] as const,
  },

  // ----- Catálogos -----
  catalogos: {
    all: ['catalogos'] as const,
    tramos: ['catalogos', 'tramos'] as const,
    tramosTabla: ['catalogos', 'tramos', 'tabla'] as const,  // ← NUEVO
    tramosSelector: ['catalogos', 'tramos', 'selector'] as const,  // ← NUEVO
    estaciones: ['catalogos', 'estaciones'] as const,
    estacionesTabla: ['catalogos', 'estaciones', 'tabla'] as const,
    estacionesSelector: ['catalogos', 'estaciones', 'selector'] as const,
    curvasHorizontales: ['catalogos', 'curvas-horizontales'] as const,
    curvasHorizontalesTabla: ['catalogos', 'curvas-horizontales', 'tabla'] as const,
    curvasHorizontalesSelector: ['catalogos', 'curvas-horizontales', 'selector'] as const,
    curvasVerticales: ['catalogos', 'curvas-verticales'] as const,
    curvasVerticalesTabla: ['catalogos', 'curvas-verticales', 'tabla'] as const,
    curvasVerticalesSelector: ['catalogos', 'curvas-verticales', 'selector'] as const,
    velocidades: ['catalogos', 'velocidades'] as const,
    velocidadesTabla: ['catalogos', 'velocidades', 'tabla'] as const,
    cambiavias: ['catalogos', 'cambiavias'] as const,
    cambiaviasTabla: ['catalogos', 'cambiavias', 'tabla'] as const,      // ← NUEVO
    cambiaviasSelector: ['catalogos', 'cambiavias', 'selector'] as const,
    elementosDesgaste: ['catalogos', 'elementos-desgaste'] as const,
    elementosDesgasteTabla: ['catalogos', 'elementos-desgaste', 'tabla'] as const,
    elementosDesgasteSelector: ['catalogos', 'elementos-desgaste', 'selector'] as const,
  },

  // ----- Fallas -----
  fallas: {
    all: ['fallas'] as const,
    rielList: (filtros: unknown) => ['fallas', 'riel', 'list', filtros] as const,
    rielDetail: (id: number) => ['fallas', 'riel', 'detail', id] as const,
    soldaduraList: (filtros: unknown) => ['fallas', 'soldadura', 'list', filtros] as const,
    soldaduraDetail: (id: number) => ['fallas', 'soldadura', 'detail', id] as const,
    kpis: () => ['fallas', 'kpis'] as const,
    grafico1: (config: unknown) => ['fallas', 'grafico1', config] as const,
    grafico2: (config: unknown) => ['fallas', 'grafico2', config] as const,
    grafico3: (config: unknown) => ['fallas', 'grafico3', config] as const,
  },

  // ----- Temperatura -----
  temperatura: {
    all: ['temperatura'] as const,
    importacionesList: (filtros: unknown) => ['temperatura', 'importaciones', 'list', filtros] as const,
    importacionDetail: (id: number) => ['temperatura', 'importaciones', 'detail', id] as const,
    importacionFilas: (id: number, filtros: unknown) =>
      ['temperatura', 'importaciones', 'filas', id, filtros] as const,
    kpis: () => ['temperatura', 'kpis'] as const,
    grafico1: (config: unknown) => ['temperatura', 'grafico1', config] as const,
    grafico2: (config: unknown) => ['temperatura', 'grafico2', config] as const,
    grafico3: (config: unknown) => ['temperatura', 'grafico3', config] as const,
  },

  // ----- Desgaste -----
  desgaste: {
    all: ['desgaste'] as const,
    grilla: (filtros: unknown) => ['desgaste', 'grilla', filtros] as const,
    escenariosList: (filtros: unknown) => ['desgaste', 'escenarios', 'list', filtros] as const,
    escenarioDetail: (id: number) => ['desgaste', 'escenarios', 'detail', id] as const,
    valoresMtb: (escenarioId: number) => ['desgaste', 'valores-mtb', escenarioId] as const,
    kpis: () => ['desgaste', 'kpis'] as const,
    wizardFiltros: (request: unknown) => ['desgaste', 'wizard-filtros', request] as const,
    grafico1ConfigDefault: () => ['desgaste', 'grafico1-config-default'] as const,
    grafico1: (config: unknown) => ['desgaste', 'grafico1', config] as const,
    grafico2: (config: unknown) => ['desgaste', 'grafico2', config] as const,
    grafico3ConfigDefault: () => ['desgaste', 'grafico3-config-default'] as const,
    grafico3: (config: unknown) => ['desgaste', 'grafico3', config] as const,
  },

  // ----- Mapa de Calor -----
  mapaCalor: {
    all: ['mapa-calor'] as const,
    esquemaBase: () => ['mapa-calor', 'esquema-base'] as const,
    temperatura: (filtros: unknown) => ['mapa-calor', 'temperatura', filtros] as const,
    desgasteGeneral: (filtros: unknown) => ['mapa-calor', 'desgaste-general', filtros] as const,
    desgasteIndice: (filtros: unknown) => ['mapa-calor', 'desgaste-indice', filtros] as const,
    fallas: (filtros: unknown) => ['mapa-calor', 'fallas', filtros] as const,
  },
    
};