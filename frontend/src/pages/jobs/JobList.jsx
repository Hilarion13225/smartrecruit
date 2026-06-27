import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';
import ImportJobModal from '../../components/ui/ImportJobModal';
import {
  Search, Plus, FolderOpen, Briefcase,
  GraduationCap, Clock, FileText, Users,
  Pencil, Trash2, BarChart2,
} from 'lucide-react';

const css = `
  .jobs-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .jobs-title-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 4px;
  }
  .jobs-title {
    font-size: 24px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 2px;
  }
  .jobs-subtitle {
    font-size: 13px;
    color: #94A3B8;
    margin: 0;
  }
  .jobs-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  .btn-import {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 18px;
    background: #fff;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #4F46E5;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.15s, background 0.15s;
  }
  .btn-import:hover { background: #F8FAFC; border-color: #C7D2FE; }
  .btn-new {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 18px;
    background: #1E2D45;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    letter-spacing: 0.02em;
    transition: background 0.15s;
  }
  .btn-new:hover { background: #2D4263; }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    padding: 10px 16px;
    margin-bottom: 24px;
    transition: border-color 0.15s;
  }
  .search-bar:focus-within { border-color: #4F46E5; }
  .search-bar input {
    border: none;
    outline: none;
    font-size: 14px;
    flex: 1;
    color: #1E2D45;
    background: transparent;
  }
  .search-bar input::placeholder { color: #CBD5E1; }

  .jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  .job-card {
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    border: 1px solid #F1F5F9;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: box-shadow 0.15s, transform 0.15s;
  }
  .job-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .status-badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .card-date { font-size: 12px; color: #94A3B8; }
  .job-title {
    font-size: 16px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0;
    line-height: 1.3;
  }
  .info-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
  .info-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #64748B;
  }
  .skills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .skill-tag {
    padding: 3px 10px;
    background: #EEF2FF;
    color: #4F46E5;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }
  .card-actions {
    display: flex;
    gap: 8px;
    margin-top: 2px;
  }
  .btn-candidates {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 12px;
    background: #4F46E5;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-candidates:hover { background: #4338CA; }
  .btn-edit {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 9px 12px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    color: #64748B;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .btn-edit:hover { background: #EEF2FF; color: #4F46E5; border-color: #C7D2FE; }
  .btn-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 9px 12px;
    background: #FFF5F5;
    border: 1px solid #FED7D7;
    border-radius: 8px;
    color: #E53E3E;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-delete:hover { background: #FED7D7; }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 20px;
    color: #94A3B8;
    font-size: 14px;
  }
  .loading-icon-box {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: #EEF2FF;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 1.5s ease-in-out infinite;
  }
  .loading-bar-bg {
    width: 120px;
    height: 3px;
    background: #E2E8F0;
    border-radius: 10px;
    overflow: hidden;
  }
  .loading-bar-fill {
    height: 100%;
    width: 40%;
    background: #4F46E5;
    border-radius: 10px;
    animation: slide 1.2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.08); opacity: 0.85; }
  }
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }

  .empty-state {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 64px 40px;
    text-align: center;
  }
  .empty-icon {
    width: 64px;
    height: 64px;
    background: #EEF2FF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  .empty-title { font-size: 18px; font-weight: 700; color: #1E2D45; margin: 0 0 8px; }
  .empty-text { font-size: 14px; color: #94A3B8; max-width: 360px; margin: 0 auto 24px; }

  /* ── Skeleton ── */
  .sk {
    background: #E2E8F0;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .sk::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, #F8FAFC 50%, transparent 100%);
    animation: sk-shimmer 1.4s ease-in-out infinite;
  }
  @keyframes sk-shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .sk-jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  .sk-job-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  @media (max-width: 640px) {
    .sk-jobs-grid { grid-template-columns: 1fr; gap: 12px; }
    .sk-job-card  { padding: 16px; }
  }

  /* ── RESPONSIVE MOBILE ── */
  @media (max-width: 768px) {
    .jobs-header {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .jobs-title { font-size: 20px; }
    .jobs-actions {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .btn-import, .btn-new {
      justify-content: center;
      padding: 10px 12px;
      font-size: 12px;
    }
    .search-bar { padding: 9px 12px; }
    .jobs-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .job-card { padding: 16px; gap: 12px; }
    .job-title { font-size: 15px; }
    .card-actions { gap: 6px; }
    .btn-candidates { font-size: 12px; padding: 9px 10px; }
    .btn-edit, .btn-delete { padding: 9px 10px; }
    .empty-state { padding: 40px 20px; }
    .empty-title { font-size: 16px; }
  }

  @media (max-width: 400px) {
    .jobs-actions { grid-template-columns: 1fr; }
    .info-row { gap: 8px; }
    .info-chip { font-size: 11px; }
    .job-card { padding: 14px; }
  }
`;

const STATUS = {
  active: { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
  draft:  { bg: '#FEF3C7', color: '#92400E', label: 'Brouillon' },
  closed: { bg: '#FEE2E2', color: '#991B1B', label: 'Fermée' },
};

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchJobs(); }, []);

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

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <div className="jobs-header">
        <div>
          <p className="jobs-title-label">Recrutement</p>
          <h1 className="jobs-title">Mes offres d'emploi</h1>
          <p className="jobs-subtitle">{jobs.length} offre{jobs.length !== 1 ? 's' : ''} au total</p>
        </div>
        <div className="jobs-actions">
          <button className="btn-import" onClick={() => setShowImport(true)}>
            <FolderOpen size={15} /> Importer une offre
          </button>
          <button className="btn-new" onClick={() => navigate('/jobs/new')}>
            <Plus size={15} /> Nouvelle offre
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={16} color="#CBD5E1" />
        <input
          placeholder="Rechercher une offre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* States */}
      {loading ? (
        <>
          {/* Header skeleton */}
          <div className="jobs-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="sk" style={{ width: 100, height: 11 }} />
              <div className="sk" style={{ width: 220, height: 28 }} />
              <div className="sk" style={{ width: 100, height: 11 }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="sk" style={{ width: 150, height: 40, borderRadius: 10 }} />
              <div className="sk" style={{ width: 130, height: 40, borderRadius: 10 }} />
            </div>
          </div>

          {/* Search skeleton */}
          <div className="sk" style={{ height: 44, borderRadius: 10, marginBottom: 24 }} />

          {/* Cards skeleton */}
          <div className="sk-jobs-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="sk-job-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="sk" style={{ height: 20, width: 70, borderRadius: 20 }} />
                  <div className="sk" style={{ height: 11, width: 60 }} />
                </div>
                <div className="sk" style={{ height: 18, width: '75%' }} />
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="sk" style={{ height: 11, width: 80 }} />
                  <div className="sk" style={{ height: 11, width: 60 }} />
                  <div className="sk" style={{ height: 11, width: 40 }} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[55, 45, 65, 40].map((w, j) => (
                    <div key={j} className="sk" style={{ height: 22, width: w, borderRadius: 20 }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="sk" style={{ flex: 1, height: 36, borderRadius: 8 }} />
                  <div className="sk" style={{ width: 36, height: 36, borderRadius: 8 }} />
                  <div className="sk" style={{ width: 36, height: 36, borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Briefcase size={28} color="#4F46E5" />
          </div>
          <h3 className="empty-title">Aucune offre trouvée</h3>
          <p className="empty-text">
            Créez votre première offre pour commencer à analyser des CV.
          </p>
          <button className="btn-new" onClick={() => navigate('/jobs/new')}>
            <Plus size={15} /> Créer une offre
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => {
            const status = STATUS[job.status] || STATUS.draft;
            return (
              <div key={job.id} className="job-card">

                <div className="card-top">
                  <span className="status-badge" style={{ background: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                  <span className="card-date">
                    {new Date(job.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <h3 className="job-title">{job.title}</h3>

                <div className="info-row">
                  <span className="info-chip">
                    <GraduationCap size={13} color="#94A3B8" />
                    {job.required_education || 'Non précisé'}
                  </span>
                  <span className="info-chip">
                    <Clock size={13} color="#94A3B8" />
                    {job.required_experience} an(s)
                  </span>
                  <span className="info-chip">
                    <FileText size={13} color="#94A3B8" />
                    {job.resumes_count} CV
                  </span>
                </div>

                {job.required_skills?.length > 0 && (
                  <div className="skills-row">
                    {job.required_skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                    {job.required_skills.length > 4 && (
                      <span className="skill-tag">+{job.required_skills.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="card-actions">
                  <button className="btn-candidates" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <BarChart2 size={14} /> Voir les candidats
                  </button>
                  <button className="btn-edit" onClick={() => navigate(`/jobs/${job.id}/edit`)} title="Modifier">
                    <Pencil size={14} />
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(job.id)} title="Supprimer">
                    <Trash2 size={14} />
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
    </>
  );
}