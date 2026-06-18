import { useState } from 'react';
import { resumesAPI } from '../../api/resumes';
import toast from 'react-hot-toast';

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
    } finally {
      setLoadingCSV(false);
    }
  };

  const handlePDF = async () => {
    setLoadingPDF(true);
    try {
      const res = await resumesAPI.exportPDF(jobId);
      downloadFile(res.data, `smartrecruit_${jobTitle}.pdf`);
      toast.success('Export PDF téléchargé !');
    } catch {
      toast.error("Erreur lors de l'export PDF.");
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div style={styles.container}>
      <button
        onClick={handleCSV}
        disabled={loadingCSV}
        style={{ ...styles.btn, ...styles.csvBtn, opacity: loadingCSV ? 0.7 : 1 }}
      >
        {loadingCSV ? '⏳' : '📊'} Export CSV
      </button>
      <button
        onClick={handlePDF}
        disabled={loadingPDF}
        style={{ ...styles.btn, ...styles.pdfBtn, opacity: loadingPDF ? 0.7 : 1 }}
      >
        {loadingPDF ? '⏳' : '📄'} Export PDF
      </button>
    </div>
  );
}

const styles = {
  container: { display: 'flex', gap: '8px' },
  btn: {
    padding: '8px 16px', border: 'none',
    borderRadius: '8px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer',
  },
  csvBtn: { background: '#D1FAE5', color: '#065F46' },
  pdfBtn: { background: '#DBEAFE', color: '#1E40AF' },
};