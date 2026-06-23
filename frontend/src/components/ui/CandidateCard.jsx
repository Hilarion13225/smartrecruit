import { resumesAPI } from '../../api/resumes';
import toast from 'react-hot-toast';
import {
  Star, CheckCircle2, AlertTriangle, XCircle,
  Mail, Calendar, Trash2, Clock, ClipboardList,
} from 'lucide-react';

const css = `
  .cc-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 20px;
    display: grid;
    grid-template-columns: 200px 1fr 160px;
    gap: 20px;
    align-items: center;
    transition: box-shadow 0.15s, transform 0.15s;
  }
  .cc-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.07);
    transform: translateY(-1px);
  }

  /* Left */
  .cc-left { display: flex; align-items: flex-start; gap: 12px; }
  .cc-rank {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #EEF2FF;
    color: #4F46E5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }
  .cc-name {
    font-size: 14px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 3px;
  }
  .cc-email {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #64748B;
    margin: 0 0 3px;
  }
  .cc-date {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #94A3B8;
    margin: 0 0 8px;
  }
  .cc-delete-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    background: #FFF5F5;
    color: #E53E3E;
    border: 1px solid #FED7D7;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .cc-delete-btn:hover { background: #FED7D7; }

  /* Center */
  .cc-scores { display: flex; flex-direction: column; gap: 7px; }
  .cc-bar-item {}
  .cc-bar-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
  }
  .cc-bar-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .cc-bar-val { font-size: 11px; font-weight: 700; color: #1E2D45; }
  .cc-bar-bg {
    height: 5px;
    background: #F1F5F9;
    border-radius: 10px;
    overflow: hidden;
  }
  .cc-bar-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.5s ease;
  }
  .cc-no-analysis {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #94A3B8;
    font-style: italic;
    justify-content: center;
  }

  /* Right */
  .cc-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .cc-total-score { display: flex; align-items: baseline; gap: 2px; }
  .cc-score-num { font-size: 36px; font-weight: 800; color: #1E2D45; }
  .cc-score-max { font-size: 13px; color: #94A3B8; }
  .cc-rec-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-align: center;
  }
  .cc-missing { width: 100%; }
  .cc-missing-title {
    font-size: 10px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 5px;
  }
  .cc-missing-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .cc-missing-tag {
    padding: 2px 8px;
    background: #FFF5F5;
    color: #E53E3E;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid #FED7D7;
  }
  .cc-status-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #94A3B8;
    font-style: italic;
  }

  @media (max-width: 900px) {
    .cc-card {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
    }
    .cc-left { grid-column: 1 / -1; }
  }
  @media (max-width: 600px) {
    .cc-card {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .cc-right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; gap: 12px; }
    .cc-score-num { font-size: 28px; }
  }
`;

const REC_CONFIG = {
  priority: { label: 'Prioritaire', bg: '#D1FAE5', color: '#065F46', icon: <Star     size={12} /> },
  possible: { label: 'Possible',    bg: '#DBEAFE', color: '#1E40AF', icon: <CheckCircle2  size={12} /> },
  reserve:  { label: 'Réserve',     bg: '#FEF3C7', color: '#92400E', icon: <AlertTriangle size={12} /> },
  rejected: { label: 'Rejeté',      bg: '#FEE2E2', color: '#991B1B', icon: <XCircle   size={12} /> },
};

const SCORE_BARS = [
  { label: 'Compétences', key: 'score_skills',     color: '#4F46E5' },
  { label: 'Expérience',  key: 'score_experience', color: '#10B981' },
  { label: 'Formation',   key: 'score_education',  color: '#F59E0B' },
  { label: 'Sémantique',  key: 'score_semantic',   color: '#8B5CF6' },
];

function ScoreBar({ label, value, color }) {
  return (
    <div className="cc-bar-item">
      <div className="cc-bar-header">
        <span className="cc-bar-label">{label}</span>
        <span className="cc-bar-val">{value?.toFixed(0)}%</span>
      </div>
      <div className="cc-bar-bg">
        <div className="cc-bar-fill" style={{ width: `${value || 0}%`, background: color }} />
      </div>
    </div>
  );
}

export default function CandidateCard({ resume, rank, onDelete }) {
  const analysis = resume.analysis;
  const rec = analysis ? REC_CONFIG[analysis.recommendation] : null;

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer le CV de ${resume.candidate_name} ?`)) return;
    try {
      await resumesAPI.delete(resume.id);
      toast.success('CV supprimé avec succès !');
      onDelete(resume.id);
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="cc-card">

        {/* Gauche */}
        <div className="cc-left">
          <div className="cc-rank">#{rank}</div>
          <div>
            <h3 className="cc-name">{resume.candidate_name}</h3>
            {resume.candidate_email && (
              <p className="cc-email">
                <Mail size={11} color="#94A3B8" /> {resume.candidate_email}
              </p>
            )}
            <p className="cc-date">
              <Calendar size={11} color="#94A3B8" />
              {new Date(resume.uploaded_at).toLocaleDateString('fr-FR')}
            </p>
            <button className="cc-delete-btn" onClick={handleDelete}>
              <Trash2 size={11} /> Supprimer
            </button>
          </div>
        </div>

        {/* Centre */}
        {analysis ? (
          <div className="cc-scores">
            {SCORE_BARS.map((bar) => (
              <ScoreBar
                key={bar.key}
                label={bar.label}
                value={analysis[bar.key]}
                color={bar.color}
              />
            ))}
          </div>
        ) : (
          <div className="cc-no-analysis">
            {resume.status === 'analyzing'
              ? <><Clock size={14} /> Analyse en cours...</>
              : <><ClipboardList size={14} /> En attente d'analyse</>
            }
          </div>
        )}

        {/* Droite */}
        <div className="cc-right">
          {analysis ? (
            <>
              <div className="cc-total-score">
                <span className="cc-score-num">{analysis.score_total?.toFixed(0)}</span>
                <span className="cc-score-max">/100</span>
              </div>

              {rec && (
                <span className="cc-rec-badge" style={{ background: rec.bg, color: rec.color }}>
                  {rec.icon} {rec.label}
                </span>
              )}

              {analysis.missing_skills?.length > 0 && (
                <div className="cc-missing">
                  <p className="cc-missing-title">Manque</p>
                  <div className="cc-missing-tags">
                    {analysis.missing_skills.slice(0, 3).map((s) => (
                      <span key={s} className="cc-missing-tag">{s}</span>
                    ))}
                    {analysis.missing_skills.length > 3 && (
                      <span className="cc-missing-tag">+{analysis.missing_skills.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="cc-status-badge">
              {resume.status === 'pending'
                ? <><Clock size={13} /> En attente</>
                : <><Clock size={13} /> Analyse...</>
              }
            </div>
          )}
        </div>

      </div>
    </>
  );
}