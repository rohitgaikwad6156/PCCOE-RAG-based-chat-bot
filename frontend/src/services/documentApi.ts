import { api } from './api';
import { DocumentItem } from '../types';

export const documentApi = {
  uploadDocument: async (formData: FormData) => {
    const res = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getDocuments: async (params?: {
    search?: string;
    department?: string;
    collectionName?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ documents: DocumentItem[]; pagination: { total: number; page: number; pages: number } }> => {
    const res = await api.get('/documents', { params });
    return res.data.data;
  },

  getDocumentById: async (id: string): Promise<DocumentItem> => {
    const res = await api.get(`/documents/${id}`);
    return res.data.data;
  },

  updateDocument: async (id: string, data: Partial<DocumentItem>) => {
    const res = await api.put(`/documents/${id}`, data);
    return res.data;
  },

  deleteDocument: async (id: string) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },

  reprocessDocument: async (id: string) => {
    const res = await api.post(`/documents/${id}/reprocess`);
    return res.data;
  },

  getSummary: async (id: string): Promise<{ summary: string }> => {
    const res = await api.get(`/documents/${id}/summary`);
    return res.data.data;
  },

  getFAQs: async (id: string): Promise<{ faqs: Array<{ question: string; answer: string; category: string }> }> => {
    const res = await api.get(`/documents/${id}/faqs`);
    return res.data.data;
  },
};
