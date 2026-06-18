import api from './axios';

export const adminAPI = {
  getStats: () =>
    api.get('/auth/admin/stats/'),

  getUsers: () =>
    api.get('/auth/admin/users/'),

  updateUser: (userId, data) =>
    api.patch(`/auth/admin/users/${userId}/`, data),

  deleteUser: (userId) =>
    api.delete(`/auth/admin/users/${userId}/`),

  getAnalyses: () =>
    api.get('/auth/admin/analyses/'),
};