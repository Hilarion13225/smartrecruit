import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Users, Briefcase, FileText, BarChart2,
  ShieldCheck, Star, XCircle, Clock,
  ArrowRight, Search, Loader2,
} from 'lucide-react';

const css = `
  .ad-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 60vh;
    color: #94A3B8;
    font-size: 14px;
  }
  .ad-spin { animation: ad-rotate 0.8s linear infinite; }
  @keyframes ad-rotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* Header */
  .ad-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .ad-title-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 4px;
  }
  .ad-title {
    font-size: 24px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 4px;
  }
  .ad-subtitle { font-size: 13px; color: #94A3B8; margin: 0; }
  .ad-manage-btn {
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
    transition: background 0.15s;
    letter-spacing: 0.02em;
  }
  .ad-manage-btn:hover { background: #2D4263; }

  /* Stats grid */
  .ad-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .ad-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .ad-card-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ad-card-value { font-size: 26px; font-weight: 800; margin: 0 0 2px; }
  .ad-card-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0 0 2px;
  }
  .ad-card-sub { font-size: 11px; color: #94A3B8; margin: 0; }

  /* Progress card */
  .ad-progress-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 24px;
    margin-bottom: 16px;
  }
  .ad-progress-label-row {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 4px;
  }
  .ad-progress-title {
    font-size: 16px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 16px;
  }
  .ad-progress-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .ad-progress-text { font-size: 13px; color: #64748B; }
  .ad-progress-val { font-size: 13px; font-weight: 700; color: #1E2D45; }
  .ad-progress-bg {
    height: 8px;
    background: #F1F5F9;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 24px;
  }
  .ad-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4F46E5, #7C3AED);
    border-radius: 10px;
    transition: width 0.5s ease;
  }
  .ad-rec-row {
    display: flex;
    gap: 0;
    border-top: 1px solid #F1F5F9;
    padding-top: 20px;
  }
  .ad-rec-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    border-right: 1px solid #F1F5F9;
    padding: 0 16px;
  }
  .ad-rec-item:first-child { padding-left: 0; }
  .ad-rec-item:last-child { border-right: none; padding-right: 0; }
  .ad-rec-value { font-size: 24px; font-weight: 800; }
  .ad-rec-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Link btn */
  .ad-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: none;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    color: #4F46E5;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    padding: 10px 18px;
    transition: background 0.15s, border-color 0.15s;
  }
  .ad-link-btn:hover { background: #EEF2FF; border-color: #C7D2FE; }

  @media (max-width: 1024px) {
    .ad-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .ad-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .ad-card { padding: 14px; gap: 12px; }
    .ad-card-icon { width: 42px; height: 42px; }
    .ad-card-value { font-size: 22px; }
    .ad-header { flex-direction: column; align-items: flex-start; }
    .ad-manage-btn { width: 100%; justify-content: center; }
    .ad-rec-row { flex-wrap: wrap; gap: 16px; }
    .ad-rec-item { border-right: none; flex: unset; width: calc(33% - 8px); }
    .ad-progress-card { padding: 18px; }
  }
`;

const STAT_CARDS = (stats) => [
  {
    icon: <Users size={24} />,
    label: 'Utilisateurs',
    value: stats?.total_users,
    color: '#4F46E5',
    bg: '#EEF2FF',
    sub: `${stats?.active_users} actifs · ${stats?.inactive_users} inactifs`,
  },
  {
    icon: <Briefcase size={24} />,
    label: 'Offres',
    value: stats?.total_jobs,
    color: '#10B981',
    bg: '#D1FAE5',
    sub: `${stats?.active_jobs} actives`,
  },
  {
    icon: <FileText size={24} />,
    label: 'CV total',
    value: stats?.total_resumes,
    color: '#F59E0B',
    bg: '#FEF3C7',
    sub: `${stats?.analyzed_resumes} analysés`,
  },
  {
    icon: <BarChart2 size={24} />,
    label: 'Score moyen',
    value: `${Math.round(stats?.average_score || 0)}/100`,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    sub: `${stats?.priority_count} prioritaires`,
  },
];

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
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
  }, [navigate, user?.role]);

  if (loading) return (
    <div className="ad-loading">
      <style>{`.ad-spin { animation: ad-rotate 0.8s linear infinite; } @keyframes ad-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <Loader2 size={18} color="#CBD5E1" className="ad-spin" /> Chargement...
    </div>
  );

  const pct = stats?.total_resumes > 0
    ? `${(stats.analyzed_resumes / stats.total_resumes) * 100}%`
    : '0%';

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <div className="ad-header">
        <div>
          <p className="ad-title-label">Administration</p>
          <h1 className="ad-title">Espace Administrateur</h1>
          <p className="ad-subtitle">Supervision globale de la plateforme SmartRecruit</p>
        </div>
        <button className="ad-manage-btn" onClick={() => navigate('/admin/users')}>
          <Users size={15} /> Gérer les utilisateurs
        </button>
      </div>

      {/* Stat cards */}
      <div className="ad-grid">
        {STAT_CARDS(stats).map((card) => (
          <div key={card.label} className="ad-card">
            <div className="ad-card-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <p className="ad-card-value" style={{ color: card.color }}>{card.value}</p>
              <p className="ad-card-label">{card.label}</p>
              <p className="ad-card-sub">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress card */}
      <div className="ad-progress-card">
        <p className="ad-progress-label-row">
          <BarChart2 size={12} /> Progression
        </p>
        <h3 className="ad-progress-title">Analyses des CV</h3>

        <div className="ad-progress-row">
          <span className="ad-progress-text">CV analysés</span>
          <span className="ad-progress-val">
            {stats?.analyzed_resumes} / {stats?.total_resumes}
          </span>
        </div>
        <div className="ad-progress-bg">
          <div className="ad-progress-fill" style={{ width: pct }} />
        </div>

        <div className="ad-rec-row">
          {[
            { label: 'Prioritaires', value: stats?.priority_count,  color: '#10B981', icon: <Star     size={11} /> },
            { label: 'Rejetés',      value: stats?.rejected_count,  color: '#EF4444', icon: <XCircle  size={11} /> },
            { label: 'En attente',   value: stats?.pending_resumes, color: '#F59E0B', icon: <Clock    size={11} /> },
          ].map((item) => (
            <div key={item.label} className="ad-rec-item">
              <span className="ad-rec-value" style={{ color: item.color }}>{item.value}</span>
              <span className="ad-rec-label">{item.icon} {item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Link */}
      <button className="ad-link-btn" onClick={() => navigate('/admin/analyses')}>
        <Search size={14} /> Voir toutes les analyses <ArrowRight size={14} />
      </button>
    </>
  );
}