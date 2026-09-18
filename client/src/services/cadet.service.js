import api from './api';

export const cadetService = {
  getCadets: async (params = {}) => {
    const { data } = await api.get('/cadets', { params });
    return data;
  },
  getCadetById: async (id) => {
    const { data } = await api.get(`/cadets/${id}`);
    return data;
  },
  createCadet: async (payload) => {
    const { data } = await api.post('/cadets', payload);
    return data;
  },
  updateCadet: async (id, payload) => {
    const { data } = await api.put(`/cadets/${id}`, payload);
    return data;
  },
  deleteCadet: async (id) => {
    const { data } = await api.delete(`/cadets/${id}`);
    return data;
  },
};
export default cadetService;
