import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';

export default function ImportJobModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // upload | preview
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
    } finally {
      setLoading(false);
    }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>📂 Importer une offre</h2>
            <p style={styles.modalSubtitle}>
              Formats supportés : JSON, TXT, Word (.docx)
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Étape 1 : Upload */}
        {step === 'upload' && (
          <div style={styles.body}>

            {/* Format templates */}
            <div style={styles.templates}>
              <p style={styles.templatesTitle}>📋 Exemples de formats acceptés :</p>
              <div style={styles.templateGrid}>
                <div style={styles.templateCard}>
                  <span style={styles.templateIcon}>📄</span>
                  <span style={styles.templateName}>JSON</span>
                  <code style={styles.templateCode}>
                    {`{\n  "title": "Dev React",\n  "skills": ["React"],\n  "experience": 2\n}`}
                  </code>
                </div>
                <div style={styles.templateCard}>
                  <span style={styles.templateIcon}>📝</span>
                  <span style={styles.templateName}>TXT / Word</span>
                  <code style={styles.templateCode}>
                    {`Poste: Dev React\nExpérience: 2 ans\nCompétences:\n- React\n- Node.js`}
                  </code>
                </div>
              </div>
            </div>

            {/* Zone de dépôt */}
            <div
              {...getRootProps()}
              style={{
                ...styles.dropzone,
                ...(isDragActive ? styles.dropzoneActive : {}),
                ...(file ? styles.dropzoneFilled : {}),
              }}
            >
              <input {...getInputProps()} />
              {file ? (
                <div style={styles.fileSelected}>
                  <span style={{ fontSize: '36px' }}>
                    {file.name.endsWith('.json') ? '🗂️'
                      : file.name.endsWith('.docx') ? '📘'
                      : '📄'}
                  </span>
                  <div>
                    <p style={styles.fileName}>{file.name}</p>
                    <p style={styles.fileSize}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    style={styles.removeFile}
                  >
                    ✕
                  </button>
                </div>
              ) : isDragActive ? (
                <p style={styles.dropText}>Déposez le fichier ici...</p>
              ) : (
                <>
                  <span style={{ fontSize: '40px' }}>📂</span>
                  <p style={styles.dropText}>
                    Glissez-déposez votre fichier ici
                  </p>
                  <p style={styles.dropSubtext}>
                    ou cliquez pour sélectionner
                  </p>
                  <span style={styles.dropHint}>
                    JSON · TXT · DOCX
                  </span>
                </>
              )}
            </div>

            <div style={styles.footer}>
              <button onClick={onClose} style={styles.cancelBtn}>
                Annuler
              </button>
              <button
                onClick={handlePreview}
                disabled={!file || loading}
                style={{
                  ...styles.previewBtn,
                  opacity: !file || loading ? 0.5 : 1,
                }}
              >
                {loading ? '⏳ Analyse...' : '🔍 Prévisualiser'}
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 : Prévisualisation */}
        {step === 'preview' && preview && (
          <div style={styles.body}>
            <div style={styles.previewBanner}>
              ✅ Fichier analysé avec succès — vérifiez les informations extraites
            </div>

            <div style={styles.previewGrid}>
              {/* Titre */}
              <div style={styles.previewField}>
                <label style={styles.previewLabel}>Titre du poste</label>
                <p style={styles.previewValue}>{preview.title || '—'}</p>
              </div>

              {/* Expérience */}
              <div style={styles.previewField}>
                <label style={styles.previewLabel}>Expérience requise</label>
                <p style={styles.previewValue}>
                  {preview.required_experience === 0
                    ? 'Débutant accepté'
                    : `${preview.required_experience} an(s)`}
                </p>
              </div>

              {/* Formation */}
              <div style={styles.previewField}>
                <label style={styles.previewLabel}>Niveau d'études</label>
                <p style={styles.previewValue}>
                  {preview.required_education || '—'}
                </p>
              </div>

              {/* Statut */}
              <div style={styles.previewField}>
                <label style={styles.previewLabel}>Statut</label>
                <p style={styles.previewValue}>
                  {preview.status === 'active' ? '✅ Active' : '📝 Brouillon'}
                </p>
              </div>

              {/* Description */}
              <div style={{ ...styles.previewField, gridColumn: 'span 2' }}>
                <label style={styles.previewLabel}>Description</label>
                <p style={styles.previewValueDesc}>
                  {preview.description || '—'}
                </p>
              </div>

              {/* Compétences */}
              <div style={{ ...styles.previewField, gridColumn: 'span 2' }}>
                <label style={styles.previewLabel}>
                  Compétences détectées ({preview.required_skills?.length || 0})
                </label>
                <div style={styles.skillTags}>
                  {preview.required_skills?.length > 0 ? (
                    preview.required_skills.map((skill) => (
                      <span key={skill} style={styles.skillTag}>{skill}</span>
                    ))
                  ) : (
                    <span style={styles.noSkills}>
                      Aucune compétence détectée
                    </span>
                  )}
                </div>
              </div>
            </div>

            {preview.required_skills?.length === 0 && (
              <div style={styles.warningBox}>
                ⚠️ Aucune compétence n'a été détectée. Vous pourrez les ajouter
                manuellement après l'import.
              </div>
            )}

            <div style={styles.footer}>
              <button
                onClick={() => setStep('upload')}
                style={styles.cancelBtn}
              >
                ← Modifier
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  ...styles.confirmBtn,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '⏳ Import...' : '✅ Confirmer l\'import'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#fff', borderRadius: '16px',
    width: '100%', maxWidth: '620px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: '24px 24px 0',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#1F2937' },
  modalSubtitle: { fontSize: '13px', color: '#6B7280', marginTop: '4px' },
  closeBtn: {
    background: '#F3F4F6', border: 'none',
    borderRadius: '8px', width: '32px', height: '32px',
    cursor: 'pointer', fontSize: '14px', color: '#6B7280',
  },
  body: { padding: '20px 24px 24px' },
  templates: { marginBottom: '16px' },
  templatesTitle: {
    fontSize: '13px', fontWeight: '600',
    color: '#374151', marginBottom: '10px',
  },
  templateGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  templateCard: {
    background: '#F9FAFB', borderRadius: '8px',
    padding: '12px', border: '1px solid #E5E7EB',
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  templateIcon: { fontSize: '20px' },
  templateName: { fontSize: '12px', fontWeight: '700', color: '#374151' },
  templateCode: {
    fontSize: '11px', color: '#6B7280',
    background: '#F3F4F6', padding: '6px 8px',
    borderRadius: '6px', whiteSpace: 'pre',
    fontFamily: 'monospace', lineHeight: '1.5',
  },
  dropzone: {
    border: '2px dashed #C7D2FE', borderRadius: '12px',
    padding: '32px', textAlign: 'center',
    cursor: 'pointer', background: '#FAFAFA',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px',
    transition: 'all 0.2s', marginBottom: '20px',
  },
  dropzoneActive: {
    border: '2px dashed #4F46E5', background: '#EEF2FF',
  },
  dropzoneFilled: {
    border: '2px solid #10B981', background: '#F0FDF4',
  },
  fileSelected: {
    display: 'flex', alignItems: 'center',
    gap: '12px', width: '100%',
  },
  fileName: { fontSize: '14px', fontWeight: '600', color: '#1F2937' },
  fileSize: { fontSize: '12px', color: '#9CA3AF', marginTop: '2px' },
  removeFile: {
    marginLeft: 'auto', background: '#FEE2E2',
    border: 'none', borderRadius: '6px',
    color: '#EF4444', width: '28px', height: '28px',
    cursor: 'pointer', fontSize: '12px',
  },
  dropText: { fontSize: '15px', fontWeight: '600', color: '#374151' },
  dropSubtext: { fontSize: '13px', color: '#6B7280' },
  dropHint: {
    fontSize: '12px', color: '#9CA3AF',
    background: '#F3F4F6', padding: '4px 12px',
    borderRadius: '20px', marginTop: '4px',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end',
    gap: '10px', marginTop: '4px',
  },
  cancelBtn: {
    padding: '10px 20px', background: '#F3F4F6',
    border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    color: '#374151',
  },
  previewBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  previewBanner: {
    background: '#D1FAE5', color: '#065F46',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500', marginBottom: '16px',
  },
  previewGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '14px', marginBottom: '16px',
  },
  previewField: {
    background: '#F9FAFB', borderRadius: '8px',
    padding: '12px 14px', border: '1px solid #E5E7EB',
  },
  previewLabel: {
    fontSize: '11px', fontWeight: '600', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    display: 'block', marginBottom: '6px',
  },
  previewValue: { fontSize: '14px', fontWeight: '600', color: '#1F2937' },
  previewValueDesc: {
    fontSize: '13px', color: '#374151',
    lineHeight: '1.6', maxHeight: '80px',
    overflowY: 'auto',
  },
  skillTags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' },
  skillTag: {
    padding: '3px 10px', background: '#EEF2FF',
    color: '#4F46E5', borderRadius: '20px',
    fontSize: '12px', fontWeight: '500',
  },
  noSkills: { fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' },
  warningBox: {
    background: '#FEF3C7', color: '#92400E',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '13px', marginBottom: '16px',
  },
  confirmBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
};