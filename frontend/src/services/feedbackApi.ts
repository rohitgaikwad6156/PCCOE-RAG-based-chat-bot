import { api } from './api';

export const feedbackApi = {
  submitFeedback: async (data: { messageId: string; type: 'positive' | 'negative'; comment?: string }) => {
    const res = await api.post('/feedback', data);
    return res.data;
  },
};
