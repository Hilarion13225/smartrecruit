import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Accès réservé aux administrateurs.');
      navigate('/dashboard');
      return;
    }
    adminAPI.getStats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Erreur chargement stats admin.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  const cards = [
    {
      icon: '👥', label: 'Utilisateurs total',
      value: stats?.total_users, color: '#4F46E5',
      sub: `${stats?.active_users} actifs / ${stats?.inactive_users} inactifs`,
    },
    {
      icon: '💼', label: 'Offres total',
      value: stats?.total_jobs, color: '#10B981',
      sub: `${stats?.active_jobs} actives`,
    },
    {
      icon: '📄', label: 'CV total',
      value: stats?.total_resumes, color: '#F59E0B',
      sub: `${stats?.analyzed_resumes} analysés`,
    },
    {
      icon: '📊', label: 'Score moyen',
      value: `${Math.round(stats?.average_score || 0)}/100`,
      color: '#8B5CF6',
      sub: `${stats?.priority_count} prioritaires`,
    },
  ];

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🛡️ Espace Administrateur</h1>
          <p style={styles.subtitle}>
            Supervision globale de la plateforme SmartRecruit
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/users')}
          style={styles.manageBtn}
        >
          👥 Gérer les utilisateurs
        </button>
      </div>

      {/* Stats cards */}
      <div style={styles.grid}>
        {cards.map((card) => (
          <div key={card.label} style={styles.card}>
            <div style={{
              ...styles.cardIcon,
              background: card.color + '20',
            }}>
              <span style={{ fontSize: '28px' }}>{card.icon}</span>
            </div>
            <div>
              <p style={{ ...styles.cardValue, color: card.color }}>
                {card.value}
              </p>
              <p style={styles.cardLabel}>{card.label}</p>
              <p style={styles.cardSub}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Barre de progression analyses */}
      <div style={styles.progressCard}>
        <h3 style={styles.progressTitle}>
          📈 Progression des analyses
        </h3>
        <div style={styles.progressRow}>
          <span style={styles.progressLabel}>CV analysés</span>
          <span style={styles.progressValue}>
            {stats?.analyzed_resumes} / {stats?.total_resumes}
          </span>
        </div>
        <div style={styles.progressBg}>
          <div style={{
            ...styles.progressFill,
            width: stats?.total_resumes > 0
              ? `${(stats.analyzed_resumes / stats.total_resumes) * 100}%`
              : '0%',
          }} />
        </div>

        <div style={styles.recRow}>
          {[
            { label: '⭐ Prioritaires', value: stats?.priority_count, color: '#10B981' },
            { label: '❌ Rejetés', value: stats?.rejected_count, color: '#EF4444' },
            { label: '⏳ En attente', value: stats?.pending_resumes, color: '#F59E0B' },
          ].map((item) => (
            <div key={item.label} style={styles.recItem}>
              <span style={{ ...styles.recValue, color: item.color }}>
                {item.value}
              </span>
              <span style={styles.recLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lien vers supervision analyses */}
      <button
        onClick={() => navigate('/admin/analyses')}
        style={styles.linkBtn}
      >
        🔍 Voir toutes les analyses →
      </button>
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh',
    color: '#6B7280',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '28px',
  },
  title: { fontSize: '24px', fontWeight: '700', color: '#1F2937' },
  subtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px' },
  manageBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '24px',
  },
  card: {
    background: '#fff', borderRadius: '12px',
    padding: '20px', display: 'flex',
    alignItems: 'center', gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardIcon: {
    width: '56px', height: '56px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardValue: { fontSize: '28px', fontWeight: '800' },
  cardLabel: { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  cardSub: { fontSize: '11px', color: '#9CA3AF', marginTop: '2px' },
  progressCard: {
    background: '#fff', borderRadius: '12px',
    padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    marginBottom: '16px',
  },
  progressTitle: {
    fontSize: '16px', fontWeight: '700',
    color: '#1F2937', marginBottom: '16px',
  },
  progressRow: {
    display: 'flex', justifyContent: 'space-between',
    marginBottom: '8px',
  },
  progressLabel: { fontSize: '13px', color: '#6B7280' },
  progressValue: { fontSize: '13px', fontWeight: '600', color: '#1F2937' },
  progressBg: {
    height: '10px', background: '#F3F4F6',
    borderRadius: '10px', overflow: 'hidden',
    marginBottom: '20px',
  },
  progressFill: {
    height: '100%', background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
    borderRadius: '10px', transition: 'width 0.5s ease',
  },
  recRow: { display: 'flex', gap: '32px' },
  recItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  recValue: { fontSize: '24px', fontWeight: '800' },
  recLabel: { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  linkBtn: {
    background: 'none', border: 'none',
    color: '#4F46E5', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', padding: 0,
  },
};