import { useState } from 'react';
import { resumesAPI } from '../../api/resumes';
import toast from 'react-hot-toast';
import {
  Star, CheckCircle2, AlertTriangle, XCircle,
  Mail, Calendar, Trash2, Clock, AlertCircle,
  RefreshCw,
} from 'lucide-react';

const css = `
  .cc-card {
    background: var(--color-background-primary, #fff);
    border: 0.5px solid var(--color-border-tertiary, #F1F5F9);
    border-radius: 12px;
    padding: 20px;
    display: grid;
    grid-template-columns: 32px 280px 1fr 170px;
    gap: 20px;
    align-items: center;
    transition: box-shadow 0.15s, border-color 0.15s;
    cursor: pointer;
  }
  .cc-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .cc-card.cc-selected {
    border-color: #4F46E5;
    background: #F5F3FF;
  }
  .cc-card.cc-error-card {
    border-color: #FED7AA;
    background: #FFFBF5;
  }
  .cc-card.cc-error-card.cc-selected {
    border-color: #4F46E5;
    background: #F5F3FF;
  }
  .cc-checkbox {
    width: 18px; height: 18px;
    border: 1.5px solid #CBD5E1;
    border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; cursor: pointer;
    transition: all 0.15s;
    background: #fff;
  }
  .cc-checkbox.checked {
    background: #4F46E5;
    border-color: #4F46E5;
  }
  .cc-checkbox.checked::after {
    content: '';
    width: 5px; height: 9px;
    border: 2px solid #fff;
    border-top: none; border-left: none;
    transform: rotate(45deg) translateY(-1px);
    display: block;
  }
  .cc-left { display: flex; align-items: flex-start; gap: 12px; }
  .cc-rank {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 500; flex-shrink: 0;
  }
  .cc-name {
    font-size: 14px; font-weight: 500;
    color: var(--color-text-primary);
    margin: 0 0 4px;
    white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; max-width: 220px;
  }
  .cc-meta {
    font-size: 12px; color: var(--color-text-secondary);
    margin: 0 0 3px; display: flex; align-items: center; gap: 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 220px;
  }
  .cc-date {
    font-size: 11px; color: var(--color-text-tertiary);
    margin: 0 0 10px; display: flex; align-items: center; gap: 4px;
  }
  .cc-btn-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .cc-delete-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; background: var(--color-background-danger);
    color: var(--color-text-danger); border: 0.5px solid var(--color-border-danger);
    border-radius: 8px; font-size: 11px; font-weight: 500; cursor: pointer;
    transition: opacity 0.15s;
  }
  .cc-retry-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; background: #FFF7ED;
    color: #C2410C; border: 0.5px solid #FED7AA;
    border-radius: 8px; font-size: 11px; font-weight: 500; cursor: pointer;
    transition: background 0.15s;
  }
  .cc-retry-btn:hover { background: #FFEDD5; }
  .cc-retry-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .cc-retry-btn .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .cc-scores { display: flex; flex-direction: column; gap: 8px; }
  .cc-bar-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .cc-bar-label {
    font-size: 11px; font-weight: 500;
    color: var(--color-text-tertiary);
    text-transform: uppercase; letter-spacing: .06em;
  }
  .cc-bar-val { font-size: 11px; font-weight: 500; color: var(--color-text-primary); }
  .cc-bar-bg {
    height: 5px; background: var(--color-background-secondary);
    border-radius: 10px; overflow: hidden;
  }
  .cc-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
  .cc-error-box {
    display: flex; flex-direction: column; align-items: center;
    gap: 6px; justify-content: center;
  }
  .cc-error-title {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 500; color: #C2410C;
  }
  .cc-error-desc {
    font-size: 11px; color: var(--color-text-tertiary);
    text-align: center; line-height: 1.5;
  }
  .cc-pending-box {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--color-text-tertiary);
    font-style: italic; justify-content: center;
  }
  .cc-right {
    display: flex; flex-direction: column;
    align-items: center; gap: 8px;
  }
  .cc-total-score { display: flex; align-items: baseline; gap: 2px; }
  .cc-score-num { font-size: 40px; font-weight: 500; color: var(--color-text-primary); }
  .cc-score-max { font-size: 13px; color: var(--color-text-tertiary); }
  .cc-rec-badge {
    display: flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 20px;
    font-size: 11px; font-weight: 500;
  }
  .cc-missing-title {
    font-size: 10px; font-weight: 500;
    color: var(--color-text-tertiary);
    text-transform: uppercase; letter-spacing: .08em; margin: 0 0 5px;
  }
  .cc-missing-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .cc-missing-tag {
    padding: 2px 8px; background: var(--color-background-danger);
    color: var(--color-text-danger); border-radius: 8px;
    font-size: 11px; border: 0.5px solid var(--color-border-danger);
  }
  .cc-pending-badge {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 500;
    background: var(--color-background-secondary);
    color: var(--color-text-secondary);
  }
  .cc-error-badge {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 500;
    background: #FFF7ED; color: #C2410C;
    border: 0.5px solid #FED7AA;
  }

  @media (max-width: 900px) {
    .cc-card { grid-template-columns: 32px 1fr 1fr; grid-template-rows: auto auto; }
    .cc-left { grid-column: 2 / -1; }
    .cc-right { align-items: flex-start; }
    .cc-name { max-width: 100%; }
    .cc-meta { max-width: 100%; }
  }
  @media (max-width: 600px) {
    .cc-card { grid-template-columns: 32px 1fr; gap: 16px; padding: 16px; }
    .cc-left { grid-column: 2 / 3; }
    .cc-scores { grid-column: 1 / -1; }
    .cc-right { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 12px; }
    .cc-score-num { font-size: 32px; }
    .cc-name { max-width: 100%; }
    .cc-meta { max-width: 100%; }
    .cc-error-box { align-items: flex-start; }
    .cc-pending-box { justify-content: flex-start; }
  }
  @media (max-width: 400px) {
    .cc-card { padding: 14px; gap: 12px; }
    .cc-score-num { font-size: 28px; }
    .cc-bar-label { font-size: 10px; }
    .cc-delete-btn, .cc-retry-btn { flex: 1; justify-content: center; }
  }
`;

const REC_CONFIG = {
  priority: { label: 'Prioritaire', bg: '#D1FAE5', color: '#065F46', icon: <Star size={11} /> },
  possible: { label: 'Possible',    bg: '#DBEAFE', color: '#1E40AF', icon: <CheckCircle2 size={11} /> },
  reserve:  { label: 'Réserve',     bg: '#FEF3C7', color: '#92400E', icon: <AlertTriangle size={11} /> },
  rejected: { label: 'Rejeté',      bg: '#FEE2E2', color: '#991B1B', icon: <XCircle size={11} /> },
};

const SCORE_BARS = [
  { label: 'Compétences', key: 'score_skills',     color: '#4F46E5' },
  { label: 'Expérience',  key: 'score_experience', color: '#10B981' },
  { label: 'Formation',   key: 'score_education',  color: '#F59E0B' },
  { label: 'Sémantique',  key: 'score_semantic',   color: '#8B5CF6' },
];

const ERROR_MESSAGES = {
  scanned:  { title: 'PDF scanné', desc: 'Le texte ne peut pas être extrait automatiquement.' },
  download: { title: 'Téléchargement échoué', desc: "Impossible d'accéder au fichier. Réessayez." },
  default:  { title: 'Analyse échouée', desc: "Une erreur est survenue lors de l'analyse." },
};

function getErrorType(resume) {
  if (resume.raw_text === '') return 'scanned';
  return 'default';
}

function ScoreBar({ label, value, color }) {
  return (
    <div>
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

export default function CandidateCard({ resume, rank, onDelete, onRetry, selected, onSelect }) {
  const analysis = resume.analysis;
  const rec = analysis ? REC_CONFIG[analysis.recommendation] : null;
  const isError = resume.status === 'error';
  const [retrying, setRetrying] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer le CV de ${resume.candidate_name} ?`)) return;
    try {
      await resumesAPI.delete(resume.id);
      toast.success('CV supprimé !');
      onDelete(resume.id);
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleRetry = async (e) => {
    e.stopPropagation();
    setRetrying(true);
    try {
      await resumesAPI.retry(resume.id);
      toast.success('Analyse relancée !');
      onRetry(resume.id);
    } catch {
      toast.error("Impossible de relancer l'analyse.");
    } finally {
      setRetrying(false);
    }
  };

  const errorType = isError ? getErrorType(resume) : null;
  const errorMsg = errorType ? ERROR_MESSAGES[errorType] : null;

  return (
    <>
      <style>{css}</style>
      <div
        className={`cc-card${isError ? ' cc-error-card' : ''}${selected ? ' cc-selected' : ''}`}
        onClick={() => onSelect(resume.id)}
      >
        {/* ── Checkbox ── */}
        <div
          className={`cc-checkbox${selected ? ' checked' : ''}`}
          onClick={(e) => { e.stopPropagation(); onSelect(resume.id); }}
        />

        {/* ── Gauche ── */}
        <div className="cc-left">
          <div className="cc-rank" style={{
            background: rank === 1 ? 'var(--color-background-info)' : 'var(--color-background-secondary)',
            color: rank === 1 ? 'var(--color-text-info)' : 'var(--color-text-secondary)',
          }}>
            #{rank}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="cc-name" title={resume.candidate_name}>
              {resume.candidate_name}
            </p>
            {resume.candidate_email && (
              <p className="cc-meta">
                <Mail size={11} style={{ flexShrink: 0 }} />
                {resume.candidate_email}
              </p>
            )}
            <p className="cc-date">
              <Calendar size={11} style={{ flexShrink: 0 }} />
              {new Date(resume.uploaded_at).toLocaleDateString('fr-FR')}
            </p>
            <div className="cc-btn-row">
              <button className="cc-delete-btn" onClick={handleDelete}>
                <Trash2 size={11} /> Supprimer
              </button>
              {isError && errorType !== 'scanned' && (
                <button className="cc-retry-btn" onClick={handleRetry} disabled={retrying}>
                  <RefreshCw size={11} className={retrying ? 'spin' : ''} />
                  {retrying ? 'En cours...' : 'Réessayer'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Centre ── */}
        {isError ? (
          <div className="cc-error-box">
            <p className="cc-error-title">
              <AlertCircle size={15} color="#C2410C" />
              {errorMsg?.title}
            </p>
            <p className="cc-error-desc">{errorMsg?.desc}</p>
            {errorType === 'scanned' && (
              <p className="cc-error-desc" style={{ color: '#F59E0B', fontStyle: 'italic' }}>
                💡 Convertissez ce PDF en texte avant de le réuploader.
              </p>
            )}
          </div>
        ) : analysis ? (
          <div className="cc-scores">
            {SCORE_BARS.map((bar) => (
              <ScoreBar key={bar.key} label={bar.label} value={analysis[bar.key]} color={bar.color} />
            ))}
          </div>
        ) : (
          <div className="cc-pending-box">
            <Clock size={14} />
            {resume.status === 'analyzing' ? 'Analyse en cours...' : "En attente d'analyse"}
          </div>
        )}

        {/* ── Droite ── */}
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
                <div style={{ width: '100%' }}>
                  <p className="cc-missing-title">Manque</p>
                  <div className="cc-missing-tags">
                    {analysis.missing_skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="cc-missing-tag">{skill}</span>
                    ))}
                    {analysis.missing_skills.length > 3 && (
                      <span className="cc-missing-tag">+{analysis.missing_skills.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : isError ? (
            <span className="cc-error-badge">
              <AlertTriangle size={11} /> Erreur
            </span>
          ) : (
            <span className="cc-pending-badge">
              <Clock size={11} />
              {resume.status === 'analyzing' ? 'Analyse...' : 'En attente'}
            </span>
          )}
        </div>
      </div>
    </>
  );
}