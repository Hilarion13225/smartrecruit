import api from './axios';

export const resumesAPI = {
  getByJob: (jobId) =>
    api.get(`/jobs/${jobId}/resumes/`),

  upload: (jobId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('cv_files', file));
    return api.post(`/jobs/${jobId}/resumes/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  analyze: (jobId) =>
    api.post(`/jobs/${jobId}/analyze/`),

  // ── Nouvelles fonctions ──
  exportCSV: (jobId) =>
    api.get(`/jobs/${jobId}/export/csv/`, { responseType: 'blob' }),

  exportPDF: (jobId) =>
    api.get(`/jobs/${jobId}/export/pdf/`, { responseType: 'blob' }),

  delete: (resumeId) => api.delete(`/resumes/${resumeId}/delete/`),
};