import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';

import logoUnna from '@/assets/logo.png';
import banner from '@/assets/banner-home-04.jpg';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; }

  html, body, #root {
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

  .rp-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background:
      radial-gradient(circle at top left, rgba(0,208,132,0.08), transparent 30%),
      radial-gradient(circle at bottom right, rgba(0,208,132,0.05), transparent 30%),
      #050816;
  }

  .rp-panel {
    position: relative;
    width: 100%;
    max-width: 1120px;
    height: 620px;
    overflow: hidden;
    border-radius: 14px;
    background: #081018;
    border: 1px solid rgba(255,255,255,0.04);
    box-shadow: 0 25px 70px rgba(0,0,0,0.42);
    display: flex;
  }

  .rp-left {
    position: relative;
    flex: 1;
    overflow: hidden;
  }

  .rp-banner {
    position: absolute;
    inset: 0;
    background-image: url('BANNER_PLACEHOLDER');
    background-size: cover;
    background-position: center;
    transform: scale(1.03);
  }

  .rp-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(5,8,22,0.84) 0%,
      rgba(5,8,22,0.52) 42%,
      rgba(5,8,22,0.12) 100%
    );
  }

  .rp-left-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.4rem;
  }

  .rp-logo {
    width: 180px;
    object-fit: contain;
  }

  .rp-bottom {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    width: fit-content;
    padding: 0.8rem 1rem;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.72);
    font-size: 0.84rem;
    font-weight: 500;
  }

  .rp-right {
    width: 360px;
    background: linear-gradient(
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

  .rp-card {
    width: 100%;
  }

  .rp-icon-wrap {
    width: 70px;
    height: 70px;
    margin: 0 auto 1.4rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(
      circle at top,
      rgba(0,208,132,0.18),
      rgba(0,208,132,0.05)
    );
    border: 1px solid rgba(0,208,132,0.16);
  }

  .rp-icon {
    color: #00d084;
  }

  .rp-title {
    text-align: center;
    color: #fff;
    font-size: 1.85rem;
    font-weight: 700;
    margin: 0;
  }

  .rp-subtitle {
    text-align: center;
    margin-top: 0.55rem;
    margin-bottom: 2rem;
    color: rgba(255,255,255,0.50);
    font-size: 0.90rem;
  }

  .rp-fields {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .rp-label {
    display: block;
    margin-bottom: 0.55rem;
    color: rgba(255,255,255,0.82);
    font-size: 0.86rem;
    font-weight: 500;
  }

  .rp-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .rp-input-icon {
    position: absolute;
    left: 1rem;
    color: rgba(255,255,255,0.28);
  }

  .rp-input {
    width: 100%;
    height: 52px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.04);
    padding: 0 3rem 0 2.8rem;
    color: #fff;
    font-size: 0.92rem;
    outline: none;
  }

  .rp-eye {
    position: absolute;
    right: 0.9rem;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.32);
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .rp-error {
    margin-top: 0.5rem;
    color: #ff7f9f;
    font-size: 0.78rem;
  }

  .rp-btn {
    margin-top: 1.8rem;
    width: 100%;
    height: 54px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #00d084 0%, #00b37e 100%);
    color: #fff;
    font-size: 0.94rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    cursor: pointer;
  }

  .rp-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .rp-spinner {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.28);
    border-top-color: #fff;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 920px) {
    .rp-panel {
      flex-direction: column;
      height: auto;
      max-width: 430px;
    }

    .rp-left {
      min-height: 220px;
    }

    .rp-right {
      width: 100%;
    }
  }
`;

export function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');

  const [tokenValido, setTokenValido] = useState(false);

  useEffect(() => {
    let mounted = true;

    const procesarSesion = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log('SESSION:', session);
        console.log('ERROR:', error);

        if (session && mounted) {
          setTokenValido(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    procesarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AUTH EVENT:', event);

        if (
          (event === 'PASSWORD_RECOVERY' ||
            event === 'SIGNED_IN') &&
          session
        ) {
          setTokenValido(true);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const validar = () => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    if (password !== confirmar) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  };

  const guardar = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const err = validar();

    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    console.log(error);

    if (error) {
      toast.error(
        'No se pudo establecer la contraseña',
      );

      setSubmitting(false);

      return;
    }

    toast.success(
      'Contraseña creada correctamente',
    );

    setTimeout(() => {
      navigate('/login', {
        replace: true,
      });
    }, 1500);
  };

  const finalCss = css.replace(
    'BANNER_PLACEHOLDER',
    banner,
  );

  return (
    <>
      <style>{finalCss}</style>

      <div className="rp-page">
        <div className="rp-panel">

          <div className="rp-left">
            <div className="rp-banner" />
            <div className="rp-overlay" />

            <div className="rp-left-content">
              <img
                src={logoUnna}
                alt="Unna"
                className="rp-logo"
              />

              <div className="rp-bottom">
                <Shield size={15} />
                Acceso privado
              </div>
            </div>
          </div>

          <div className="rp-right">
            <div className="rp-card">

              <div className="rp-icon-wrap">
                <Lock
                  size={30}
                  className="rp-icon"
                />
              </div>

              <h1 className="rp-title">
                Crear contraseña
              </h1>

              <p className="rp-subtitle">
                Establece una contraseña para tu cuenta
              </p>

              <form onSubmit={guardar}>

                <div className="rp-fields">

                  <div>
                    <label className="rp-label">
                      Nueva contraseña
                    </label>

                    <div className="rp-input-wrap">
                      <Lock
                        size={17}
                        className="rp-input-icon"
                      />

                      <input
                        type={
                          showPass
                            ? 'text'
                            : 'password'
                        }
                        className="rp-input"
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(e) => {
                          setPassword(
                            e.target.value,
                          );

                          setError('');
                        }}
                        disabled={
                          !tokenValido ||
                          submitting
                        }
                      />

                      <button
                        type="button"
                        className="rp-eye"
                        onClick={() =>
                          setShowPass((v) => !v)
                        }
                      >
                        {showPass ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="rp-label">
                      Confirmar contraseña
                    </label>

                    <div className="rp-input-wrap">
                      <Lock
                        size={17}
                        className="rp-input-icon"
                      />

                      <input
                        type={
                          showConfirm
                            ? 'text'
                            : 'password'
                        }
                        className="rp-input"
                        placeholder="Repite tu contraseña"
                        value={confirmar}
                        onChange={(e) => {
                          setConfirmar(
                            e.target.value,
                          );

                          setError('');
                        }}
                        disabled={
                          !tokenValido ||
                          submitting
                        }
                      />

                      <button
                        type="button"
                        className="rp-eye"
                        onClick={() =>
                          setShowConfirm(
                            (v) => !v,
                          )
                        }
                      >
                        {showConfirm ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    {error && (
                      <p className="rp-error">
                        {error}
                      </p>
                    )}
                  </div>

                </div>

                <button
                  type="submit"
                  className="rp-btn"
                  disabled={
                    !tokenValido ||
                    submitting
                  }
                >
                  {submitting ? (
                    <>
                      <span className="rp-spinner" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Guardar contraseña
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                {!tokenValido && (
                  <p
                    style={{
                      marginTop: '1rem',
                      textAlign: 'center',
                      color:
                        'rgba(255,255,255,0.45)',
                      fontSize: '0.82rem',
                    }}
                  >
                    Verificando enlace...
                  </p>
                )}

              </form>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}

