/**
 * Mergea una config recibida (parcial) con la default.
 * Las propiedades `undefined` en `recibida` NO pisan los defaults.
 */
export function mergeConfig<T extends object>(
  defaultConfig: T,
  recibida?: Partial<T>,
): T {
  if (!recibida) return { ...defaultConfig };

  const cleaned: Partial<T> = {};
  for (const key in recibida) {
    if (recibida[key] !== undefined) {
      cleaned[key] = recibida[key];
    }
  }
  return { ...defaultConfig, ...cleaned };
}