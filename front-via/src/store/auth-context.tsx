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

  // Ref para evitar doble llamada a /auth/me
  const userLoaded = useRef(false);
  // Ref para saber si el login() ya cargó el usuario (evita que onAuthStateChange lo cargue de nuevo)
  const loginInProgress = useRef(false);

  // 1. Inicializar sesión y escuchar cambios de auth
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
        setUser(null);
        userLoaded.current = false;
        loginInProgress.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Cargar usuario del backend cuando hay sesión nueva
  //    Solo si login() NO lo cargó ya (loginInProgress evita el doble request)
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
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [session]);

  // Login: marca loginInProgress para que el useEffect de arriba no haga doble request
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
      try {
        setLoadingUser(true);
        const u = await authApi.obtenerUsuarioActual();
        setUser(u);
        userLoaded.current = true;
      } finally {
        setLoadingUser(false);
        loginInProgress.current = false;
      }
    } else {
      loginInProgress.current = false;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    userLoaded.current = false;
    loginInProgress.current = false;
  }, []);

  // Refresh manual
  const refrescarUsuario = useCallback(async () => {
    if (!session) return;

    setLoadingUser(true);
    try {
      const u = await authApi.obtenerUsuarioActual();
      setUser(u);
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
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}