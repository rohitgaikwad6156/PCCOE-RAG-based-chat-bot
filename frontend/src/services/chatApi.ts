import { api } from './api';
import { ConversationItem, MessageItem } from '../types';

export const chatApi = {
  askQuestion: async (data: {
    question: string;
    conversationId?: string;
    departmentFilter?: string;
    collectionFilter?: string;
  }) => {
    const res = await api.post('/chat', data);
    return res.data.data;
  },

  getConversations: async (): Promise<ConversationItem[]> => {
    const res = await api.get('/chat/conversations');
    return res.data.data;
  },

  getConversationMessages: async (id: string): Promise<{ conversation: ConversationItem; messages: MessageItem[] }> => {
    const res = await api.get(`/chat/conversations/${id}`);
    return res.data.data;
  },

  deleteConversation: async (id: string) => {
    const res = await api.delete(`/chat/conversations/${id}`);
    return res.data;
  },

  exportConversationTxt: async (id: string) => {
    const res = await api.get(`/chat/conversations/${id}/export?format=txt`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
