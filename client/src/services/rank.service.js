import api from './api';

export const rankService = {
  getRanks: async () => {
    const { data } = await api.get('/ranks');
    return data;
  },
  promoteCadet: async (cadetId, payload) => {
    const { data } = await api.post(`/ranks/promote/${cadetId}`, payload);
    return data;
  },
  getCadetRankHistory: async (cadetId) => {
    const { data } = await api.get(`/ranks/history/${cadetId}`);
    return data;
  },
};
export default rankService;
