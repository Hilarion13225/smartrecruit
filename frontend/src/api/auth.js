import api from './axios';

export const authAPI = {
  login: (credentials) =>
    api.post('auth/login/', credentials),

  register: (data) =>
    api.post('auth/register/', data),

  logout: (refresh) =>
    api.post('auth/logout/', { refresh }),

  getProfile: () =>
    api.get('auth/profile/'),

  updateProfile: (data) =>
    api.patch('auth/profile/', data),
};