import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function UploadZone({ onUpload }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('Seuls les fichiers PDF sont acceptés.');
    }
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Ajoutez au moins un CV.');
      return;
    }
    setUploading(true);
    try {
      await onUpload(files);
      setFiles([]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Zone de dépôt */}
      <div
        {...getRootProps()}
        style={{
          ...styles.dropzone,
          ...(isDragActive ? styles.dropzoneActive : {}),
        }}
      >
        <input {...getInputProps()} />
        <span style={{ fontSize: '48px' }}>📂</span>
        {isDragActive ? (
          <p style={styles.dropText}>Déposez vos CV ici...</p>
        ) : (
          <>
            <p style={styles.dropText}>
              Glissez-déposez vos CV PDF ici
            </p>
            <p style={styles.dropSubtext}>
              ou cliquez pour sélectionner des fichiers
            </p>
          </>
        )}
        <span style={styles.dropHint}>PDF uniquement — multiple fichiers acceptés</span>
      </div>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div style={styles.fileList}>
          <h3 style={styles.fileListTitle}>
            📋 {files.length} fichier(s) sélectionné(s)
          </h3>
          {files.map((file, index) => (
            <div key={index} style={styles.fileItem}>
              <span style={{ fontSize: '20px' }}>📄</span>
              <div style={styles.fileInfo}>
                <span style={styles.fileName}>{file.name}</span>
                <span style={styles.fileSize}>
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                style={styles.removeBtn}
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              ...styles.uploadBtn,
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading
              ? '⏳ Upload en cours...'
              : `📤 Uploader ${files.length} CV`}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  dropzone: {
    border: '2px dashed #C7D2FE',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#FAFAFA',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px',
    transition: 'all 0.2s',
  },
  dropzoneActive: {
    border: '2px dashed #4F46E5',
    background: '#EEF2FF',
  },
  dropText: {
    fontSize: '16px', fontWeight: '600', color: '#374151',
  },
  dropSubtext: { fontSize: '14px', color: '#6B7280' },
  dropHint: {
    fontSize: '12px', color: '#9CA3AF',
    marginTop: '4px',
  },
  fileList: {
    background: '#fff', borderRadius: '12px',
    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  fileListTitle: {
    fontSize: '14px', fontWeight: '700',
    color: '#1F2937', marginBottom: '4px',
  },
  fileItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 14px', background: '#F9FAFB',
    borderRadius: '8px', border: '1px solid #E5E7EB',
  },
  fileInfo: { flex: 1 },
  fileName: {
    display: 'block', fontSize: '13px',
    fontWeight: '500', color: '#374151',
  },
  fileSize: { fontSize: '11px', color: '#9CA3AF' },
  removeBtn: {
    background: '#FEE2E2', border: 'none',
    borderRadius: '6px', color: '#EF4444',
    fontSize: '18px', width: '28px', height: '28px',
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  uploadBtn: {
    padding: '12px', marginTop: '8px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
};