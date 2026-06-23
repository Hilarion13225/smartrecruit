import { useState } from 'react';
import { resumesAPI } from '../../api/resumes';
import toast from 'react-hot-toast';
import { Download, FileDown, Loader2 } from 'lucide-react';

const css = `
  .eb-container {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .eb-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid transparent;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  .eb-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .eb-csv {
    background: #F0FDF4;
    color: #065F46;
    border-color: #A7F3D0;
  }
  .eb-csv:hover:not(:disabled) { background: #D1FAE5; }
  .eb-pdf {
    background: #EFF6FF;
    color: #1E40AF;
    border-color: #BFDBFE;
  }
  .eb-pdf:hover:not(:disabled) { background: #DBEAFE; }

  .eb-spin {
    animation: eb-rotate 0.8s linear infinite;
  }
  @keyframes eb-rotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @media (max-width: 480px) {
    .eb-btn { flex: 1; justify-content: center; }
  }
`;

export default function ExportButtons({ jobId, jobTitle }) {
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCSV = async () => {
    setLoadingCSV(true);
    try {
      const res = await resumesAPI.exportCSV(jobId);
      downloadFile(res.data, `smartrecruit_${jobTitle}.csv`);
      toast.success('Export CSV téléchargé !');
    } catch {
      toast.error("Erreur lors de l'export CSV.");
    } finally { setLoadingCSV(false); }
  };

  const handlePDF = async () => {
    setLoadingPDF(true);
    try {
      const res = await resumesAPI.exportPDF(jobId);
      downloadFile(res.data, `smartrecruit_${jobTitle}.pdf`);
      toast.success('Export PDF téléchargé !');
    } catch {
      toast.error("Erreur lors de l'export PDF.");
    } finally { setLoadingPDF(false); }
  };

  return (
    <>
      <style>{css}</style>
      <div className="eb-container">
        <button className="eb-btn eb-csv" onClick={handleCSV} disabled={loadingCSV}>
          {loadingCSV
            ? <Loader2 size={14} className="eb-spin" />
            : <Download size={14} />
          }
          Export CSV
        </button>
        <button className="eb-btn eb-pdf" onClick={handlePDF} disabled={loadingPDF}>
          {loadingPDF
            ? <Loader2 size={14} className="eb-spin" />
            : <FileDown size={14} />
          }
          Export PDF
        </button>
      </div>
    </>
  );
}