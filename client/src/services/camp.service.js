import api from './api';

export const campService = {
  getCamps: async (params = {}) => {
    const { data } = await api.get('/camps', { params });
    return data;
  },
  getCampById: async (id) => {
    const { data } = await api.get(`/camps/${id}`);
    return data;
  },
  getMyCamps: async () => {
    const { data } = await api.get('/camps/my-camps');
    return data;
  },
  createCamp: async (payload) => {
    const { data } = await api.post('/camps', payload);
    return data;
  },
  updateCamp: async (id, payload) => {
    const { data } = await api.put(`/camps/${id}`, payload);
    return data;
  },
  deleteCamp: async (id) => {
    const { data } = await api.delete(`/camps/${id}`);
    return data;
  },
};
export default campService;
