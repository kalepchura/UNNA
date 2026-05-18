/**
 * Tipos del dominio "Imagen asociada a Falla Soldadura".
 * Las imágenes se eliminan FÍSICAMENTE (no hay soft delete).
 */

// ============================================================
// RESPONSE — Imagen que devuelve el backend
// ============================================================

export interface ImagenFalla {
  id: number;
  fallaId: number;
  nombreArchivo: string;
  /** Path dentro del bucket de Supabase Storage (no URL pública). */
  rutaStorage: string;
  creadoEn: string;
}

// ============================================================
// URL FIRMADA — Respuesta del endpoint /imagenes/:id/url
// ============================================================

export interface UrlImagenFalla {
  url: string;
  nombre: string;
}