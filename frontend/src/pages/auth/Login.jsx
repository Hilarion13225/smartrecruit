import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Brain, User, Lock, Eye, EyeOff } from 'lucide-react';

const styles = `
  .login-side {
    width: 380px;
    min-height: 100vh;
    flex-shrink: 0;
  }
  .login-side-inner { padding: 40px; }
  .login-logo { width: 80px; height: 80px; }
  .login-title { font-size: 26px; }
  .login-side-desc { display: block; }
  .login-form-wrap { padding: 40px; }
  .login-form-title { font-size: 28px; }

  /* ── Splash ── */
  .sr-splash {
    position: fixed;
    inset: 0;
    background: linear-gradient(160deg, #1E2D45 0%, #0F1E33 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    z-index: 9999;
    transition: opacity 0.4s ease;
  }
  .sr-splash.hide { opacity: 0; pointer-events: none; }
  .sr-logo-ring {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 8px 24px rgba(79,70,229,0.4);
  }
  .sr-logo-ring::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 26px;
    border: 2px solid #4F46E5;
    opacity: 0;
    animation: sr-ping 1.6s ease-out infinite;
  }
  .sr-logo-ring::after {
    content: '';
    position: absolute;
    inset: -14px;
    border-radius: 34px;
    border: 1.5px solid #4F46E5;
    opacity: 0;
    animation: sr-ping 1.6s ease-out infinite;
    animation-delay: 0.3s;
  }
  @keyframes sr-ping {
    0%   { transform: scale(0.9); opacity: 0.7; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  .sr-splash-name {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0.02em;
  }
  .sr-splash-sub {
    font-size: 13px;
    color: #94A3B8;
  }
  .sr-splash-dots { display: flex; gap: 6px; }
  .sr-splash-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4F46E5;
    animation: sr-bounce 1.2s ease-in-out infinite;
  }
  .sr-splash-dot:nth-child(2) { animation-delay: 0.2s; }
  .sr-splash-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes sr-bounce {
    0%,80%,100% { transform: translateY(0);   opacity: 0.4; }
    40%          { transform: translateY(-8px); opacity: 1; }
  }

  @media (max-width: 768px) {
    .login-wrap { flex-direction: column !important; }
    .login-side { width: 100% !important; min-height: unset !important; }
    .login-side-inner { padding: 30px 20px; }
    .login-logo { width: 60px; height: 60px; }
    .login-title { font-size: 22px; }
    .login-side-desc { display: none; }
    .login-form-wrap { padding: 30px 20px; }
    .login-form-title { font-size: 22px; }
  }
`;

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hideSplash, setHideSplash] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fade out après 2s, retire du DOM après 2.4s
    const t1 = setTimeout(() => setHideSplash(true), 2000);
    const t2 = setTimeout(() => setShowSplash(false), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch {
      toast.error('Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      {/* ── Splash screen ── */}
      {showSplash && (
        <div className={`sr-splash${hideSplash ? ' hide' : ''}`}>
          <div className="sr-logo-ring">
            <Brain size={32} color="#fff" />
          </div>
          <span className="sr-splash-name">SmartRecruit</span>
          <span className="sr-splash-sub">Propulsé par l'IA</span>
          <div className="sr-splash-dots">
            <div className="sr-splash-dot"></div>
            <div className="sr-splash-dot"></div>
            <div className="sr-splash-dot"></div>
          </div>
        </div>
      )}

      {/* ── Login form ── */}
      <div className="login-wrap" style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', fontFamily: 'sans-serif' }}>

        {/* Panneau gauche */}
        <div className="login-side" style={{ background: 'linear-gradient(160deg, #1E2D45 0%, #0F1E33 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="login-side-inner" style={{ textAlign: 'center', color: '#fff' }}>
            <div className="login-logo" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(79,70,229,0.4)' }}>
              <Brain size={36} color="#fff" />
            </div>
            <h1 className="login-title" style={{ fontWeight: '800', color: '#fff', marginBottom: '8px' }}>SmartRecruit</h1>
            <p className="login-side-desc" style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6', maxWidth: '260px', margin: '0 auto' }}>
              Recrutez plus intelligemment grâce à l'analyse IA de CV.
            </p>
          </div>
        </div>

        {/* Panneau droit */}
        <div className="login-form-wrap" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <h2 className="login-form-title" style={{ fontWeight: '800', color: '#1E2D45', marginBottom: '6px' }}>Bienvenue !</h2>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '32px' }}>Connectez-vous à votre espace recruteur.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Username */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.08em' }}>NOM D'UTILISATEUR</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E2E8F0', borderRadius: '10px', background: '#fff', padding: '0 14px', gap: '10px' }}>
                  <User size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input name="username" value={form.username} onChange={handleChange} placeholder="Votre username" required
                    style={{ flex: 1, border: 'none', outline: 'none', padding: '13px 0', fontSize: '14px', color: '#1E2D45', background: 'transparent' }} />
                </div>
              </div>

              {/* Mot de passe */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.08em' }}>MOT DE PASSE</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E2E8F0', borderRadius: '10px', background: '#fff', padding: '0 14px', gap: '10px' }}>
                  <Lock size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" required
                    style={{ flex: 1, border: 'none', outline: 'none', padding: '13px 0', fontSize: '14px', color: '#1E2D45', background: 'transparent' }} />
                  <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {showPassword ? <EyeOff size={16} color="#94A3B8" /> : <Eye size={16} color="#94A3B8" />}
                  </span>
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ padding: '14px', background: 'linear-gradient(135deg, #1E2D45, #2D4263)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748B' }}>
              Pas encore de compte ?{' '}
              <a href="/register" style={{ color: '#4F46E5', fontWeight: '700', textDecoration: 'none' }}>
                Créer un compte
              </a>
            </p>

            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#94A3B8' }}>
              © 2026 SmartRecruit • Propulsé par l'IA
            </p>
          </div>
        </div>
      </div>
    </>
  );
}