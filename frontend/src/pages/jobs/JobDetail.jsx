import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import { resumesAPI } from '../../api/resumes';
import toast from 'react-hot-toast';
import UploadZone from '../../components/ui/UploadZone';
import CandidateCard from '../../components/ui/CandidateCard';
import {
  ArrowLeft, GraduationCap, Clock, FileText,
  Users, Upload, Wrench, Bot, Download,
  FileDown, Briefcase,
} from 'lucide-react';

const css = `
  @keyframes pulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.08); opacity: .85; }
  }
  @keyframes jd-breathe {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(1.08); }
  }
  @keyframes jd-ping {
    0%   { transform: scale(0.9); opacity: 0.7; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  @keyframes jd-typing {
    0%,80%,100% { transform: translateY(0);   opacity: 0.3; }
    40%          { transform: translateY(-8px); opacity: 1; }
  }
  @keyframes jd-fade {
    0%,100% { opacity: 0.5; }
    50%      { opacity: 1; }
  }

  .jd-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 20px;
  }

  .jd-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }
  .jd-back-btn {
    display: flex;
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
    white-space: nowrap;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .jd-back-btn:hover { background: #F8FAFC; color: #1E2D45; }
  .jd-header-info { flex: 1; min-width: 0; }
  .jd-title-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 4px;
  }
  .jd-title {
    font-size: 22px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 8px;
    overflow-wrap: break-word;
    word-break: normal;
    hyphens: none;
  }
  .jd-meta-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .jd-meta-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #64748B;
  }
  .jd-header-actions {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .jd-analyze-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 18px;
    background: #10B981;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
  }
  .jd-analyze-btn:hover:not(:disabled) { background: #059669; }
  .jd-analyze-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .jd-export-csv {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: #fff;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #10B981;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, border-color 0.15s;
  }
  .jd-export-csv:hover { background: #F0FDF4; border-color: #A7F3D0; }
  .jd-export-pdf {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: #fff;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #EF4444;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, border-color 0.15s;
  }
  .jd-export-pdf:hover { background: #FFF5F5; border-color: #FED7D7; }

  .jd-stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .jd-stat-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #F1F5F9;
    padding: 16px 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .jd-stat-value { font-size: 28px; font-weight: 800; }
  .jd-stat-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .jd-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 24px;
    background: #F1F5F9;
    padding: 4px;
    border-radius: 12px;
    width: fit-content;
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .jd-tabs::-webkit-scrollbar { display: none; }
  .jd-tab {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border: none;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    background: transparent;
    color: #64748B;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .jd-tab:hover { color: #1E2D45; }
  .jd-tab.active {
    background: #fff;
    color: #4F46E5;
    font-weight: 700;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }

  .jd-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 24px;
  }
  .jd-card-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 8px;
  }
  .jd-card-title { font-size: 16px; font-weight: 700; color: #1E2D45; margin: 0 0 16px; }
  .jd-skill-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
  .jd-skill-tag {
    padding: 5px 14px;
    background: #EEF2FF;
    color: #4F46E5;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .jd-description { font-size: 14px; color: #64748B; line-height: 1.7; margin: 0; }

  .jd-empty {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 64px 40px;
    text-align: center;
  }
  .jd-empty-icon {
    width: 64px; height: 64px;
    background: #EEF2FF;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }
  .jd-empty-title { font-size: 18px; font-weight: 700; color: #1E2D45; margin: 0 0 8px; }
  .jd-empty-text { font-size: 14px; color: #94A3B8; max-width: 360px; margin: 0 auto 24px; }
  .jd-import-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 11px 22px; background: #1E2D45; color: #fff;
    border: none; border-radius: 10px; font-size: 13px;
    font-weight: 700; cursor: pointer; transition: background 0.15s;
  }
  .jd-import-btn:hover { background: #2D4263; }
  .jd-candidate-list { display: flex; flex-direction: column; gap: 12px; }

  .jd-progress-wrap {
    background: #fff;
    border: 1px solid #F1F5F9;
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  .jd-progress-track {
    height: 4px;
    background: #F1F5F9;
    border-radius: 10px;
    overflow: hidden;
  }
  .jd-progress-fill {
    height: 100%;
    background: #10B981;
    border-radius: 10px;
    transition: width 0.15s ease;
  }
  .jd-progress-steps { display: flex; gap: 6px; }
  .jd-progress-step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .jd-step-bar {
    width: 100%;
    height: 4px;
    border-radius: 10px;
    transition: background 0.3s;
  }
  .jd-step-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    transition: color 0.3s;
  }
  .jd-progress-status {
    font-size: 12px;
    color: #64748B;
    margin: 0;
    text-align: center;
  }

  @media (max-width: 900px) {
    .jd-stats-row { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }
  @media (max-width: 768px) {
    .jd-header { flex-direction: column; gap: 12px; }
    .jd-back-btn { align-self: flex-start; }
    .jd-title { font-size: 17px; }
    .jd-meta-row { gap: 8px; }
    .jd-meta-chip { font-size: 11px; }
    .jd-header-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      width: 100%;
    }
    .jd-analyze-btn { grid-column: 1 / -1; justify-content: center; }
    .jd-export-csv, .jd-export-pdf { justify-content: center; font-size: 12px; padding: 9px 8px; }
    .jd-stats-row { grid-template-columns: repeat(2, 1fr) !important; gap: 8px; margin-bottom: 16px; }
    .jd-stat-card { padding: 10px 8px; }
    .jd-stat-value { font-size: 20px; }
    .jd-stat-label { font-size: 9px; }
    .jd-tabs { width: 100%; box-sizing: border-box; }
    .jd-tab { padding: 8px 10px; font-size: 11px; gap: 4px; }
    .jd-card { padding: 14px; }
    .jd-empty { padding: 36px 16px; }
    .jd-candidate-list { gap: 10px; }
    .cc-card { grid-template-columns: 1fr !important; gap: 12px !important; padding: 14px !important; }
    .cc-name { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; max-width: 220px !important; display: block !important; }
    .cc-email { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; max-width: 220px !important; }
    .cc-right { flex-direction: row !important; align-items: center !important; flex-wrap: wrap; gap: 10px !important; border-top: 1px solid #F1F5F9; padding-top: 12px; }
    .cc-total-score { flex-shrink: 0; }
    .cc-score-num { font-size: 24px !important; }
    .cc-missing { width: 100%; }
  }
  @media (max-width: 480px) {
    .jd-title { font-size: 15px; }
    .jd-header-actions { grid-template-columns: 1fr; }
    .jd-export-csv, .jd-export-pdf { grid-column: unset; }
    .jd-stats-row { gap: 6px; }
    .jd-stat-value { font-size: 18px; }
    .jd-stat-label { font-size: 9px; }
    .jd-tab { padding: 7px 8px; font-size: 10px; }
    .jd-card { padding: 12px; }
    .jd-import-btn { width: 100%; justify-content: center; }
    .cc-card { padding: 12px !important; }
    .cc-name { max-width: 180px !important; }
    .cc-email { max-width: 180px !important; }
    .cc-bar-label { font-size: 10px !important; }
    .cc-rec-badge { font-size: 10px !important; padding: 3px 8px !important; }
    .cc-delete-btn { font-size: 10px !important; padding: 4px 8px !important; }
    .cc-score-num { font-size: 20px !important; }
  }
`;

const ANALYZE_STEPS = [
  { label: 'Envoi',   threshold: 10  },
  { label: 'Lecture', threshold: 30  },
  { label: 'Analyse', threshold: 60  },
  { label: 'Scores',  threshold: 80  },
  { label: 'Tri',     threshold: 100 },
];

const ANALYZE_STATUS = [
  { pct: 0,   text: "Envoi des CV à l'IA…"     },
  { pct: 30,  text: 'Lecture des compétences…'  },
  { pct: 60,  text: 'Calcul des scores…'        },
  { pct: 80,  text: 'Classement des candidats…' },
  { pct: 100, text: 'Analyse terminée !'         },
];

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('candidates');
  const progressRef = useRef(0); // ← ref pour lire la progression courante

  const fetchData = useCallback(async () => {
    try {
      const [jobRes, resumesRes] = await Promise.all([
        jobsAPI.getById(id),
        resumesAPI.getByJob(id),
      ]);
      setJob(jobRes.data);
      setResumes(resumesRes.data);
      return { job: jobRes.data, resumes: resumesRes.data };
    } catch {
      toast.error('Erreur lors du chargement.');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!loading) return;
    const texts = [
      'Chargement des candidats…',
      'Récupération des CV…',
      'Calcul des scores…',
      'Tri par pertinence…',
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      const el = document.getElementById('jd-load-text');
      if (el) el.textContent = texts[i];
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!analyzing) return;
    const el = document.getElementById('jd-analyze-status');
    if (!el) return;
    const match = ANALYZE_STATUS.filter(s => analyzeProgress >= s.pct).pop();
    if (match) el.textContent = match.text;
  }, [analyzing, analyzeProgress]);

  const handleExportCSV = async () => {
    try {
      const response = await import('../../api/axios').then(m => m.default.get(
        `/jobs/${id}/export/csv/`, { responseType: 'blob' }
      ));
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `smartrecruit_job_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export CSV téléchargé !');
    } catch { toast.error("Erreur lors de l'export CSV."); }
  };

  const handleExportPDF = async () => {
    try {
      const response = await import('../../api/axios').then(m => m.default.get(
        `/jobs/${id}/export/pdf/`, { responseType: 'blob' }
      ));
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `smartrecruit_job_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export PDF téléchargé !');
    } catch { toast.error("Erreur lors de l'export PDF."); }
  };

  const handleUpload = async (files) => {
    try {
      await resumesAPI.upload(id, files);
      toast.success(`${files.length} CV uploadé(s) !`);
      fetchData();
    } catch { toast.error("Erreur lors de l'upload."); }
  };

  const handleRetry = async (resumeId) => {
    // Remet le CV en pending localement pour l'affichage
    setResumes((prev) =>
      prev.map((r) => r.id === resumeId ? { ...r, status: 'pending' } : r)
    );
    // Recharge les données après un délai pour laisser le temps à l'analyse
    setTimeout(async () => {
      await fetchData();
    }, 3000);
  };
  // Anime progressivement de la valeur actuelle vers target
  const animateTo = async (target, stepMs = 60) => {
    const start = progressRef.current;
    const steps = 12;
    for (let s = 1; s <= steps; s++) {
      const pct = Math.round(start + ((target - start) * s) / steps);
      progressRef.current = pct;
      setAnalyzeProgress(pct);
      await new Promise((res) => setTimeout(res, stepMs));
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeProgress(0);
    progressRef.current = 0;

    try {
      await resumesAPI.analyze(id);
      toast.success('Analyse lancée !');

      const maxAttempts = 10;
      for (let i = 0; i < maxAttempts; i++) {
        // Anime vers max 90% pendant le poll
        const targetPct = Math.round(((i + 1) / maxAttempts) * 90);
        await animateTo(targetPct, 80);

        const data = await fetchData();
        const pendingCount = (data?.resumes || []).filter((r) => r.status === 'pending').length;
        if (pendingCount === 0) break;
      }

      // Finit toujours à 100% proprement
      await animateTo(100, 50);

      // Pause à 100% pour que l'utilisateur voit le résultat
      await new Promise((res) => setTimeout(res, 800));

      setAnalyzing(false);
      setAnalyzeProgress(0);
      progressRef.current = 0;

    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur d'analyse.");
      setAnalyzing(false);
      setAnalyzeProgress(0);
      progressRef.current = 0;
    }
  };

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="jd-loading">
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: '#EEF2FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          animation: 'jd-breathe 2s ease-in-out infinite',
        }}>
          <Bot size={30} color="#4F46E5" />
          <div style={{
            position: 'absolute', inset: -6,
            borderRadius: 24,
            border: '2px solid #4F46E5',
            opacity: 0,
            animation: 'jd-ping 1.8s ease-out infinite',
          }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p id="jd-load-text" style={{
            fontSize: 15, fontWeight: 600, color: '#1E2D45',
            margin: '0 0 6px',
            animation: 'jd-fade 1.8s ease-in-out infinite',
          }}>
            Chargement des candidats…
          </p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
            Analyse IA en cours
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#4F46E5',
              animation: `jd-typing 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </>
  );

  if (!job) return null;

  const analyzed = resumes.filter((r) => r.status === 'analyzed');
  const pending  = resumes.filter((r) => r.status === 'pending');

  const TABS = [
    { key: 'candidates', icon: <Users  size={14} />, label: 'Candidats' },
    { key: 'upload',     icon: <Upload size={14} />, label: 'Importer des CV' },
    { key: 'skills',     icon: <Wrench size={14} />, label: 'Compétences' },
  ];

  const STATS = [
    { label: 'Total CV',     value: resumes.length,  color: '#4F46E5' },
    { label: 'Analysés',     value: analyzed.length, color: '#10B981' },
    { label: 'En attente',   value: pending.length,  color: '#F59E0B' },
    { label: 'Prioritaires', value: analyzed.filter((r) => r.analysis?.recommendation === 'priority').length, color: '#8B5CF6' },
  ];

  return (
    <>
      <style>{css}</style>

      <div className="jd-header">
        <button className="jd-back-btn" onClick={() => navigate('/jobs')}>
          <ArrowLeft size={14} /> Retour
        </button>

        <div className="jd-header-info">
          <p className="jd-title-label">Offre d'emploi</p>
          <h1 className="jd-title">{job.title}</h1>
          <div className="jd-meta-row">
            <span className="jd-meta-chip"><GraduationCap size={13} color="#94A3B8" /> {job.required_education}</span>
            <span className="jd-meta-chip"><Clock size={13} color="#94A3B8" /> {job.required_experience} an(s)</span>
            <span className="jd-meta-chip"><FileText size={13} color="#94A3B8" /> {resumes.length} CV</span>
          </div>
        </div>

        <div className="jd-header-actions">
          {pending.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: analyzing ? '1 / -1' : 'unset' }}>
              <button className="jd-analyze-btn" onClick={handleAnalyze} disabled={analyzing}>
                <Bot size={15} />
                {analyzing ? `Analyse… ${analyzeProgress}%` : `Analyser ${pending.length} CV`}
              </button>

              {analyzing && (
                <div className="jd-progress-wrap">
                  <div className="jd-progress-track">
                    <div className="jd-progress-fill" style={{ width: `${analyzeProgress}%` }} />
                  </div>
                  <div className="jd-progress-steps">
                    {ANALYZE_STEPS.map((step, i) => {
                      const done   = analyzeProgress >= step.threshold;
                      const active = analyzeProgress >= (i === 0 ? 0 : ANALYZE_STEPS[i - 1].threshold) && !done;
                      return (
                        <div key={step.label} className="jd-progress-step">
                          <div className="jd-step-bar" style={{
                            background: done ? '#10B981' : active ? '#4F46E5' : '#E2E8F0',
                          }} />
                          <span className="jd-step-label" style={{
                            color: done ? '#10B981' : active ? '#4F46E5' : '#94A3B8',
                          }}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="jd-progress-status" id="jd-analyze-status">
                    Envoi des CV à l'IA…
                  </p>
                </div>
              )}
            </div>
          )}
          <button className="jd-export-csv" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button className="jd-export-pdf" onClick={handleExportPDF}>
            <FileDown size={14} /> Export PDF
          </button>
        </div>
      </div>

      <div className="jd-stats-row">
        {STATS.map((s) => (
          <div key={s.label} className="jd-stat-card">
            <span className="jd-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="jd-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="jd-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`jd-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'upload' && <UploadZone onUpload={handleUpload} />}

      {activeTab === 'skills' && (
        <div className="jd-card">
          <p className="jd-card-label"><Wrench size={12} /> Compétences requises</p>
          <h3 className="jd-card-title">Compétences requises pour ce poste</h3>
          <div className="jd-skill-tags">
            {job.required_skills.map((skill) => (
              <span key={skill} className="jd-skill-tag">{skill}</span>
            ))}
          </div>
          <p className="jd-description">{job.description}</p>
        </div>
      )}

      {activeTab === 'candidates' && (
        resumes.length === 0 ? (
          <div className="jd-empty">
            <div className="jd-empty-icon"><Briefcase size={28} color="#4F46E5" /></div>
            <h3 className="jd-empty-title">Aucun CV importé</h3>
            <p className="jd-empty-text">Importez des CV pour commencer l'analyse IA.</p>
            <button className="jd-import-btn" onClick={() => setActiveTab('upload')}>
              <Upload size={14} /> Importer des CV
            </button>
          </div>
        ) : (
          <div className="jd-candidate-list">
            {resumes
              .sort((a, b) => (b.analysis?.score_total || 0) - (a.analysis?.score_total || 0))
              .map((resume, index) => (
                <CandidateCard
                  key={resume.id}
                  resume={resume}
                  rank={index + 1}
                  onDelete={(rid) => setResumes((prev) => prev.filter((r) => r.id !== rid))}
                  onRetry={handleRetry}  // ← AJOUTER
                />
              ))}
          </div>
        )
      )}
    </>
  );
}