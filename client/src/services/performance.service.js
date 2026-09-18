import api from './api';

export const performanceService = {
  getPerformanceRecords: async (params = {}) => {
    const { data } = await api.get('/performance', { params });
    return data;
  },
  getPerformanceById: async (id) => {
    const { data } = await api.get(`/performance/${id}`);
    return data;
  },
  createPerformance: async (payload) => {
    const { data } = await api.post('/performance', payload);
    return data;
  },
  updatePerformance: async (id, payload) => {
    const { data } = await api.put(`/performance/${id}`, payload);
    return data;
  },
};
export default performanceService;
