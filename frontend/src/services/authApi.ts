import { api } from './api';
import { User } from '../types';

export const authApi = {
  signup: async (data: { name: string; email: string; password: string; department?: string }) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  /**
   * Google OAuth — only sends the `credential` (Google ID token).
   * Backend verifies with Google before creating/updating the user.
   */
  googleAuth: async (data: { credential: string }) => {
    const res = await api.post('/auth/google', data);
    return res.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};
