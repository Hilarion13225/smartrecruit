import api from './axios';

export const jobsAPI = {
  getAll: (params) => 
    api.get('/jobs/', { params }),
  
  getById: (id) => 
    api.get(`/jobs/${id}/`),
  
  create: (data) => 
    api.post('/jobs/', data),
  
  update: (id, data) => 
    api.patch(`/jobs/${id}/`, data),
  
  delete: (id) => 
    api.delete(`/jobs/${id}/`),

  importJob: (file, preview = false) => {
    const formData = new FormData();
    formData.append('file', file);
    if (preview) formData.append('preview', 'true');
    return api.post('/jobs/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};