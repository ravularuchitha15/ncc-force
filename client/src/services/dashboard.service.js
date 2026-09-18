import api from './api';

export const dashboardService = {
  getOfficerDashboard: async () => {
    const { data } = await api.get('/dashboard/officer');
    return data;
  },
  getCadetDashboard: async () => {
    const { data } = await api.get('/dashboard/cadet');
    return data;
  },
};
export default dashboardService;
