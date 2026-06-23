import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Star, CheckCircle2, AlertTriangle,
  XCircle, Search, Loader2,
} from 'lucide-react';

const css = `
  .aa-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 60vh;
    color: #94A3B8;
    font-size: 14px;
  }

  /* Header */
  .aa-header { margin-bottom: 24px; }
  .aa-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: #fff;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
    cursor: pointer;
    margin-bottom: 14px;
    transition: background 0.15s, color 0.15s;
  }
  .aa-back-btn:hover { background: #F8FAFC; color: #1E2D45; }
  .aa-title-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 4px;
  }
  .aa-title {
    font-size: 22px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 4px;
  }
  .aa-subtitle { font-size: 13px; color: #94A3B8; margin: 0; }

  /* Filters */
  .aa-filters {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .aa-filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    border: 1.5px solid #E2E8F0;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    background: #fff;
    color: #64748B;
    transition: all 0.15s;
    letter-spacing: 0.02em;
  }
  .aa-filter-btn:hover { border-color: #C7D2FE; color: #4F46E5; }
  .aa-filter-btn.active {
    background: #1E2D45;
    color: #fff;
    border-color: #1E2D45;
  }

  /* Table */
  .aa-table-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    overflow: hidden;
  }
  .aa-table { width: 100%; border-collapse: collapse; }
  .aa-thead { background: #F8FAFC; }
  .aa-th {
    padding: 12px 16px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid #F1F5F9;
  }
  .aa-tr { border-bottom: 1px solid #F8FAFC; transition: background 0.1s; }
  .aa-tr:hover { background: #FAFBFF; }
  .aa-tr:last-child { border-bottom: none; }
  .aa-td { padding: 13px 16px; vertical-align: middle; }

  .aa-candidate-name {
    font-size: 13px;
    font-weight: 700;
    color: #1E2D45;
  }
  .aa-cell-text { font-size: 13px; color: #64748B; }

  /* Score cell */
  .aa-score-cell { display: flex; align-items: center; gap: 8px; }
  .aa-score-num {
    font-size: 14px;
    font-weight: 800;
    color: #1E2D45;
    width: 30px;
    flex-shrink: 0;
  }
  .aa-score-bar-bg {
    flex: 1;
    height: 5px;
    background: #F1F5F9;
    border-radius: 10px;
    overflow: hidden;
    min-width: 60px;
  }
  .aa-score-bar-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.5s ease;
  }

  /* Rec badge */
  .aa-rec-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  /* Empty */
  .aa-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 48px;
    color: #94A3B8;
    font-size: 14px;
  }

  /* Scroll on small screens */
  .aa-table-scroll { overflow-x: auto; }

  @media (max-width: 768px) {
    .aa-th, .aa-td { padding: 10px 12px; }
    .aa-title { font-size: 18px; }
    .aa-score-bar-bg { min-width: 40px; }
  }
`;

const REC_CONFIG = {
  priority: { label: 'Prioritaire', bg: '#D1FAE5', color: '#065F46', icon: <Star         size={11} /> },
  possible: { label: 'Possible',    bg: '#DBEAFE', color: '#1E40AF', icon: <CheckCircle2  size={11} /> },
  reserve:  { label: 'Réserve',     bg: '#FEF3C7', color: '#92400E', icon: <AlertTriangle size={11} /> },
  rejected: { label: 'Rejeté',      bg: '#FEE2E2', color: '#991B1B', icon: <XCircle       size={11} /> },
};

const FILTERS = [
  { key: 'all',      label: 'Toutes',       icon: null },
  { key: 'priority', label: 'Prioritaires', icon: <Star         size={12} /> },
  { key: 'possible', label: 'Possibles',    icon: <CheckCircle2  size={12} /> },
  { key: 'reserve',  label: 'Réserve',      icon: <AlertTriangle size={12} /> },
  { key: 'rejected', label: 'Rejetés',      icon: <XCircle       size={12} /> },
];

function scoreColor(score) {
  if (score >= 75) return '#10B981';
  if (score >= 55) return '#4F46E5';
  if (score >= 35) return '#F59E0B';
  return '#EF4444';
}

export default function AdminAnalyses() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
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

  if (loading) return (
    <div className="aa-loading">
      <Loader2 size={18} color="#CBD5E1" className="aa-spin" /> Chargement...
      <style>{`
        .aa-spin { animation: aa-rotate 0.8s linear infinite; }
        @keyframes aa-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <div className="aa-header">
        <button className="aa-back-btn" onClick={() => navigate('/admin')}>
          <ArrowLeft size={13} /> Retour
        </button>
        <p className="aa-title-label">Administration</p>
        <h1 className="aa-title">Supervision des analyses</h1>
        <p className="aa-subtitle">{analyses.length} analyse(s) — 50 plus récentes</p>
      </div>

      {/* Filters */}
      <div className="aa-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`aa-filter-btn${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="aa-table-card">
        <div className="aa-table-scroll">
          <table className="aa-table">
            <thead className="aa-thead">
              <tr>
                {['Candidat', 'Poste', 'Recruteur', 'Score', 'Recommandation', 'Date'].map((h) => (
                  <th key={h} className="aa-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const rec = REC_CONFIG[a.recommendation];
                return (
                  <tr key={a.id} className="aa-tr">
                    <td className="aa-td">
                      <span className="aa-candidate-name">{a.candidate_name}</span>
                    </td>
                    <td className="aa-td">
                      <span className="aa-cell-text">{a.job_title}</span>
                    </td>
                    <td className="aa-td">
                      <span className="aa-cell-text">{a.recruiter}</span>
                    </td>
                    <td className="aa-td">
                      <div className="aa-score-cell">
                        <span className="aa-score-num">{a.score_total?.toFixed(0)}</span>
                        <div className="aa-score-bar-bg">
                          <div
                            className="aa-score-bar-fill"
                            style={{
                              width: `${a.score_total || 0}%`,
                              background: scoreColor(a.score_total),
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="aa-td">
                      {rec && (
                        <span
                          className="aa-rec-badge"
                          style={{ background: rec.bg, color: rec.color }}
                        >
                          {rec.icon} {rec.label}
                        </span>
                      )}
                    </td>
                    <td className="aa-td">
                      <span className="aa-cell-text">
                        {new Date(a.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="aa-empty">
              <Search size={28} color="#E2E8F0" />
              Aucune analyse trouvée.
            </div>
          )}
        </div>
      </div>
    </>
  );
}