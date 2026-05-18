/**
 * ============================================================
 * ENUMS GEOGRÁFICOS / FÍSICOS
 * ============================================================
 * Conceptos físicos de la línea férrea.
 * Espejo exacto de los enums del backend en:
 *   src/common/enums/index.ts (sección "GEOGRÁFICOS / FÍSICOS")
 * ============================================================
 */

/**
 * Tipo de vía dentro de la línea férrea.
 *
 * - PAR: vía en sentido par (típicamente sentido descendente)
 * - IMPAR: vía en sentido impar (típicamente sentido ascendente)
 * - TERCERA: vía auxiliar
 * - CERO: vía cero (vía de servicio)
 */
export enum TipoVia {
  PAR = 'PAR',
  IMPAR = 'IMPAR',
  TERCERA = 'TERCERA',
  CERO = 'CERO',
}

/**
 * Filtro de vía usado en gráficos.
 * Subconjunto de TipoVia + opción AMBAS para no filtrar.
 *
 * NOTA: Es un enum aparte porque los gráficos no admiten
 * TERCERA ni CERO; solo PAR, IMPAR y AMBAS.
 */
export enum TipoViaFiltro {
  PAR = 'PAR',
  IMPAR = 'IMPAR',
  AMBAS = 'AMBAS',
}

/**
 * Lado del riel.
 * Usado en Fallas (campo "carril") y en Desgaste (campo "riel").
 */
export enum LadoRiel {
  IZQUIERDA = 'IZQUIERDA',
  DERECHA = 'DERECHA',
}

/**
 * Perfil técnico del riel. Solo usado en módulo Desgaste.
 *
 * NOTA: Los nombres P_100RE y P_115RE replican el backend
 * (no se pueden empezar con número en TypeScript, por eso el "P_").
 */
export enum PerfilRiel {
  P_100RE = '100RE',
  P_115RE = '115RE',
}

/**
 * Clasificación del carril en curvas. Solo módulo Desgaste.
 * - ALTA: carril exterior de la curva (sufre más desgaste)
 * - BAJA: carril interior
 * - NA: no aplica (tramo en tangente, sin curva)
 */
export enum CarrilCurva {
  ALTA = 'ALTA',
  BAJA = 'BAJA',
  NA = 'N.A',
}