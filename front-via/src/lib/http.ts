import axios, { AxiosError } from 'axios';
import { supabase } from './supabase';

/**
 * Instancia axios para llamadas al backend NestJS.
 *
 * Interceptor de REQUEST:
 *  - Agrega el JWT de Supabase como Authorization: Bearer <token>
 *
 * Interceptor de RESPONSE:
 *  - Maneja 401 con un sistema de cola para evitar múltiples refreshes simultáneos
 *  - Si el refresh falla, hace logout y emite evento
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Estado global para evitar reintentos paralelos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ----- REQUEST INTERCEPTOR: agregar JWT (MEJORADO) -----
http.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    
    // SOLO agregar token si existe una sesión activa
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Si no hay token, simplemente no agregar el header
    
    return config;
  } catch (err) {
    // Si hay error obteniendo sesión, continuar sin token
    console.warn('Error obteniendo sesión para request:', err);
    return config;
  }
});

// ----- RESPONSE INTERCEPTOR: manejo de 401 con cola -----
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosError['config'] & {
      _retry?: boolean;
    };

    // Evitar loops infinitos
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Solo manejar 401
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Si ya estamos refrescando, encolar esta request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return http(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !data.session) {
        // Refresh falló - hacer logout completo
        processQueue(new Error('Refresh failed'), null);
        await supabase.auth.signOut();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        isRefreshing = false;
        return Promise.reject(error);
      }

      // Refresh exitoso - procesar cola con el nuevo token
      const newToken = data.session.access_token;
      processQueue(null, newToken);
      
      // Reintentar request original
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      isRefreshing = false;
      return http(originalRequest);
    } catch (err) {
      processQueue(err as Error, null);
      isRefreshing = false;
      return Promise.reject(error);
    }
  },
);

/**
 * Helper para extraer mensajes de error del backend de manera consistente.
 */
export function extraerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;

    if (data?.message) {
      if (Array.isArray(data.message)) return data.message.join(', ');
      return data.message;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Error desconocido';
}