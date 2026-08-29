import { api } from './api';
import { CollectionItem } from '../types';

export const collectionApi = {
  getCollections: async (): Promise<{ collections: CollectionItem[]; departments: string[] }> => {
    const res = await api.get('/collections');
    return res.data.data;
  },

  createCollection: async (data: { name: string; description?: string; department?: string; icon?: string }) => {
    const res = await api.post('/collections', data);
    return res.data;
  },

  deleteCollection: async (id: string) => {
    const res = await api.delete(`/collections/${id}`);
    return res.data;
  },
};
