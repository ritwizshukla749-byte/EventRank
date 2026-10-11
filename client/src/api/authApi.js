import { apiClient } from './client';

export const authApi = {
  login: (credentials) =>
    apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () =>
    apiClient('/auth/logout', {
      method: 'POST',
    }),

  me: () => apiClient('/auth/me'),

  // PATCH /users/me with strict whitelist (flat profile fields; role/college are server-controlled)
  updateProfile: (profileData) =>
    apiClient('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    }),
};
