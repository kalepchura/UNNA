import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from 'react';

import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authApi } from '@/lib/api/auth.api';
import type { UsuarioAutenticado } from '@/lib/types/common';
import { RolUsuario } from '@/lib/types/common';
import { AxiosError } from 'axios';

interface AuthContextValue {
  session: Session | null;
  user: UsuarioAutenticado | null;
  loading: boolean;
  esAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refrescarUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================
// Helper: determina si un error de axios es un 401 definitivo
// (cuenta deshabilitada, usuario no existe) vs un 401
// recuperable (token expirado que ya fue refrescado por http.ts)
// ============================================================
function esSesionTerminada(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false;
  if (error.response?.status !== 401) return false;

  const msg: string =
    error.response?.data?.message ??
    error.response?.data?.detail ??
    '';

  // Si el interceptor de http.ts ya hizo logout+redirect para
  // estos mensajes, este catch nunca se ejecuta. Pero lo
  // mantenemos aquí como segunda línea de defensa.
  return (
    msg === 'Cuenta deshabilitada' ||
    msg === 'Usuario no registrado en el sistema' ||
    msg === 'Token inválido o expirado'
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UsuarioAutenticado | null>(null);

  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);

  // Evita doble llamada a /auth/me
  const userLoaded = useRef(false);
  // Evita que onAuthStateChange cargue el usuario cuando login() ya lo hizo
  const loginInProgress = useRef(false);

  // ============================================================
  // 1. Inicializar sesión + escuchar cambios de auth
  // ============================================================
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoadingSession(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (!newSession) {
        // Sesión cerrada (logout o signOut forzado por http.ts)
        setUser(null);
        userLoaded.current = false;
        loginInProgress.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ============================================================
  // 2. Cargar usuario del backend cuando hay sesión activa
  //
  // BUG PREVENIDO: Si /auth/me devuelve 401 por cuenta
  // deshabilitada, el interceptor de http.ts ya hará
  // signOut() + redirect. Pero si no lo hiciera (ej: error
  // de red que coincide con 401), aquí atrapamos y limpiamos
  // el estado sin volver a llamar → NO hay loop.
  // ============================================================
  useEffect(() => {
    if (!session) return;
    if (userLoaded.current) return;
    if (loginInProgress.current) return;

    const loadUser = async () => {
      setLoadingUser(true);
      try {
        const u = await authApi.obtenerUsuarioActual();
        setUser(u);
        userLoaded.current = true;
      } catch (err) {
        console.error('Error cargando usuario:', err);
        setUser(null);

        // Si es un 401 definitivo, forzar logout local
        // (el interceptor ya debería haber redirigido, pero
        //  por si acaso lo manejamos aquí también)
        if (esSesionTerminada(err)) {
          await supabase.auth.signOut();
          // No hacer navigate aquí — el interceptor ya usa
          // window.location.replace('/login')
        }

        // En cualquier otro caso (ej: backend caído) simplemente
        // dejamos user = null y loading = false. NO relanzamos
        // el efecto → sin loop.
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();

    // IMPORTANTE: solo depende de `session`. Si session no cambia,
    // este efecto NO se vuelve a ejecutar → sin loop.
  }, [session]);

  // ============================================================
  // Login
  // ============================================================
  const login = useCallback(async (email: string, password: string) => {
    loginInProgress.current = true;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      loginInProgress.current = false;
      throw new Error(error.message);
    }

    if (data.session) {
      setLoadingUser(true);
      try {
        const u = await authApi.obtenerUsuarioActual();
        setUser(u);
        userLoaded.current = true;
      } catch (err) {
        // BUG PREVENIDO: Si el usuario está desactivado y
        // Supabase lo deja loguear igual, atrapamos aquí
        // y hacemos logout limpio en vez de quedar en estado roto.
        setUser(null);
        loginInProgress.current = false;
        await supabase.auth.signOut();
        throw new Error(
          esSesionTerminada(err)
            ? 'Tu cuenta está deshabilitada. Contacta al administrador.'
            : 'No se pudo cargar tu perfil. Intenta de nuevo.',
        );
      } finally {
        setLoadingUser(false);
        loginInProgress.current = false;
      }
    } else {
      loginInProgress.current = false;
    }
  }, []);

  // ============================================================
  // Logout
  // ============================================================
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    userLoaded.current = false;
    loginInProgress.current = false;
  }, []);

  // ============================================================
  // Refresh manual del perfil
  // ============================================================
  const refrescarUsuario = useCallback(async () => {
    if (!session) return;

    setLoadingUser(true);
    try {
      const u = await authApi.obtenerUsuarioActual();
      setUser(u);
    } catch (err) {
      // Si falló por cuenta deshabilitada, el interceptor
      // ya hizo logout. Aquí solo limpiamos estado local.
      if (esSesionTerminada(err)) {
        setUser(null);
      }
    } finally {
      setLoadingUser(false);
    }
  }, [session]);

  const esAdmin = user?.rol === RolUsuario.ADMINISTRADOR;
  const loading = loadingSession || loadingUser;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        esAdmin,
        login,
        logout,
        refrescarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}