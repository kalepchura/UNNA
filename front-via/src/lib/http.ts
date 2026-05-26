import axios, { AxiosError } from 'axios';
import { supabase } from './supabase';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;

let queue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (
  error: unknown,
  token: string | null,
) => {
  queue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  queue = [];
};

/**
 * Mensajes del backend que indican que el usuario
 * NO debe reintentar ni refrescar token.
 * En estos casos: logout inmediato + redirect a /login.
 */
const MENSAJES_SIN_REINTENTO = new Set([
  'Cuenta deshabilitada',
  'Usuario no registrado en el sistema',
  'No se envió token de autenticación',
]);

// ============================================================
// REQUEST — adjunta el token de Supabase en cada request
// ============================================================
http.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ============================================================
// RESPONSE — manejo centralizado de errores 401
// ============================================================
http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any;

    // No reintentar si ya se reintentó o no hay config
    if (!original || original._retry) {
      return Promise.reject(error);
    }

    // Solo manejar 401
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // --------------------------------------------------------
    // BUG CRÍTICO PREVENIDO:
    //
    // Si el backend responde con un mensaje que indica que el
    // usuario está deshabilitado o no existe, NO tiene sentido
    // refrescar el token — Supabase lo renovará correctamente
    // pero el guard volverá a rechazarlo, causando un loop
    // infinito de 401.
    //
    // Solución: logout inmediato + redirect.
    // --------------------------------------------------------
    const responseData = error.response?.data as any;
    const backendMsg: string =
      responseData?.message ??
      responseData?.detail ??
      responseData?.error ??
      '';

    if (MENSAJES_SIN_REINTENTO.has(backendMsg)) {
      processQueue(error, null);
      isRefreshing = false;
      await supabase.auth.signOut();
      // Redirigir fuera del contexto de React (interceptor es global)
      window.location.replace('/login');
      return Promise.reject(error);
    }

    // --------------------------------------------------------
    // Refresh normal del token
    // --------------------------------------------------------
    if (isRefreshing) {
      // Encolar mientras otro request ya está refrescando
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return http(original);
        })
        .catch((err) => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError || !data.session) {
        processQueue(refreshError, null);
        isRefreshing = false;
        await supabase.auth.signOut();
        window.location.replace('/login');
        return Promise.reject(refreshError ?? error);
      }

      const newToken = data.session.access_token;

      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      isRefreshing = false;

      return http(original);
    } catch (err) {
      processQueue(err, null);
      isRefreshing = false;
      await supabase.auth.signOut();
      window.location.replace('/login');
      return Promise.reject(err);
    }
  },
);

// ============================================================
// Helper: extrae un mensaje legible desde cualquier error
// ============================================================
export function extraerMensajeError(error: unknown): string {
  if (error instanceof AxiosError) {
    const backendMsg =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data?.error;

    if (backendMsg) {
      return typeof backendMsg === 'string'
        ? backendMsg
        : JSON.stringify(backendMsg);
    }

    if (error.code === 'ERR_NETWORK')
      return 'Sin conexión. Verifica tu internet.';
    if (error.code === 'ECONNABORTED')
      return 'La solicitud tardó demasiado. Intenta de nuevo.';

    return error.message || 'Error de red';
  }

  if (error instanceof Error) return error.message;

  return 'Ocurrió un error inesperado';
}