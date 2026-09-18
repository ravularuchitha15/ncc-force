import api from './api';

export const achievementService = {
  getAchievements: async (params = {}) => {
    const { data } = await api.get('/achievements', { params });
    return data;
  },
  getAchievementById: async (id) => {
    const { data } = await api.get(`/achievements/${id}`);
    return data;
  },
  createAchievement: async (formData) => {
    const { data } = await api.post('/achievements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  updateAchievement: async (id, payload) => {
    const { data } = await api.put(`/achievements/${id}`, payload);
    return data;
  },
  deleteAchievement: async (id) => {
    const { data } = await api.delete(`/achievements/${id}`);
    return data;
  },
};
export default achievementService;
