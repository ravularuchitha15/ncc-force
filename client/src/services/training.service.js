import api from './api';

export const trainingService = {
  getTrainings: async (params = {}) => {
    const { data } = await api.get('/training', { params });
    return data;
  },
  getTrainingById: async (id) => {
    const { data } = await api.get(`/training/${id}`);
    return data;
  },
  getMyTrainings: async () => {
    const { data } = await api.get('/training/my-trainings');
    return data;
  },
  createTraining: async (payload) => {
    const { data } = await api.post('/training', payload);
    return data;
  },
  updateTraining: async (id, payload) => {
    const { data } = await api.put(`/training/${id}`, payload);
    return data;
  },
  deleteTraining: async (id) => {
    const { data } = await api.delete(`/training/${id}`);
    return data;
  },
  assignCadets: async (id, cadetIds) => {
    const { data } = await api.post(`/training/${id}/assign`, { cadetIds });
    return data;
  },
};
export default trainingService;
