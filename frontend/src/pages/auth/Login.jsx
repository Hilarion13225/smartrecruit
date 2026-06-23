import { useState } from 'react';
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
  .login-side-inner {
    padding: 40px;
  }
  .login-logo {
    width: 80px;
    height: 80px;
  }
  .login-title {
    font-size: 26px;
  }
  .login-side-desc {
    display: block;
  }
  .login-form-wrap {
    padding: 40px;
  }
  .login-form-title {
    font-size: 28px;
  }

  @media (max-width: 768px) {
    .login-wrap {
      flex-direction: column !important;
    }
    .login-side {
      width: 100% !important;
      min-height: unset !important;
    }
    .login-side-inner {
      padding: 30px 20px;
    }
    .login-logo {
      width: 60px;
      height: 60px;
    }
    .login-title {
      font-size: 22px;
    }
    .login-side-desc {
      display: none;
    }
    .login-form-wrap {
      padding: 30px 20px;
    }
    .login-form-title {
      font-size: 22px;
    }
  }
`;

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

            {/* Lien register */}
            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748B' }}>
              Pas encore de compte ?{' '}
              <a
                href="/register"
                style={{ color: '#4F46E5', fontWeight: '700', textDecoration: 'none' }}
              >
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