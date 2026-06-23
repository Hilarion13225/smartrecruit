import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Briefcase, FileText, Bot, Star,
  Plus, ArrowRight, Clock, Users, BarChart2,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';
 
const css = `
  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .dash-title {
    font-size: 24px;
    font-weight: 700;
    color: #1F2937;
    margin: 0 0 4px;
  }
  .dash-subtitle {
    font-size: 14px;
    color: #6B7280;
    margin: 0;
  }
  .new-job-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    background: #4F46E5;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
  }
  .new-job-btn:hover { background: #4338CA; }
 
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .stat-card {
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1px solid #F1F5F9;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .stat-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .stat-value {
    font-size: 26px;
    font-weight: 800;
    color: #1F2937;
    margin: 0 0 2px;
  }
  .stat-label {
    font-size: 12px;
    color: #6B7280;
    margin: 0;
  }
 
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  .card {
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    border: 1px solid #F1F5F9;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
    color: #1F2937;
    margin: 0 0 16px;
  }
  .score-center { position: relative; }
  .score-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -20%);
    text-align: center;
    pointer-events: none;
  }
  .score-number {
    display: block;
    font-size: 32px;
    font-weight: 800;
    color: #1F2937;
  }
  .score-sub {
    font-size: 13px;
    color: #9CA3AF;
  }
  .no-data {
    text-align: center;
    padding: 40px 20px;
    color: #9CA3AF;
    font-size: 14px;
    font-style: italic;
  }
  .recent-list { display: flex; flex-direction: column; gap: 8px; }
  .recent-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: #F9FAFB;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s;
    gap: 8px;
  }
  .recent-item:hover { background: #F1F5F9; }
  .recent-title { font-size: 13px; font-weight: 600; color: #1F2937; margin: 0 0 2px; }
  .recent-meta { font-size: 11px; color: #9CA3AF; margin: 0; }
  .recent-badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .see-all-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 12px;
    background: none;
    border: none;
    color: #4F46E5;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    transition: gap 0.15s;
  }
  .see-all-btn:hover { gap: 8px; }
 
  .empty-state {
    background: #fff;
    border-radius: 16px;
    padding: 60px 40px;
    text-align: center;
    border: 1px solid #F1F5F9;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
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
  .empty-title { font-size: 18px; font-weight: 700; color: #1F2937; margin: 0 0 8px; }
  .empty-text { font-size: 14px; color: #6B7280; max-width: 360px; margin: 0 auto 24px; }
 
  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    color: #6B7280;
    font-size: 15px;
    gap: 10px;
  }
 
  @media (max-width: 1024px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .charts-row { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .charts-row { grid-template-columns: 1fr; gap: 16px; }
    .dash-title { font-size: 20px; }
  }
  @media (max-width: 640px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .stat-card { padding: 14px; gap: 12px; }
    .stat-icon-wrap { width: 42px; height: 42px; }
    .stat-value { font-size: 22px; }
    .card { padding: 16px; }
    .empty-state { padding: 40px 20px; }
  }
`;
 
const STAT_CARDS = (stats) => [
  { icon: <Briefcase size={22} />, label: 'Offres actives',  value: stats.total_jobs,           color: '#4F46E5', bg: '#EEF2FF' },
  { icon: <FileText  size={22} />, label: 'CV importés',     value: stats.total_resumes,         color: '#6366F1', bg: '#EEF2FF' },
  { icon: <Bot       size={22} />, label: 'CV analysés',     value: stats.analyzed_resumes,      color: '#10B981', bg: '#D1FAE5' },
  { icon: <Star      size={22} />, label: 'Prioritaires',    value: stats.priority_candidates,   color: '#F59E0B', bg: '#FEF3C7' },
];
 
const PIE_DATA = (stats) => [
  { name: 'Prioritaire', value: stats.priority_candidates, color: '#10B981' },
  { name: 'Possible',    value: stats.possible_candidates, color: '#4F46E5' },
  { name: 'Réserve',     value: stats.reserve_candidates,  color: '#F59E0B' },
  { name: 'Rejeté',      value: stats.rejected_candidates, color: '#EF4444' },
].filter((d) => d.value > 0);
 
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
 
  if (loading) return (
    <div className="loading-screen">
      <Bot size={20} color="#4F46E5" />
      Chargement...
    </div>
  );
 
  const pieData   = stats ? PIE_DATA(stats)   : [];
  const statCards = stats ? STAT_CARDS(stats) : [];
 
  return (
    <>
      <style>{css}</style>
 
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">
            Bonjour, {user?.first_name || user?.username} 👋
          </h1>
          <p className="dash-subtitle">
            Voici un aperçu de votre activité de recrutement
          </p>
        </div>
        <button className="new-job-btn" onClick={() => navigate('/jobs/new')}>
          <Plus size={16} />
          Nouvelle offre
        </button>
      </div>
 
      {/* Stat cards */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
 
      {/* Charts row */}
      <div className="charts-row">
 
        {/* Score moyen */}
        <div className="card">
          <h3 className="card-title">
            <BarChart2 size={17} color="#4F46E5" />
            Score moyen des candidats
          </h3>
          {stats?.average_score > 0 ? (
            <div className="score-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={[{ value: Math.round(stats.average_score), fill: '#4F46E5' }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="score-overlay">
                <span className="score-number">{Math.round(stats.average_score)}</span>
                <span className="score-sub">/100</span>
              </div>
            </div>
          ) : (
            <div className="no-data">Aucune analyse disponible</div>
          )}
        </div>
 
        {/* Répartition candidats */}
        <div className="card">
          <h3 className="card-title">
            <Users size={17} color="#4F46E5" />
            Répartition des candidats
          </h3>
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
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} candidat(s)`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Aucune analyse disponible</div>
          )}
        </div>
 
        {/* Offres récentes */}
        <div className="card">
          <h3 className="card-title">
            <Clock size={17} color="#4F46E5" />
            Offres récentes
          </h3>
          {stats?.recent_jobs?.length === 0 ? (
            <div className="no-data">Aucune offre créée</div>
          ) : (
            <div className="recent-list">
              {stats?.recent_jobs?.map((job) => (
                <div
                  key={job.id}
                  className="recent-item"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div>
                    <p className="recent-title">{job.title}</p>
                    <p className="recent-meta">{job.analyzed_count}/{job.resumes_count} CV analysés</p>
                  </div>
                  <span
                    className="recent-badge"
                    style={job.status === 'active'
                      ? { background: '#D1FAE5', color: '#065F46' }
                      : { background: '#FEF3C7', color: '#92400E' }}
                  >
                    {job.status === 'active' ? 'Active' : 'Brouillon'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button className="see-all-btn" onClick={() => navigate('/jobs')}>
            Voir toutes les offres <ArrowRight size={14} />
          </button>
        </div>
      </div>
 
      {/* Empty state */}
      {stats?.total_resumes === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Briefcase size={28} color="#4F46E5" />
          </div>
          <h3 className="empty-title">Commencez votre premier recrutement</h3>
          <p className="empty-text">
            Créez une offre, importez des CV et laissez l'IA faire le tri !
          </p>
          <button className="new-job-btn" onClick={() => navigate('/jobs/new')}>
            <Plus size={16} />
            Créer une offre
          </button>
        </div>
      )}
    </>
  );
}