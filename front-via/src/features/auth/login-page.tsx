import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  ArrowLeft,
} from 'lucide-react';

import { toast } from 'sonner';

import banner from '@/assets/banner-home-04.jpg';
import logoUnna from '@/assets/logo.png';

import { LoadingSpinner } from '@/components/shared/loading-spinner';

import { useAuth } from '@/store/auth-context';
import { supabase } from '@/lib/supabase';
import { loginSchema, type LoginFormData } from './login.schema';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; }

  html, body, #root {
    width: 100%; height: 100%;
    margin: 0; padding: 0;
    font-family: 'Outfit', sans-serif;
    background: #050816;
  }

  body { overflow: hidden; }

  .lp-page {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem;
    background:
      radial-gradient(circle at top left, rgba(0, 208, 132, 0.08), transparent 30%),
      radial-gradient(circle at bottom right, rgba(0, 208, 132, 0.05), transparent 30%),
      #050816;
  }

  .lp-panel {
    position: relative;
    width: 100%; max-width: 1120px; height: 620px;
    overflow: hidden; border-radius: 14px;
    background: #081018;
    border: 1px solid rgba(255,255,255,0.04);
    box-shadow: 0 25px 70px rgba(0,0,0,0.42);
    display: flex;
  }

  .lp-left {
    position: relative; flex: 1; overflow: hidden;
  }

  .lp-banner {
    position: absolute; inset: 0;
    background-image: url('BANNER_PLACEHOLDER');
    background-size: cover; background-position: center;
    transform: scale(1.03);
  }

  .lp-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(90deg,
      rgba(5,8,22,0.84) 0%,
      rgba(5,8,22,0.52) 42%,
      rgba(5,8,22,0.12) 100%
    );
  }

  .lp-left-content {
    position: relative; z-index: 2; height: 100%;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 2.4rem;
  }

  .lp-logo {
    width: 180px; object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.35));
  }

  .lp-bottom {
    display: inline-flex; align-items: center; gap: 0.6rem;
    width: fit-content; padding: 0.8rem 1rem; border-radius: 999px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(10px); color: rgba(255,255,255,0.72);
    font-size: 0.84rem; font-weight: 500; letter-spacing: 0.04em;
  }

  .lp-right {
    width: 360px;
    background: linear-gradient(180deg, rgba(10,15,25,0.97) 0%, rgba(8,12,20,0.99) 100%);
    border-left: 1px solid rgba(255,255,255,0.04);
    display: flex; align-items: center; justify-content: center;
    padding: 2rem;
  }

  .lp-card { width: 100%; }

  .lp-icon-wrap {
    width: 70px; height: 70px; margin: 0 auto 1.4rem; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at top, rgba(0,208,132,0.18), rgba(0,208,132,0.05));
    border: 1px solid rgba(0,208,132,0.16);
  }

  .lp-icon { color: #00d084; }

  .lp-title {
    text-align: center; color: #ffffff;
    font-size: 1.85rem; font-weight: 700; margin: 0;
  }

  .lp-subtitle {
    text-align: center; margin-top: 0.55rem; margin-bottom: 2rem;
    color: rgba(255,255,255,0.50); font-size: 0.90rem;
  }

  .lp-fields { display: flex; flex-direction: column; gap: 1.1rem; }

  .lp-label {
    display: block; margin-bottom: 0.55rem;
    color: rgba(255,255,255,0.82); font-size: 0.86rem; font-weight: 500;
  }

  .lp-input-wrap {
    position: relative; display: flex; align-items: center;
  }

  .lp-input-icon {
    position: absolute; left: 1rem;
    color: rgba(255,255,255,0.28); pointer-events: none;
  }

  .lp-input {
    width: 100%; height: 52px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.04);
    padding: 0 1rem 0 2.8rem;
    color: #ffffff; font-size: 0.92rem; outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }

  .lp-input::placeholder { color: rgba(255,255,255,0.22); }

  .lp-input:focus {
    border-color: rgba(0,208,132,0.35);
    background: rgba(255,255,255,0.06);
    box-shadow: 0 0 0 3px rgba(0,208,132,0.08);
  }

  .lp-eye {
    position: absolute; right: 0.9rem; border: none; background: transparent;
    color: rgba(255,255,255,0.32); display: flex; align-items: center; cursor: pointer;
  }
  .lp-eye:hover { color: rgba(255,255,255,0.68); }

  .lp-error { margin-top: 0.4rem; color: #ff7f9f; font-size: 0.76rem; }

  .lp-options {
    margin-top: 1.2rem; margin-bottom: 1.8rem;
    display: flex; align-items: center; justify-content: space-between;
  }

  .lp-remember {
    display: flex; align-items: center; gap: 0.55rem;
  }

  .lp-remember input {
    width: 14px; height: 14px; accent-color: #00d084;
  }

  .lp-remember label {
    color: rgba(255,255,255,0.56); font-size: 0.86rem;
  }

  .lp-forgot {
    background: none; border: none; padding: 0; cursor: pointer;
    color: rgba(0,208,132,0.80); font-size: 0.86rem; font-family: inherit;
    transition: color 0.2s;
  }
  .lp-forgot:hover { color: #00d084; }

  .lp-btn {
    width: 100%; height: 54px; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #00d084 0%, #00b37e 100%);
    color: #ffffff; font-size: 0.94rem; font-weight: 600;
    display: flex; align-items: center; justify-content: center; gap: 0.55rem;
    cursor: pointer; transition: transform 0.2s, opacity 0.2s;
    box-shadow: 0 10px 24px rgba(0,208,132,0.18);
  }

  .lp-btn:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.96; }
  .lp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .lp-btn-ghost {
    width: 100%; height: 44px; border: none; border-radius: 10px;
    background: transparent; color: rgba(255,255,255,0.45);
    font-size: 0.88rem; font-family: inherit;
    display: flex; align-items: center; justify-content: center; gap: 0.45rem;
    cursor: pointer; margin-top: 0.8rem;
    transition: color 0.2s;
  }
  .lp-btn-ghost:hover { color: rgba(255,255,255,0.75); }

  .lp-spinner {
    width: 17px; height: 17px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.28); border-top-color: #ffffff;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Estado enviado (recuperación) */
  .lp-sent {
    text-align: center; padding: 1rem 0;
  }
  .lp-sent-icon {
    width: 64px; height: 64px; margin: 0 auto 1.2rem; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,208,132,0.10); border: 1px solid rgba(0,208,132,0.18);
  }
  .lp-sent-title { color: #fff; font-size: 1.3rem; font-weight: 700; margin-bottom: 0.6rem; }
  .lp-sent-desc { color: rgba(255,255,255,0.48); font-size: 0.88rem; line-height: 1.5; }

  @media (max-width: 920px) {
    .lp-panel { flex-direction: column; height: auto; max-width: 430px; }
    .lp-left { min-height: 220px; }
    .lp-left-content { padding: 2rem; }
    .lp-right { width: 100%; }
  }

  @media (max-width: 768px) {
    .lp-page { padding: 1rem; }
    .lp-panel { border-radius: 12px; }
    .lp-right { padding: 1.6rem; }
    .lp-logo { width: 160px; }
  }
`;

// Traducción de errores de Supabase al español
const ERRORES_ES: Record<string, string> = {
  'invalid login credentials': 'Correo o contraseña incorrectos',
  'invalid_credentials': 'Correo o contraseña incorrectos',
  'email not confirmed': 'Debes confirmar tu correo antes de ingresar',
  'too many requests': 'Demasiados intentos. Espera unos minutos e intenta de nuevo',
  'user not found': 'No existe una cuenta con ese correo',
  'network request failed': 'Sin conexión. Verifica tu internet e intenta de nuevo',
  'email_not_confirmed': 'Debes confirmar tu correo antes de ingresar',
  'over_email_send_rate_limit': 'Demasiados intentos. Espera unos minutos e intenta de nuevo',
};

function traducirError(raw: string): string {
  const clave = raw.toLowerCase();
  if (ERRORES_ES[clave]) return ERRORES_ES[clave];
  const coincidencia = Object.keys(ERRORES_ES).find((k) => clave.includes(k));
  return coincidencia ? ERRORES_ES[coincidencia] : 'Error al iniciar sesión. Intenta de nuevo';
}

// ─────────────────────────────────────────────
// Vistas internas
// ─────────────────────────────────────────────
type Vista = 'login' | 'recuperar' | 'enviado';

export function LoginPage() {
  const { session, user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [vista, setVista] = useState<Vista>('login');
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [correoRecuperar, setCorreoRecuperar] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (loading && !submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (session && user) {
    const destino =
      (location.state as { from?: { pathname: string } } | null)
        ?.from?.pathname ?? '/';
    return <Navigate to={destino} replace />;
  }

  // ── Submit login ──────────────────────────────
  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      const destino =
        (location.state as { from?: { pathname: string } } | null)
          ?.from?.pathname ?? '/';
      navigate(destino, { replace: true });
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      toast.error(traducirError(rawMsg));
      setSubmitting(false);
    }
  };

  // ── Submit recuperar contraseña ───────────────
  const onRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correoRecuperar) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        correoRecuperar,
        {
          // Supabase redirige aquí después de que el usuario haga clic en el email
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (error) throw new Error(error.message);

      setVista('enviado');
    } catch {
      toast.error('No se pudo enviar el correo. Verifica la dirección e intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const finalCss = css.replace('BANNER_PLACEHOLDER', banner);

  // ── Contenido del panel derecho según vista ───
  const renderDerecho = () => {
    // VISTA: login
    if (vista === 'login') {
      return (
        <>
          <div className="lp-icon-wrap">
            <Shield size={30} className="lp-icon" />
          </div>

          <h1 className="lp-title">Iniciar sesión</h1>
          <p className="lp-subtitle">Accede con tus credenciales</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="lp-fields">

              {/* EMAIL */}
              <div>
                <label htmlFor="email" className="lp-label">
                  Correo electrónico
                </label>
                <div className="lp-input-wrap">
                  <Mail size={17} className="lp-input-icon" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Ingresa tu correo electrónico"
                    disabled={submitting}
                    className="lp-input"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="lp-error">{errors.email.message}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label htmlFor="password" className="lp-label">
                  Contraseña
                </label>
                <div className="lp-input-wrap">
                  <Lock size={17} className="lp-input-icon" />
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    disabled={submitting}
                    className="lp-input"
                    style={{ paddingRight: '3rem' }}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="lp-eye"
                    onClick={() => setShowPass((v) => !v)}
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="lp-error">{errors.password.message}</p>
                )}
              </div>

            </div>

            <div className="lp-options">
              <div className="lp-remember">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label htmlFor="remember">Recordarme</label>
              </div>

              <button
                type="button"
                className="lp-forgot"
                onClick={() => setVista('recuperar')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className="lp-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="lp-spinner" />
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </>
      );
    }

    // VISTA: recuperar contraseña
    if (vista === 'recuperar') {
      return (
        <>
          <div className="lp-icon-wrap">
            <Mail size={30} className="lp-icon" />
          </div>

          <h1 className="lp-title">Recuperar acceso</h1>
          <p className="lp-subtitle">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
          </p>

          <form onSubmit={onRecuperar}>
            <div className="lp-fields">
              <div>
                <label className="lp-label">Correo electrónico</label>
                <div className="lp-input-wrap">
                  <Mail size={17} className="lp-input-icon" />
                  <input
                    type="email"
                    className="lp-input"
                    placeholder="tu@correo.com"
                    value={correoRecuperar}
                    onChange={(e) => setCorreoRecuperar(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.8rem' }}>
              <button type="submit" className="lp-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="lp-spinner" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar enlace
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <button
                type="button"
                className="lp-btn-ghost"
                onClick={() => setVista('login')}
              >
                <ArrowLeft size={15} />
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        </>
      );
    }

    // VISTA: correo enviado
    return (
      <div className="lp-sent">
        <div className="lp-sent-icon">
          <Mail size={28} color="#00d084" />
        </div>
        <p className="lp-sent-title">Revisa tu correo</p>
        <p className="lp-sent-desc">
          Enviamos un enlace de recuperación a<br />
          <strong style={{ color: 'rgba(255,255,255,0.75)' }}>
            {correoRecuperar}
          </strong>
          <br /><br />
          Haz clic en el enlace del correo para establecer una nueva contraseña.
          Si no lo ves, revisa tu carpeta de spam.
        </p>

        <button
          type="button"
          className="lp-btn-ghost"
          style={{ margin: '1.6rem auto 0' }}
          onClick={() => {
            setVista('login');
            setCorreoRecuperar('');
          }}
        >
          <ArrowLeft size={15} />
          Volver al inicio de sesión
        </button>
      </div>
    );
  };

  return (
    <>
      <style>{finalCss}</style>

      <div className="lp-page">
        <div className="lp-panel">

          {/* LEFT */}
          <div className="lp-left">
            <div className="lp-banner" />
            <div className="lp-overlay" />
            <div className="lp-left-content">
              <img src={logoUnna} alt="Unna" className="lp-logo" />
              <div className="lp-bottom">
                <Shield size={15} />
                Acceso privado
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lp-right">
            <div className="lp-card">
              {renderDerecho()}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}