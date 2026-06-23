import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';
import {
  X, FolderOpen, FileJson, FileText, FileType2,
  Search, CheckCircle2, AlertTriangle, ArrowLeft,
  Upload, Loader2, Check,
} from 'lucide-react';

const css = `
  .ijm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    backdrop-filter: blur(2px);
  }
  .ijm-modal {
    background: #fff;
    border-radius: 16px;
    width: 100%;
    max-width: 620px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    max-height: 90vh;
    overflow-y: auto;
  }

  /* Header */
  .ijm-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px 24px 0;
  }
  .ijm-title-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 4px;
  }
  .ijm-title {
    font-size: 20px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 3px;
  }
  .ijm-subtitle {
    font-size: 13px;
    color: #94A3B8;
    margin: 0;
  }
  .ijm-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #F1F5F9;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: #64748B;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
  }
  .ijm-close-btn:hover { background: #E2E8F0; color: #1E2D45; }

  /* Body */
  .ijm-body { padding: 20px 24px 24px; }

  /* Templates */
  .ijm-templates { margin-bottom: 16px; }
  .ijm-templates-title {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 10px;
  }
  .ijm-template-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .ijm-template-card {
    background: #F8FAFC;
    border-radius: 10px;
    padding: 12px;
    border: 1px solid #E2E8F0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ijm-template-header {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .ijm-template-name {
    font-size: 12px;
    font-weight: 700;
    color: #1E2D45;
  }
  .ijm-template-code {
    font-size: 11px;
    color: #64748B;
    background: #F1F5F9;
    padding: 6px 8px;
    border-radius: 6px;
    white-space: pre;
    font-family: monospace;
    line-height: 1.5;
    display: block;
  }

  /* Dropzone */
  .ijm-dropzone {
    border: 2px dashed #C7D2FE;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    cursor: pointer;
    background: #FAFAFA;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    margin-bottom: 20px;
  }
  .ijm-dropzone.active {
    border-color: #4F46E5;
    background: #EEF2FF;
  }
  .ijm-dropzone.filled {
    border: 2px solid #10B981;
    background: #F0FDF4;
  }
  .ijm-drop-icon {
    width: 52px;
    height: 52px;
    background: #EEF2FF;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }
  .ijm-drop-text {
    font-size: 15px;
    font-weight: 600;
    color: #1E2D45;
    margin: 0;
  }
  .ijm-drop-subtext { font-size: 13px; color: #64748B; margin: 0; }
  .ijm-drop-hint {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    background: #F1F5F9;
    padding: 4px 12px;
    border-radius: 20px;
    letter-spacing: 0.06em;
    margin-top: 4px;
  }
  .ijm-file-selected {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: left;
  }
  .ijm-file-icon {
    width: 44px;
    height: 44px;
    background: #D1FAE5;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ijm-file-name { font-size: 14px; font-weight: 600; color: #1E2D45; margin: 0 0 2px; }
  .ijm-file-size { font-size: 12px; color: #94A3B8; margin: 0; }
  .ijm-remove-file {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: #FFF5F5;
    border: 1px solid #FED7D7;
    border-radius: 8px;
    color: #E53E3E;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .ijm-remove-file:hover { background: #FED7D7; }

  /* Footer */
  .ijm-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
  }
  .ijm-cancel-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    background: #fff;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
    cursor: pointer;
    transition: background 0.15s;
  }
  .ijm-cancel-btn:hover { background: #F8FAFC; }
  .ijm-preview-btn {
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
    transition: background 0.15s;
  }
  .ijm-preview-btn:hover:not(:disabled) { background: #2D4263; }
  .ijm-preview-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ijm-confirm-btn {
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
    transition: background 0.15s;
  }
  .ijm-confirm-btn:hover:not(:disabled) { background: #059669; }
  .ijm-confirm-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  /* Spin */
  .ijm-spin { animation: ijm-rotate 0.8s linear infinite; }
  @keyframes ijm-rotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* Preview */
  .ijm-preview-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #D1FAE5;
    color: #065F46;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
    border: 1px solid #A7F3D0;
  }
  .ijm-preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .ijm-preview-field {
    background: #F8FAFC;
    border-radius: 10px;
    padding: 12px 14px;
    border: 1px solid #E2E8F0;
  }
  .ijm-preview-field.full { grid-column: span 2; }
  .ijm-preview-label {
    font-size: 10px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    display: block;
    margin-bottom: 6px;
  }
  .ijm-preview-value {
    font-size: 14px;
    font-weight: 600;
    color: #1E2D45;
    margin: 0;
  }
  .ijm-preview-desc {
    font-size: 13px;
    color: #64748B;
    line-height: 1.6;
    max-height: 80px;
    overflow-y: auto;
    margin: 0;
  }
  .ijm-skill-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  .ijm-skill-tag {
    padding: 3px 10px;
    background: #EEF2FF;
    color: #4F46E5;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .ijm-no-skills { font-size: 13px; color: #94A3B8; font-style: italic; }
  .ijm-warning-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #FEF3C7;
    color: #92400E;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 16px;
    border: 1px solid #FDE68A;
  }

  @media (max-width: 540px) {
    .ijm-template-grid { grid-template-columns: 1fr; }
    .ijm-preview-grid { grid-template-columns: 1fr; }
    .ijm-preview-field.full { grid-column: span 1; }
    .ijm-footer { flex-direction: column; }
    .ijm-cancel-btn, .ijm-preview-btn, .ijm-confirm-btn {
      width: 100%;
      justify-content: center;
    }
  }
`;

function FileIcon({ name }) {
  if (name?.endsWith('.json')) return <FileJson size={22} color="#4F46E5" />;
  if (name?.endsWith('.docx')) return <FileType2 size={22} color="#3B82F6" />;
  return <FileText size={22} color="#10B981" />;
}

export default function ImportJobModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload');
  const navigate = useNavigate();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('Format non supporté. Utilisez JSON, TXT ou DOCX.');
      return;
    }
    setFile(accepted[0]);
    setPreview(null);
    setStep('upload');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
  });

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await jobsAPI.importJob(file, true);
      setPreview(res.data.preview);
      setStep('preview');
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'analyse.");
    } finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await jobsAPI.importJob(file, false);
      toast.success('Offre importée avec succès !');
      onClose();
      navigate(`/jobs/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'import.");
    } finally { setLoading(false); }
  };

  const dropzoneClass = `ijm-dropzone${isDragActive ? ' active' : ''}${file ? ' filled' : ''}`;

  return (
    <>
      <style>{css}</style>
      <div className="ijm-overlay" onClick={onClose}>
        <div className="ijm-modal" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="ijm-header">
            <div>
              <p className="ijm-title-label">Recrutement</p>
              <h2 className="ijm-title">Importer une offre</h2>
              <p className="ijm-subtitle">Formats supportés : JSON, TXT, Word (.docx)</p>
            </div>
            <button className="ijm-close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          {/* ── Étape 1 : Upload ── */}
          {step === 'upload' && (
            <div className="ijm-body">

              {/* Templates */}
              <div className="ijm-templates">
                <p className="ijm-templates-title">Exemples de formats acceptés</p>
                <div className="ijm-template-grid">
                  <div className="ijm-template-card">
                    <div className="ijm-template-header">
                      <FileJson size={16} color="#4F46E5" />
                      <span className="ijm-template-name">JSON</span>
                    </div>
                    <code className="ijm-template-code">{`{\n  "title": "Dev React",\n  "skills": ["React"],\n  "experience": 2\n}`}</code>
                  </div>
                  <div className="ijm-template-card">
                    <div className="ijm-template-header">
                      <FileText size={16} color="#10B981" />
                      <span className="ijm-template-name">TXT / Word</span>
                    </div>
                    <code className="ijm-template-code">{`Poste: Dev React\nExpérience: 2 ans\nCompétences:\n- React\n- Node.js`}</code>
                  </div>
                </div>
              </div>

              {/* Dropzone */}
              <div {...getRootProps()} className={dropzoneClass}>
                <input {...getInputProps()} />
                {file ? (
                  <div className="ijm-file-selected">
                    <div className="ijm-file-icon">
                      <FileIcon name={file.name} />
                    </div>
                    <div>
                      <p className="ijm-file-name">{file.name}</p>
                      <p className="ijm-file-size">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      className="ijm-remove-file"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : isDragActive ? (
                  <>
                    <div className="ijm-drop-icon" style={{ background: '#EEF2FF' }}>
                      <Upload size={24} color="#4F46E5" />
                    </div>
                    <p className="ijm-drop-text">Déposez le fichier ici...</p>
                  </>
                ) : (
                  <>
                    <div className="ijm-drop-icon">
                      <FolderOpen size={24} color="#4F46E5" />
                    </div>
                    <p className="ijm-drop-text">Glissez-déposez votre fichier ici</p>
                    <p className="ijm-drop-subtext">ou cliquez pour sélectionner</p>
                    <span className="ijm-drop-hint">JSON · TXT · DOCX</span>
                  </>
                )}
              </div>

              <div className="ijm-footer">
                <button className="ijm-cancel-btn" onClick={onClose}>
                  Annuler
                </button>
                <button
                  className="ijm-preview-btn"
                  onClick={handlePreview}
                  disabled={!file || loading}
                >
                  {loading
                    ? <><Loader2 size={14} className="ijm-spin" /> Analyse...</>
                    : <><Search size={14} /> Prévisualiser</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── Étape 2 : Prévisualisation ── */}
          {step === 'preview' && preview && (
            <div className="ijm-body">
              <div className="ijm-preview-banner">
                <CheckCircle2 size={16} />
                Fichier analysé avec succès — vérifiez les informations extraites
              </div>

              <div className="ijm-preview-grid">
                <div className="ijm-preview-field">
                  <label className="ijm-preview-label">Titre du poste</label>
                  <p className="ijm-preview-value">{preview.title || '—'}</p>
                </div>
                <div className="ijm-preview-field">
                  <label className="ijm-preview-label">Expérience requise</label>
                  <p className="ijm-preview-value">
                    {preview.required_experience === 0 ? 'Débutant accepté' : `${preview.required_experience} an(s)`}
                  </p>
                </div>
                <div className="ijm-preview-field">
                  <label className="ijm-preview-label">Niveau d'études</label>
                  <p className="ijm-preview-value">{preview.required_education || '—'}</p>
                </div>
                <div className="ijm-preview-field">
                  <label className="ijm-preview-label">Statut</label>
                  <p className="ijm-preview-value">
                    {preview.status === 'active' ? 'Active' : 'Brouillon'}
                  </p>
                </div>
                <div className="ijm-preview-field full">
                  <label className="ijm-preview-label">Description</label>
                  <p className="ijm-preview-desc">{preview.description || '—'}</p>
                </div>
                <div className="ijm-preview-field full">
                  <label className="ijm-preview-label">
                    Compétences détectées ({preview.required_skills?.length || 0})
                  </label>
                  <div className="ijm-skill-tags">
                    {preview.required_skills?.length > 0 ? (
                      preview.required_skills.map((skill) => (
                        <span key={skill} className="ijm-skill-tag">{skill}</span>
                      ))
                    ) : (
                      <span className="ijm-no-skills">Aucune compétence détectée</span>
                    )}
                  </div>
                </div>
              </div>

              {preview.required_skills?.length === 0 && (
                <div className="ijm-warning-box">
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  Aucune compétence n'a été détectée. Vous pourrez les ajouter manuellement après l'import.
                </div>
              )}

              <div className="ijm-footer">
                <button className="ijm-cancel-btn" onClick={() => setStep('upload')}>
                  <ArrowLeft size={13} /> Modifier
                </button>
                <button className="ijm-confirm-btn" onClick={handleConfirm} disabled={loading}>
                  {loading
                    ? <><Loader2 size={14} className="ijm-spin" /> Import...</>
                    : <><Check size={14} /> Confirmer l'import</>
                  }
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}