import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import { resumesAPI } from '../../api/resumes';
import toast from 'react-hot-toast';
import UploadZone from '../../components/ui/UploadZone';
import CandidateCard from '../../components/ui/CandidateCard';
import ExportButtons from '../../components/ui/ExportButtons';
import {
  ArrowLeft, GraduationCap, Clock, FileText,
  Users, Upload, Wrench, Bot, Download,
  FileDown, Briefcase,
} from 'lucide-react';

const css = `
  .jd-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

  /* Header */
  .jd-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
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
    word-break: break-word;
  }
  .jd-meta-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
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

  /* Stats */
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

  /* Tabs */
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
  }
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

  /* Card */
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
  .jd-card-title {
    font-size: 16px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 16px;
  }
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

  /* Empty */
  .jd-empty {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 64px 40px;
    text-align: center;
  }
  .jd-empty-icon {
    width: 64px;
    height: 64px;
    background: #EEF2FF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  .jd-empty-title { font-size: 18px; font-weight: 700; color: #1E2D45; margin: 0 0 8px; }
  .jd-empty-text { font-size: 14px; color: #94A3B8; max-width: 360px; margin: 0 auto 24px; }
  .jd-import-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 11px 22px;
    background: #1E2D45;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
  }
  .jd-import-btn:hover { background: #2D4263; }

  .jd-candidate-list { display: flex; flex-direction: column; gap: 12px; }

  /* ── RESPONSIVE MOBILE ── */
  @media (max-width: 768px) {
    .jd-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    .jd-back-btn { align-self: flex-start; }
    .jd-title { font-size: 18px; }
    .jd-header-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .jd-analyze-btn {
      grid-column: 1 / -1;
      justify-content: center;
    }
    .jd-export-csv, .jd-export-pdf { justify-content: center; }
    .jd-stats-row {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .jd-stat-card { padding: 12px 16px; }
    .jd-stat-value { font-size: 22px; }
    .jd-tabs {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .jd-tab { padding: 8px 14px; font-size: 12px; }
    .jd-card { padding: 16px; }
    .jd-empty { padding: 40px 16px; }
    .jd-empty-title { font-size: 16px; }
    .jd-candidate-list { gap: 10px; }
  }

  @media (max-width: 480px) {
    .jd-stats-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .jd-stat-value { font-size: 20px; }
    .jd-stat-label { font-size: 10px; }
    .jd-meta-row { gap: 10px; }
    .jd-meta-chip { font-size: 11px; }
    .jd-tabs { border-radius: 10px; }
    .jd-tab { padding: 8px 12px; font-size: 12px; gap: 5px; }
    .jd-card { padding: 14px; }
    .jd-skill-tag { font-size: 11px; padding: 4px 10px; }
    .jd-description { font-size: 13px; }
    .jd-empty { padding: 32px 14px; }
    .jd-empty-icon { width: 52px; height: 52px; }
    .jd-import-btn { width: 100%; justify-content: center; }
  }
`;

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('candidates');

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

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await resumesAPI.analyze(id);
      toast.success('Analyse lancée !');
      const maxAttempts = 10;
      for (let i = 0; i < maxAttempts; i++) {
        const data = await fetchData();
        const pendingCount = (data?.resumes || []).filter((r) => r.status === 'pending').length;
        if (pendingCount === 0) break;
        await new Promise((res) => setTimeout(res, 1000));
      }
      setAnalyzing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur d'analyse.");
      setAnalyzing(false);
    }
  };

  if (loading) return (
  <div className="jd-loading">
    <div style={{
      width: '48px', height: '48px', borderRadius: '14px',
      background: '#EEF2FF', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <Bot size={24} color="#4F46E5" />
    </div>
    <div style={{
      width: '100px', height: '3px', background: '#E2E8F0',
      borderRadius: '10px', overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', width: '40%', background: '#4F46E5',
        borderRadius: '10px', animation: 'slide 1.2s ease-in-out infinite',
      }} />
    </div>
    <span style={{ fontSize: '14px', color: '#94A3B8' }}>Chargement...</span>
    <style>{`
      @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:.85} }
      @keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }
    `}</style>
  </div>
);
  if (!job) return null;

  const analyzed = resumes.filter((r) => r.status === 'analyzed');
  const pending  = resumes.filter((r) => r.status === 'pending');

  const TABS = [
    { key: 'candidates', icon: <Users size={14} />,   label: 'Candidats' },
    { key: 'upload',     icon: <Upload size={14} />,  label: 'Importer des CV' },
    { key: 'skills',     icon: <Wrench size={14} />,  label: 'Compétences' },
  ];

  const STATS = [
    { label: 'Total CV',    value: resumes.length,                                                     color: '#4F46E5' },
    { label: 'Analysés',    value: analyzed.length,                                                    color: '#10B981' },
    { label: 'En attente',  value: pending.length,                                                     color: '#F59E0B' },
    { label: 'Prioritaires',value: analyzed.filter((r) => r.analysis?.recommendation === 'priority').length, color: '#8B5CF6' },
  ];

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <div className="jd-header">
        <button className="jd-back-btn" onClick={() => navigate('/jobs')}>
          <ArrowLeft size={14} /> Retour
        </button>

        <div className="jd-header-info">
          <p className="jd-title-label">Offre d'emploi</p>
          <h1 className="jd-title">{job.title}</h1>
          <div className="jd-meta-row">
            <span className="jd-meta-chip">
              <GraduationCap size={13} color="#94A3B8" /> {job.required_education}
            </span>
            <span className="jd-meta-chip">
              <Clock size={13} color="#94A3B8" /> {job.required_experience} an(s)
            </span>
            <span className="jd-meta-chip">
              <FileText size={13} color="#94A3B8" /> {resumes.length} CV
            </span>
          </div>
        </div>

        <div className="jd-header-actions">
          {pending.length > 0 && (
            <button className="jd-analyze-btn" onClick={handleAnalyze} disabled={analyzing}>
              <Bot size={15} />
              {analyzing ? 'Analyse...' : `Analyser ${pending.length} CV`}
            </button>
          )}
          <button className="jd-export-csv" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button className="jd-export-pdf" onClick={handleExportPDF}>
            <FileDown size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="jd-stats-row">
        {STATS.map((s) => (
          <div key={s.label} className="jd-stat-card">
            <span className="jd-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="jd-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
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

      {/* Upload */}
      {activeTab === 'upload' && <UploadZone onUpload={handleUpload} />}

      {/* Compétences */}
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

      {/* Candidats */}
      {activeTab === 'candidates' && (
        resumes.length === 0 ? (
          <div className="jd-empty">
            <div className="jd-empty-icon">
              <Briefcase size={28} color="#4F46E5" />
            </div>
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
                  onDelete={(id) => setResumes((prev) => prev.filter((r) => r.id !== id))}
                />
              ))}
          </div>
        )
      )}

      {analyzed.length > 0 && <ExportButtons jobId={id} jobTitle={job.title} />}
    </>
  );
}