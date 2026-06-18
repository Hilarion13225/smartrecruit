import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🎯</span>
          <h1 style={styles.logoText}>SmartRecruit</h1>
        </div>

        <h2 style={styles.title}>Connexion</h2>
        <p style={styles.subtitle}>Accédez à votre espace recruteur</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nom d'utilisateur</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Votre username"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.footer}>
          Pas encore de compte ?{' '}
          <a href="/register" style={styles.link}>S'inscrire</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: '32px' },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#4F46E5',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: '28px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#374151' },
  input: {
    padding: '10px 14px',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '8px',
    transition: 'opacity 0.2s',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#6B7280',
  },
  link: { color: '#4F46E5', fontWeight: '600' },
};