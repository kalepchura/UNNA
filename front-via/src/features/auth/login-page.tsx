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
} from 'lucide-react';

import { toast } from 'sonner';

import banner from '@/assets/banner-home-04.jpg';
import logoUnna from '@/assets/logo.png';

import { LoadingSpinner } from '@/components/shared/loading-spinner';

import { useAuth } from '@/store/auth-context';
import { loginSchema, type LoginFormData } from './login.schema';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Outfit', sans-serif;
    background: #050816;
  }

  body {
    overflow: hidden;
  }

  /* ===================================================== */
  /* PAGE */
  /* ===================================================== */

  .lp-page {
    min-height: 100vh;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 2rem;

    background:
      radial-gradient(
        circle at top left,
        rgba(0, 208, 132, 0.08),
        transparent 30%
      ),
      radial-gradient(
        circle at bottom right,
        rgba(0, 208, 132, 0.05),
        transparent 30%
      ),
      #050816;
  }

  /* ===================================================== */
  /* PANEL */
  /* ===================================================== */

  .lp-panel {
    position: relative;

    width: 100%;
    max-width: 1120px;

    height: 620px;

    overflow: hidden;

    border-radius: 14px;

    background: #081018;

    border: 1px solid rgba(255,255,255,0.04);

    box-shadow:
      0 25px 70px rgba(0,0,0,0.42);

    display: flex;
  }

  /* ===================================================== */
  /* LEFT */
  /* ===================================================== */

  .lp-left {
    position: relative;

    flex: 1;

    overflow: hidden;
  }

  .lp-banner {
    position: absolute;
    inset: 0;

    background-image: url('BANNER_PLACEHOLDER');

    background-size: cover;
    background-position: center;

    transform: scale(1.03);
  }

  .lp-overlay {
    position: absolute;
    inset: 0;

    background:
      linear-gradient(
        90deg,
        rgba(5,8,22,0.84) 0%,
        rgba(5,8,22,0.52) 42%,
        rgba(5,8,22,0.12) 100%
      );
  }

  .lp-left-content {
    position: relative;

    z-index: 2;

    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    padding: 2.4rem;
  }

  .lp-logo {
    width: 180px;

    object-fit: contain;

    filter:
      drop-shadow(0 4px 12px rgba(0,0,0,0.35));
  }

  .lp-bottom {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;

    width: fit-content;

    padding: 0.8rem 1rem;

    border-radius: 999px;

    background: rgba(255,255,255,0.06);

    border: 1px solid rgba(255,255,255,0.08);

    backdrop-filter: blur(10px);

    color: rgba(255,255,255,0.72);

    font-size: 0.84rem;
    font-weight: 500;

    letter-spacing: 0.04em;
  }

  /* ===================================================== */
  /* RIGHT */
  /* ===================================================== */

  .lp-right {
    width: 360px;

    background:
      linear-gradient(
        180deg,
        rgba(10,15,25,0.97) 0%,
        rgba(8,12,20,0.99) 100%
      );

    border-left: 1px solid rgba(255,255,255,0.04);

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 2rem;
  }

  /* ===================================================== */
  /* CARD */
  /* ===================================================== */

  .lp-card {
    width: 100%;
  }

  .lp-icon-wrap {
    width: 70px;
    height: 70px;

    margin: 0 auto 1.4rem;

    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    background:
      radial-gradient(
        circle at top,
        rgba(0,208,132,0.18),
        rgba(0,208,132,0.05)
      );

    border: 1px solid rgba(0,208,132,0.16);
  }

  .lp-icon {
    color: #00d084;
  }

  .lp-title {
    text-align: center;

    color: #ffffff;

    font-size: 1.85rem;
    font-weight: 700;

    margin: 0;
  }

  .lp-subtitle {
    text-align: center;

    margin-top: 0.55rem;
    margin-bottom: 2rem;

    color: rgba(255,255,255,0.50);

    font-size: 0.90rem;
  }

  /* ===================================================== */
  /* FORM */
  /* ===================================================== */

  .lp-fields {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .lp-label {
    display: block;

    margin-bottom: 0.55rem;

    color: rgba(255,255,255,0.82);

    font-size: 0.86rem;
    font-weight: 500;
  }

  .lp-input-wrap {
    position: relative;

    display: flex;
    align-items: center;
  }

  .lp-input-icon {
    position: absolute;

    left: 1rem;

    color: rgba(255,255,255,0.28);

    pointer-events: none;
  }

  .lp-input {
    width: 100%;
    height: 52px;

    border-radius: 10px;

    border: 1px solid rgba(255,255,255,0.05);

    background: rgba(255,255,255,0.04);

    padding: 0 1rem 0 2.8rem;

    color: #ffffff;

    font-size: 0.92rem;

    outline: none;

    transition:
      border-color 0.2s,
      background 0.2s,
      box-shadow 0.2s;
  }

  .lp-input::placeholder {
    color: rgba(255,255,255,0.22);
  }

  .lp-input:focus {
    border-color: rgba(0,208,132,0.35);

    background: rgba(255,255,255,0.06);

    box-shadow:
      0 0 0 3px rgba(0,208,132,0.08);
  }

  .lp-eye {
    position: absolute;

    right: 0.9rem;

    border: none;
    background: transparent;

    color: rgba(255,255,255,0.32);

    display: flex;
    align-items: center;

    cursor: pointer;
  }

  .lp-eye:hover {
    color: rgba(255,255,255,0.68);
  }

  .lp-error {
    margin-top: 0.4rem;

    color: #ff7f9f;

    font-size: 0.76rem;
  }

  /* ===================================================== */
  /* OPTIONS */
  /* ===================================================== */

  .lp-options {
    margin-top: 1.2rem;
    margin-bottom: 1.8rem;

    display: flex;
    align-items: center;
  }

  .lp-remember {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  .lp-remember input {
    width: 14px;
    height: 14px;

    accent-color: #00d084;
  }

  .lp-remember label {
    color: rgba(255,255,255,0.56);

    font-size: 0.86rem;
  }

  /* ===================================================== */
  /* BUTTON */
  /* ===================================================== */

  .lp-btn {
    width: 100%;
    height: 54px;

    border: none;

    border-radius: 10px;

    background:
      linear-gradient(
        135deg,
        #00d084 0%,
        #00b37e 100%
      );

    color: #ffffff;

    font-size: 0.94rem;
    font-weight: 600;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;

    cursor: pointer;

    transition:
      transform 0.2s,
      opacity 0.2s;

    box-shadow:
      0 10px 24px rgba(0,208,132,0.18);
  }

  .lp-btn:hover:not(:disabled) {
    transform: translateY(-2px);

    opacity: 0.96;
  }

  .lp-btn:disabled {
    opacity: 0.65;

    cursor: not-allowed;
  }

  .lp-spinner {
    width: 17px;
    height: 17px;

    border-radius: 50%;

    border: 2px solid rgba(255,255,255,0.28);

    border-top-color: #ffffff;

    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ===================================================== */
  /* RESPONSIVE */
  /* ===================================================== */

  @media (max-width: 920px) {
    .lp-panel {
      flex-direction: column;

      height: auto;

      max-width: 430px;
    }

    .lp-left {
      min-height: 220px;
    }

    .lp-left-content {
      padding: 2rem;
    }

    .lp-right {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    .lp-page {
      padding: 1rem;
    }

    .lp-panel {
      border-radius: 12px;
    }

    .lp-right {
      padding: 1.6rem;
    }

    .lp-logo {
      width: 160px;
    }
  }
`;

export function LoginPage() {
  const { session, user, loading, login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
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
      (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

    return <Navigate to={destino} replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);

    try {
      await login(data.email, data.password);

      const destino =
        (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

      navigate(destino, { replace: true });
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error
          ? err.message
          : 'Error al iniciar sesión';

      toast.error(mensaje);

      setSubmitting(false);
    }
  };

  const finalCss = css.replace('BANNER_PLACEHOLDER', banner);

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

              <img
                src={logoUnna}
                alt="Unna"
                className="lp-logo"
              />

              <div className="lp-bottom">
                <Shield size={15} />
                Acceso privado
              </div>

            </div>
          </div>

          {/* RIGHT */}
          <div className="lp-right">
            <div className="lp-card">

              <div className="lp-icon-wrap">
                <Shield size={30} className="lp-icon" />
              </div>

              <h1 className="lp-title">
                Iniciar sesión
              </h1>

              <p className="lp-subtitle">
                Accede con tus credenciales
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="lp-fields">

                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="lp-label"
                    >
                      Correo electrónico
                    </label>

                    <div className="lp-input-wrap">
                      <Mail
                        size={17}
                        className="lp-input-icon"
                      />

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
                      <p className="lp-error">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="lp-label"
                    >
                      Contraseña
                    </label>

                    <div className="lp-input-wrap">
                      <Lock
                        size={17}
                        className="lp-input-icon"
                      />

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
                        {showPass ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="lp-error">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                </div>

                <div className="lp-options">
                  <div className="lp-remember">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) =>
                        setRemember(e.target.checked)
                      }
                    />

                    <label htmlFor="remember">
                      Recordarme
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="lp-btn"
                  disabled={submitting}
                >
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

            </div>
          </div>

        </div>
      </div>
    </>
  );
}