import api from './api';

export const unitService = {
  getUnits: async () => {
    const { data } = await api.get('/units');
    return data;
  },
  getUnitById: async (id) => {
    const { data } = await api.get(`/units/${id}`);
    return data;
  },
};
export default unitService;
