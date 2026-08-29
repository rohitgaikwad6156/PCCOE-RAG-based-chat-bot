import { api } from './api';
import { AdminStats, AdminAnalytics, User } from '../types';

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get('/admin/stats');
    return res.data.data;
  },

  getAnalytics: async (): Promise<AdminAnalytics> => {
    const res = await api.get('/admin/analytics');
    return res.data.data;
  },

  getUsers: async (params?: { search?: string; role?: string; page?: number; limit?: number }): Promise<{
    users: User[];
    pagination: { total: number; page: number; pages: number };
  }> => {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },
};
