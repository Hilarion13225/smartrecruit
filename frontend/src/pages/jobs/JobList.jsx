import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';
import ImportJobModal from '../../components/ui/ImportJobModal';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await jobsAPI.getAll();
      setJobs(res.data);
    } catch {
      toast.error('Erreur lors du chargement des offres.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await jobsAPI.delete(id);
      setJobs(jobs.filter((j) => j.id !== id));
      toast.success('Offre supprimée.');
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    active: { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
    draft: { bg: '#FEF3C7', color: '#92400E', label: 'Brouillon' },
    closed: { bg: '#FEE2E2', color: '#991B1B', label: 'Fermée' },
  };

  const [showImport, setShowImport] = useState(false);

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Mes offres d'emploi</h1>
          <p style={styles.subtitle}>{jobs.length} offre(s) au total</p>
        </div>
        <button
          onClick={() => navigate('/jobs/new')}
          style={styles.newBtn}
        >
          + Nouvelle offre
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setShowImport(true)}
          style={styles.importBtn}
        >
          📂 Importer une offre
        </button>
        <button
          onClick={() => navigate('/jobs/new')}
          style={styles.newBtn}
        >
          + Nouvelle offre
        </button>
      </div>
      </div>

      {/* Barre de recherche */}
      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          placeholder="Rechercher une offre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : filteredJobs.length === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: '48px' }}>💼</span>
          <h3 style={styles.emptyTitle}>Aucune offre trouvée</h3>
          <p style={styles.emptyText}>
            Créez votre première offre pour commencer à analyser des CV.
          </p>
          <button
            onClick={() => navigate('/jobs/new')}
            style={styles.newBtn}
          >
            Créer une offre
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredJobs.map((job) => {
            const status = statusColors[job.status];
            return (
              <div key={job.id} style={styles.card}>
                {/* Status badge */}
                <div style={styles.cardHeader}>
                  <span style={{
                    ...styles.badge,
                    background: status.bg,
                    color: status.color,
                  }}>
                    {status.label}
                  </span>
                  <span style={styles.date}>
                    {new Date(job.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {/* Titre */}
                <h3 style={styles.jobTitle}>{job.title}</h3>

                {/* Infos */}
                <div style={styles.infoRow}>
                  <span style={styles.info}>
                    🎓 {job.required_education || 'Non précisé'}
                  </span>
                  <span style={styles.info}>
                    ⏱️ {job.required_experience} an(s)
                  </span>
                  <span style={styles.info}>
                    📄 {job.resumes_count} CV
                  </span>
                </div>

                {/* Compétences */}
                <div style={styles.skills}>
                  {job.required_skills.slice(0, 4).map((skill) => (
                    <span key={skill} style={styles.skillTag}>{skill}</span>
                  ))}
                  {job.required_skills.length > 4 && (
                    <span style={styles.skillTag}>
                      +{job.required_skills.length - 4}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                  <button
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    style={styles.btnPrimary}
                  >
                    📊 Voir les candidats
                  </button>
                  <button
                    onClick={() => navigate(`/jobs/${job.id}/edit`)}
                    style={styles.btnSecondary}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    style={styles.btnDanger}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showImport && (
        <ImportJobModal onClose={() => { setShowImport(false); fetchJobs(); }} />
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1F2937',
    '@media (max-width: 640px)': {
      fontSize: '20px',
    },
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
  },
  newBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '@media (max-width: 768px)': {
      padding: '8px 16px',
      fontSize: '13px',
    },
  },
  importBtn: {
    padding: '10px 20px',
    background: '#fff',
    border: '1.5px solid #E5E7EB',
    color: '#4F46E5',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '@media (max-width: 768px)': {
      padding: '8px 16px',
      fontSize: '13px',
    },
  },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: '#fff', border: '1.5px solid #E5E7EB',
    borderRadius: '10px', padding: '10px 16px', marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  searchIcon: { fontSize: '16px' },
  searchInput: {
    border: 'none', outline: 'none',
    fontSize: '14px', flex: 1, color: '#374151',
  },
  loading: {
    textAlign: 'center', padding: '60px',
    color: '#6B7280', fontSize: '16px',
  },
  empty: {
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    '@media (max-width: 640px)': {
      gridTemplateColumns: '1fr',
      gap: '12px',
    },
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '@media (max-width: 640px)': {
      padding: '12px',
    },
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  date: {
    fontSize: '12px',
    color: '#9CA3AF',
  },
  jobTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1F2937',
    '@media (max-width: 640px)': {
      fontSize: '14px',
    },
  },
  infoRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    '@media (max-width: 640px)': {
      fontSize: '11px',
      gap: '8px',
    },
  },
  info: {
    fontSize: '12px',
    color: '#6B7280',
  },
  skills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  skillTag: {
    padding: '3px 8px',
    background: '#EEF2FF',
    color: '#4F46E5',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  btnPrimary: {
    flex: 1,
    padding: '8px 12px',
    background: '#4F46E5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    '@media (max-width: 640px)': {
      fontSize: '12px',
    },
  },
  btnSecondary: {
    padding: '8px 12px',
    background: '#F3F4F6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnDanger: {
    padding: '8px 12px',
    background: '#FEE2E2',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
};
