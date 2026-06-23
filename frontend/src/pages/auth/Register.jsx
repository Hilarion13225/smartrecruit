import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';
import { User, Mail, Building2, Lock, Target, UserPlus } from 'lucide-react';

const css = `
  .register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #1E2D45 0%, #0F1E33 100%);
    padding: 20px;
  }
  .register-card {
    background: #fff;
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 560px;
  }
  .register-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  .register-logo-icon {
    width: 40px;
    height: 40px;
    background: #4F46E5;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .register-logo-text {
    font-size: 20px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0;
  }
  .register-title {
    font-size: 20px;
    font-weight: 700;
    color: #1F2937;
    text-align: center;
    margin: 0 0 24px;
  }
  .register-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 14px;
  }
  .register-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .register-field.full {
    grid-column: span 2;
  }
  .register-label {
    font-size: 11px;
    font-weight: 700;
    color: #64748B;
    letter-spacing: 0.08em;
  }
  .register-input-wrap {
    display: flex;
    align-items: center;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    background: #fff;
    padding: 0 12px;
    gap: 8px;
    transition: border-color 0.15s;
  }
  .register-input-wrap:focus-within {
    border-color: #4F46E5;
  }
  .register-input-wrap input {
    flex: 1;
    border: none;
    outline: none;
    padding: 11px 0;
    font-size: 14px;
    color: #1E2D45;
    background: transparent;
  }
  .register-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 13px;
    background: #1E2D45;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    transition: background 0.15s;
  }
  .register-btn:hover:not(:disabled) { background: #2D4263; }
  .register-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .register-footer {
    text-align: center;
    margin-top: 16px;
    font-size: 14px;
    color: #6B7280;
  }
  .register-link {
    color: #4F46E5;
    font-weight: 600;
    text-decoration: none;
  }

  @media (max-width: 540px) {
    .register-card { padding: 28px 20px; }
    .register-grid { grid-template-columns: 1fr; }
    .register-field.full { grid-column: span 1; }
    .register-title { font-size: 18px; }
  }
`;

const FIELDS = [
  { name: 'first_name', label: 'PRÉNOM',               type: 'text',     icon: <User     size={15} color="#94A3B8" /> },
  { name: 'last_name',  label: 'NOM',                  type: 'text',     icon: <User     size={15} color="#94A3B8" /> },
  { name: 'username',   label: "NOM D'UTILISATEUR",    type: 'text',     icon: <User     size={15} color="#94A3B8" />, full: false },
  { name: 'email',      label: 'EMAIL',                type: 'email',    icon: <Mail     size={15} color="#94A3B8" />, full: true },
  { name: 'company',    label: 'ENTREPRISE',           type: 'text',     icon: <Building2 size={15} color="#94A3B8" />, full: true },
  { name: 'password',   label: 'MOT DE PASSE',         type: 'password', icon: <Lock     size={15} color="#94A3B8" /> },
  { name: 'password2',  label: 'CONFIRMER MOT DE PASSE', type: 'password', icon: <Lock   size={15} color="#94A3B8" /> },
];

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    password2: '', first_name: '', last_name: '', company: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Compte créé ! Connectez-vous.');
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.values(errors).forEach((msg) => toast.error(msg[0]));
      } else {
        toast.error('Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="register-page">
        <div className="register-card">

          {/* Logo */}
          <div className="register-logo">
            <div className="register-logo-icon">
              <Target size={22} color="#fff" />
            </div>
            <h1 className="register-logo-text">SmartRecruit</h1>
          </div>

          <h2 className="register-title">Créer un compte</h2>

          <form onSubmit={handleSubmit}>
            <div className="register-grid">
              {FIELDS.map((f) => (
                <div
                  key={f.name}
                  className={`register-field${f.full ? ' full' : ''}`}
                >
                  <label className="register-label">{f.label}</label>
                  <div className="register-input-wrap">
                    {f.icon}
                    <input
                      name={f.name}
                      type={f.type}
                      value={form[f.name]}
                      onChange={handleChange}
                      required={f.name !== 'company'}
                      placeholder={f.name === 'company' ? 'Optionnel' : ''}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              <UserPlus size={16} />
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="register-footer">
            Déjà un compte ?{' '}
            <a href="/login" className="register-link">Se connecter</a>
          </p>

        </div>
      </div>
    </>
  );
}