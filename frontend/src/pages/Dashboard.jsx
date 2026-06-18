import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/dashboard/stats/')
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Erreur chargement stats'))
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'Prioritaire', value: stats.priority_candidates, color: '#10B981' },
    { name: 'Possible', value: stats.possible_candidates, color: '#4F46E5' },
    { name: 'Réserve', value: stats.reserve_candidates, color: '#F59E0B' },
    { name: 'Rejeté', value: stats.rejected_candidates, color: '#EF4444' },
  ].filter((d) => d.value > 0) : [];

  const statCards = stats ? [
    { icon: '💼', label: 'Offres actives', value: stats.total_jobs, color: '#4F46E5' },
    { icon: '📄', label: 'CV importés', value: stats.total_resumes, color: '#6366F1' },
    { icon: '🤖', label: 'CV analysés', value: stats.analyzed_resumes, color: '#10B981' },
    { icon: '⭐', label: 'Prioritaires', value: stats.priority_candidates, color: '#F59E0B' },
  ] : [];

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Bonjour, {user?.first_name || user?.username} 👋
          </h1>
          <p style={styles.subtitle}>
            Voici un aperçu de votre activité de recrutement
          </p>
        </div>
        <button
          onClick={() => navigate('/jobs/new')}
          style={styles.newJobBtn}
        >
          + Nouvelle offre
        </button>
      </div>

      {/* Stats cards */}
      <div style={styles.statsGrid}>
        {statCards.map((stat) => (
          <div key={stat.label} style={styles.statCard}>
            <div style={{
              ...styles.statIcon,
              background: stat.color + '20',
            }}>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
            </div>
            <div>
              <p style={styles.statValue}>{stat.value}</p>
              <p style={styles.statLabel}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.row}>
        {/* Score moyen */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📊 Score moyen des candidats</h3>
          {stats?.average_score > 0 ? (
            <div style={styles.scoreCenter}>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={[{
                    value: Math.round(stats.average_score),
                    fill: '#4F46E5'
                  }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={styles.scoreOverlay}>
                <span style={styles.scoreNumber}>
                  {Math.round(stats.average_score)}
                </span>
                <span style={styles.scoreLabel}>/100</span>
              </div>
            </div>
          ) : (
            <div style={styles.noData}>Aucune analyse disponible</div>
          )}
        </div>

        {/* Répartition candidats */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>👥 Répartition des candidats</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} candidat(s)`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.noData}>Aucune analyse disponible</div>
          )}
        </div>

        {/* Offres récentes */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🕐 Offres récentes</h3>
          {stats?.recent_jobs?.length === 0 ? (
            <div style={styles.noData}>Aucune offre créée</div>
          ) : (
            <div style={styles.recentList}>
              {stats?.recent_jobs?.map((job) => (
                <div
                  key={job.id}
                  style={styles.recentItem}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div style={styles.recentInfo}>
                    <p style={styles.recentTitle}>{job.title}</p>
                    <p style={styles.recentMeta}>
                      {job.analyzed_count}/{job.resumes_count} CV analysés
                    </p>
                  </div>
                  <div style={{
                    ...styles.recentBadge,
                    background: job.status === 'active' ? '#D1FAE5' : '#FEF3C7',
                    color: job.status === 'active' ? '#065F46' : '#92400E',
                  }}>
                    {job.status === 'active' ? 'Active' : 'Brouillon'}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/jobs')}
            style={styles.seeAllBtn}
          >
            Voir toutes les offres →
          </button>
        </div>
      </div>

      {/* Actions rapides */}
      {stats?.total_resumes === 0 && (
        <div style={styles.emptyState}>
          <span style={{ fontSize: '48px' }}>🚀</span>
          <h3 style={styles.emptyTitle}>
            Commencez votre premier recrutement
          </h3>
          <p style={styles.emptyText}>
            Créez une offre, importez des CV et laissez l'IA faire le tri !
          </p>
          <button
            onClick={() => navigate('/jobs/new')}
            style={styles.newJobBtn}
          >
            Créer une offre
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh',
    color: '#6B7280', fontSize: '16px',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '28px',
  },
  title: { fontSize: '24px', fontWeight: '700', color: '#1F2937' },
  subtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px' },
  newJobBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '24px',
  },
  statCard: {
    background: '#fff', borderRadius: '12px',
    padding: '20px', display: 'flex',
    alignItems: 'center', gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  statIcon: {
    width: '52px', height: '52px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: '26px', fontWeight: '800', color: '#1F2937' },
  statLabel: { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  row: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px', marginBottom: '24px',
  },
  card: {
    background: '#fff', borderRadius: '12px',
    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    fontSize: '15px', fontWeight: '700',
    color: '#1F2937', marginBottom: '16px',
  },
  scoreCenter: { position: 'relative' },
  scoreOverlay: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -20%)',
    textAlign: 'center',
  },
  scoreNumber: { fontSize: '32px', fontWeight: '800', color: '#1F2937' },
  scoreLabel: { fontSize: '14px', color: '#9CA3AF' },
  noData: {
    textAlign: 'center', padding: '40px',
    color: '#9CA3AF', fontSize: '14px', fontStyle: 'italic',
  },
  recentList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  recentItem: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '10px 12px',
    background: '#F9FAFB', borderRadius: '8px',
    cursor: 'pointer', transition: 'background 0.2s',
  },
  recentInfo: {},
  recentTitle: { fontSize: '13px', fontWeight: '600', color: '#1F2937' },
  recentMeta: { fontSize: '11px', color: '#9CA3AF', marginTop: '2px' },
  recentBadge: {
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '600',
  },
  seeAllBtn: {
    marginTop: '12px', background: 'none',
    border: 'none', color: '#4F46E5',
    fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', padding: 0,
  },
  emptyState: {
    background: '#fff', borderRadius: '16px',
    padding: '60px', textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  emptyTitle: {
    fontSize: '18px', fontWeight: '700',
    color: '#1F2937', margin: '16px 0 8px',
  },
  emptyText: {
    fontSize: '14px', color: '#6B7280',
    maxWidth: '400px', margin: '0 auto 24px',
  },
};