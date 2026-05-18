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

// ✅ Claves de localStorage para configuraciones de gráficos
const STORAGE_KEYS = {
  GRAFICO1: 'fallas_grafico1_config',
  GRAFICO2: 'fallas_grafico2_config',
  GRAFICO3: 'fallas_grafico3_config',
};

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UsuarioAutenticado | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);
  const usuarioCargado = useRef(false);

  // 1. Verificar sesión al iniciar + escuchar cambios
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoadingSession(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          setUser(null);
          usuarioCargado.current = false;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 2. Cargar usuario del backend cuando hay sesión (para restauración automática)
  useEffect(() => {
    if (!session) return;
    if (usuarioCargado.current) return;

    const loadUser = async () => {
      setLoadingUser(true);
      try {
        const u = await authApi.obtenerUsuarioActual(session.access_token);
        setUser(u);
        usuarioCargado.current = true;
      } catch (err) {
        console.error('Error cargando usuario:', err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [session]);

  // 3. Login — espera a que session Y usuario estén listos antes de resolver
  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    if (data.session) {
      setLoadingUser(true);
      try {
        const u = await authApi.obtenerUsuarioActual(data.session.access_token);
        setUser(u);
        usuarioCargado.current = true;
      } catch (err) {
        console.error('Error cargando usuario tras login:', err);
      } finally {
        setLoadingUser(false);
      }
    }
  }, []);

  // 4. Logout - ✅ Limpiar localStorage de configuraciones de gráficos
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    usuarioCargado.current = false;
    
    // Limpiar configuraciones de los gráficos (sessionStorage)
    sessionStorage.removeItem(STORAGE_KEYS.GRAFICO1);
    sessionStorage.removeItem(STORAGE_KEYS.GRAFICO2);
    sessionStorage.removeItem(STORAGE_KEYS.GRAFICO3);
  }, []);

  // 5. Refrescar usuario manualmente
  const refrescarUsuario = useCallback(async () => {
    if (!session) return;
    setLoadingUser(true);
    try {
      const u = await authApi.obtenerUsuarioActual(session.access_token);
      setUser(u);
    } catch (err) {
      console.error('Error refrescando usuario:', err);
    } finally {
      setLoadingUser(false);
    }
  }, [session]);

  const esAdmin = user?.rol === RolUsuario.ADMINISTRADOR;
  const loading = loadingSession || loadingUser;

  return (
    <AuthContext.Provider
      value={{ session, user, loading, esAdmin, login, logout, refrescarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}