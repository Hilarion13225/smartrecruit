import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import toast from 'react-hot-toast';

const recConfig = {
  priority: { label: '⭐ Prioritaire', bg: '#D1FAE5', color: '#065F46' },
  possible: { label: '✅ Possible', bg: '#DBEAFE', color: '#1E40AF' },
  reserve: { label: '⚠️ Réserve', bg: '#FEF3C7', color: '#92400E' },
  rejected: { label: '❌ Rejeté', bg: '#FEE2E2', color: '#991B1B' },
};

export default function AdminAnalyses() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.getAnalyses()
      .then((res) => setAnalyses(res.data))
      .catch(() => toast.error('Erreur chargement analyses.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? analyses
    : analyses.filter((a) => a.recommendation === filter);

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div>
      <div style={styles.header}>
        <button onClick={() => navigate('/admin')} style={styles.backBtn}>
          ← Retour
        </button>
        <h1 style={styles.title}>🔍 Supervision des analyses</h1>
        <p style={styles.subtitle}>
          {analyses.length} analyse(s) — 50 plus récentes
        </p>
      </div>

      {/* Filtres */}
      <div style={styles.filters}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'priority', label: '⭐ Prioritaires' },
          { key: 'possible', label: '✅ Possibles' },
          { key: 'reserve', label: '⚠️ Réserve' },
          { key: 'rejected', label: '❌ Rejetés' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              ...styles.filterBtn,
              ...(filter === f.key ? styles.filterBtnActive : {}),
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Candidat</th>
              <th style={styles.th}>Poste</th>
              <th style={styles.th}>Recruteur</th>
              <th style={styles.th}>Score</th>
              <th style={styles.th}>Recommandation</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const rec = recConfig[a.recommendation];
              return (
                <tr key={a.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.name}>{a.candidate_name}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.cellText}>{a.job_title}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.cellText}>{a.recruiter}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.scoreCell}>
                      <span style={styles.scoreNum}>
                        {a.score_total?.toFixed(0)}
                      </span>
                      <div style={styles.scoreBarBg}>
                        <div style={{
                          ...styles.scoreBarFill,
                          width: `${a.score_total || 0}%`,
                          background: a.score_total >= 75
                            ? '#10B981' : a.score_total >= 55
                            ? '#4F46E5' : a.score_total >= 35
                            ? '#F59E0B' : '#EF4444',
                        }} />
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.recBadge,
                      background: rec.bg,
                      color: rec.color,
                    }}>
                      {rec.label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.cellText}>
                      {new Date(a.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={styles.empty}>Aucune analyse trouvée.</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', color: '#6B7280',
  },
  header: { marginBottom: '24px' },
  backBtn: {
    padding: '6px 12px', background: '#F3F4F6',
    border: 'none', borderRadius: '6px', fontSize: '13px',
    cursor: 'pointer', color: '#374151', marginBottom: '8px',
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#1F2937' },
  subtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px' },
  filters: {
    display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '7px 16px', border: '1.5px solid #E5E7EB',
    borderRadius: '20px', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', background: '#fff', color: '#6B7280',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    background: '#4F46E5', color: '#fff',
    border: '1.5px solid #4F46E5',
  },
  tableCard: {
    background: '#fff', borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#F9FAFB' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '12px', fontWeight: '600', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid #E5E7EB',
  },
  tr: { borderBottom: '1px solid #F3F4F6' },
  td: { padding: '14px 16px', verticalAlign: 'middle' },
  name: { fontSize: '13px', fontWeight: '600', color: '#1F2937' },
  cellText: { fontSize: '13px', color: '#6B7280' },
  scoreCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  scoreNum: { fontSize: '14px', fontWeight: '700', color: '#1F2937', width: '30px' },
  scoreBarBg: {
    flex: 1, height: '6px', background: '#F3F4F6',
    borderRadius: '10px', overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%', borderRadius: '10px',
    transition: 'width 0.5s ease',
  },
  recBadge: {
    padding: '4px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600',
  },
  empty: {
    textAlign: 'center', padding: '40px',
    color: '#9CA3AF', fontSize: '14px',
  },
};