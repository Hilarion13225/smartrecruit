import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import { resumesAPI } from '../../api/resumes';
import toast from 'react-hot-toast';
import UploadZone from '../../components/ui/UploadZone';
import CandidateCard from '../../components/ui/CandidateCard';
import ExportButtons from '../../components/ui/ExportButtons';

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

useEffect(() => {
  fetchData();
}, [fetchData]);

  const handleExportCSV = async () => {
  try {
    const response = await import('../../api/axios').then(m => m.default.get(
      `/jobs/${id}/export/csv/`,
      { responseType: 'blob' }
    ));
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smartrecruit_job_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Export CSV téléchargé !');
  } catch {
    toast.error("Erreur lors de l'export CSV.");
  }
};

const handleExportPDF = async () => {
  try {
    const response = await import('../../api/axios').then(m => m.default.get(
      `/jobs/${id}/export/pdf/`,
      { responseType: 'blob' }
    ));
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'application/pdf' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smartrecruit_job_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Export PDF téléchargé !');
  } catch {
    toast.error("Erreur lors de l'export PDF.");
  }
};


  const handleUpload = async (files) => {
    try {
      await resumesAPI.upload(id, files);
      toast.success(`${files.length} CV uploadé(s) !`);
      fetchData();
    } catch {
      toast.error("Erreur lors de l'upload.");
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await resumesAPI.analyze(id);
      toast.success('Analyse lancée !');
      // Poll for results up to ~10s (10 attempts x 1s)
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

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (!job) return null;

  const analyzed = resumes.filter((r) => r.status === 'analyzed');
  const pending = resumes.filter((r) => r.status === 'pending');

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/jobs')} style={styles.backBtn}>
          ← Retour
        </button>
        <div style={styles.headerInfo}>
          <h1 style={styles.title}>{job.title}</h1>
          <div style={styles.headerMeta}>
            <span style={styles.meta}>🎓 {job.required_education}</span>
            <span style={styles.meta}>⏱️ {job.required_experience} an(s)</span>
            <span style={styles.meta}>📄 {resumes.length} CV</span>
          </div>
        </div>
        {pending.length > 0 && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{ ...styles.analyzeBtn, opacity: analyzing ? 0.7 : 1 }}
          >
            {analyzing ? '⏳ Analyse...' : `🤖 Analyser ${pending.length} CV`}
          </button>
        )}
        {/* Ajoute ceci après le bouton analyzeBtn */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleExportCSV} style={styles.exportBtnCSV}>
            📥 Export CSV
          </button>
          <button onClick={handleExportPDF} style={styles.exportBtnPDF}>
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total CV', value: resumes.length, color: '#4F46E5' },
          { label: 'Analysés', value: analyzed.length, color: '#10B981' },
          { label: 'En attente', value: pending.length, color: '#F59E0B' },
          {
            label: 'Prioritaires',
            value: analyzed.filter(
              (r) => r.analysis?.recommendation === 'priority'
            ).length,
            color: '#8B5CF6'
          },
        ].map((stat) => (
          <div key={stat.label} style={styles.statCard}>
            <span style={{ ...styles.statValue, color: stat.color }}>
              {stat.value}
            </span>
            <span style={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { key: 'candidates', label: '👥 Candidats' },
          { key: 'upload', label: '📤 Importer des CV' },
          { key: 'skills', label: '🛠️ Compétences requises' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.key ? styles.tabActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des tabs */}
      {activeTab === 'upload' && (
        <UploadZone onUpload={handleUpload} />
      )}

      {activeTab === 'skills' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Compétences requises pour ce poste</h3>
          <div style={styles.skillTags}>
            {job.required_skills.map((skill) => (
              <span key={skill} style={styles.skillTag}>{skill}</span>
            ))}
          </div>
          <p style={styles.description}>{job.description}</p>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div>
          {resumes.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ fontSize: '48px' }}>📄</span>
              <h3 style={styles.emptyTitle}>Aucun CV importé</h3>
              <p style={styles.emptyText}>
                Importez des CV pour commencer l'analyse IA.
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                style={styles.analyzeBtn}
              >
                📤 Importer des CV
              </button>
            </div>
          ) : (
            <div style={styles.candidateList}>
              {resumes
              .sort((a, b) => (b.analysis?.score_total || 0) - (a.analysis?.score_total || 0))
              .map((resume, index) => (
                <CandidateCard
                  key={resume.id}
                  resume={resume}
                  rank={index + 1}
                  onDelete={(id) => setResumes(prev => prev.filter(r => r.id !== id))} // ← AJOUTER
                />
              ))}
            </div>
          )}
        </div>
      )}
      {analyzed.length > 0 && (
        <ExportButtons jobId={id} jobTitle={job.title} />
      )}
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', minHeight: '400px',
    color: '#6B7280', fontSize: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
  backBtn: {
    padding: '8px 14px', background: '#F3F4F6',
    border: 'none', borderRadius: '8px',
    fontSize: '14px', cursor: 'pointer',
    color: '#374151', whiteSpace: 'nowrap',
  },
  headerInfo: { flex: 1 },
  title: { fontSize: '22px', fontWeight: '700', color: '#1F2937' },
  headerMeta: { display: 'flex', gap: '16px', marginTop: '6px' },
  meta: { fontSize: '13px', color: '#6B7280' },
  analyzeBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '24px',
  },
  statCard: {
    background: '#fff', borderRadius: '10px',
    padding: '16px 20px', textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  statValue: { fontSize: '28px', fontWeight: '700' },
  statLabel: { fontSize: '12px', color: '#6B7280' },
  tabs: {
    display: 'flex', gap: '4px',
    marginBottom: '24px',
    background: '#F3F4F6', padding: '4px',
    borderRadius: '10px', width: 'fit-content',
  },
  tab: {
    padding: '8px 18px', border: 'none',
    borderRadius: '8px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer',
    background: 'transparent', color: '#6B7280',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#fff', color: '#4F46E5',
    fontWeight: '600',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  card: {
    background: '#fff', borderRadius: '12px',
    padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    fontSize: '16px', fontWeight: '700',
    color: '#1F2937', marginBottom: '16px',
  },
  skillTags: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' },
  skillTag: {
    padding: '5px 14px', background: '#EEF2FF',
    color: '#4F46E5', borderRadius: '20px',
    fontSize: '13px', fontWeight: '500',
  },
  description: { fontSize: '14px', color: '#6B7280', lineHeight: '1.6' },
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
  candidateList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  // exportBtn: {
  //   padding: '8px 16px',
  //   background: '#10B981',
  //   color: '#fff', border: 'none',
  //   borderRadius: '8px', fontSize: '13px',
  //   fontWeight: '600', cursor: 'pointer',
  // },
  exportBtnCSV: {
    padding: '8px 16px',
    background: '#10B981',
    color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer',
  },
  exportBtnPDF: {
    padding: '8px 16px',
    background: '#EF4444',
    color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer',
  },
};