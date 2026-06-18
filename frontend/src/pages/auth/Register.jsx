import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    password2: '', first_name: '', last_name: '', company: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const fields = [
    { name: 'first_name', label: 'Prénom', type: 'text' },
    { name: 'last_name', label: 'Nom', type: 'text' },
    { name: 'username', label: "Nom d'utilisateur", type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'company', label: 'Entreprise', type: 'text' },
    { name: 'password', label: 'Mot de passe', type: 'password' },
    { name: 'password2', label: 'Confirmer le mot de passe', type: 'password' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span>🎯</span>
          <h1 style={styles.logoText}>SmartRecruit</h1>
        </div>

        <h2 style={styles.title}>Créer un compte</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            {fields.map((f) => (
              <div key={f.name} style={
                f.name === 'email' || f.name === 'company'
                  ? { ...styles.field, gridColumn: 'span 2' }
                  : styles.field
              }>
                <label style={styles.label}>{f.label}</label>
                <input
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  required={f.name !== 'company'}
                  style={styles.input}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={styles.footer}>
          Déjà un compte ?{' '}
          <a href="/login" style={styles.link}>Se connecter</a>
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
    maxWidth: '560px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  logo: {
    display: 'flex', alignItems: 'center',
    gap: '10px', marginBottom: '20px',
    justifyContent: 'center', fontSize: '28px',
  },
  logoText: { fontSize: '22px', fontWeight: '700', color: '#4F46E5' },
  title: {
    fontSize: '20px', fontWeight: '700',
    color: '#1F2937', textAlign: 'center', marginBottom: '24px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input: {
    padding: '9px 12px',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '15px',
    fontWeight: '600', transition: 'opacity 0.2s',
  },
  footer: {
    textAlign: 'center', marginTop: '16px',
    fontSize: '14px', color: '#6B7280',
  },
  link: { color: '#4F46E5', fontWeight: '600' },
};