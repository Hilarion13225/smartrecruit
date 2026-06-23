import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { FolderOpen, Upload, FileText, X, Loader2, ClipboardList } from 'lucide-react';

const css = `
  .uz-container { display: flex; flex-direction: column; gap: 20px; }

  .uz-dropzone {
    border: 2px dashed #C7D2FE;
    border-radius: 14px;
    padding: 48px 32px;
    text-align: center;
    cursor: pointer;
    background: #FAFAFA;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }
  .uz-dropzone.active {
    border-color: #4F46E5;
    background: #EEF2FF;
  }
  .uz-drop-icon {
    width: 60px;
    height: 60px;
    background: #EEF2FF;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
    transition: background 0.2s;
  }
  .uz-dropzone.active .uz-drop-icon { background: #C7D2FE; }
  .uz-drop-text {
    font-size: 16px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0;
  }
  .uz-drop-subtext { font-size: 13px; color: #64748B; margin: 0; }
  .uz-drop-hint {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    background: #F1F5F9;
    padding: 4px 14px;
    border-radius: 20px;
    letter-spacing: 0.06em;
    margin-top: 4px;
    text-transform: uppercase;
  }

  /* File list */
  .uz-file-list {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .uz-file-list-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .uz-file-list-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .uz-file-count {
    padding: 2px 8px;
    background: #EEF2FF;
    color: #4F46E5;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
  }
  .uz-file-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: #F8FAFC;
    border-radius: 10px;
    border: 1px solid #E2E8F0;
  }
  .uz-file-icon {
    width: 36px;
    height: 36px;
    background: #FEE2E2;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .uz-file-info { flex: 1; min-width: 0; }
  .uz-file-name {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #1E2D45;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .uz-file-size { font-size: 11px; color: #94A3B8; }
  .uz-remove-btn {
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
  .uz-remove-btn:hover { background: #FED7D7; }

  .uz-upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px;
    margin-top: 4px;
    background: #1E2D45;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: background 0.15s;
  }
  .uz-upload-btn:hover:not(:disabled) { background: #2D4263; }
  .uz-upload-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .uz-spin { animation: uz-rotate 0.8s linear infinite; }
  @keyframes uz-rotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @media (max-width: 480px) {
    .uz-dropzone { padding: 32px 20px; }
    .uz-drop-text { font-size: 14px; }
  }
`;

export default function UploadZone({ onUpload }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) toast.error('Seuls les fichiers PDF sont acceptés.');
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (files.length === 0) { toast.error('Ajoutez au moins un CV.'); return; }
    setUploading(true);
    try {
      await onUpload(files);
      setFiles([]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="uz-container">

        {/* Dropzone */}
        <div {...getRootProps()} className={`uz-dropzone${isDragActive ? ' active' : ''}`}>
          <input {...getInputProps()} />
          <div className="uz-drop-icon">
            {isDragActive
              ? <Upload size={26} color="#4F46E5" />
              : <FolderOpen size={26} color="#4F46E5" />
            }
          </div>
          {isDragActive ? (
            <p className="uz-drop-text">Déposez vos CV ici...</p>
          ) : (
            <>
              <p className="uz-drop-text">Glissez-déposez vos CV PDF ici</p>
              <p className="uz-drop-subtext">ou cliquez pour sélectionner des fichiers</p>
            </>
          )}
          <span className="uz-drop-hint">PDF uniquement · Plusieurs fichiers acceptés</span>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="uz-file-list">
            <div className="uz-file-list-header">
              <ClipboardList size={14} color="#94A3B8" />
              <span className="uz-file-list-label">Fichiers sélectionnés</span>
              <span className="uz-file-count">{files.length}</span>
            </div>

            {files.map((file, index) => (
              <div key={index} className="uz-file-item">
                <div className="uz-file-icon">
                  <FileText size={17} color="#E53E3E" />
                </div>
                <div className="uz-file-info">
                  <span className="uz-file-name">{file.name}</span>
                  <span className="uz-file-size">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
                <button className="uz-remove-btn" onClick={() => removeFile(index)}>
                  <X size={12} />
                </button>
              </div>
            ))}

            <button className="uz-upload-btn" onClick={handleUpload} disabled={uploading}>
              {uploading
                ? <><Loader2 size={15} className="uz-spin" /> Upload en cours...</>
                : <><Upload size={15} /> Uploader {files.length} CV</>
              }
            </button>
          </div>
        )}

      </div>
    </>
  );
}