/**
 * Nombres de buckets en Supabase Storage.
 * Centralizar aquí evita typos por todo el código.
 */
export const STORAGE_BUCKETS = {
  // Fallas
  FALLAS_RIEL_INTERNO: 'fallas-riel-interno',
  FALLAS_RIEL_EXTERNO: 'fallas-riel-externo',
  FALLAS_SOLDADURA_INOX: 'fallas-soldadura-inox',
  // Temperatura
  TEMPERATURA_IMPORTACIONES: 'temperatura-importaciones',
} as const;