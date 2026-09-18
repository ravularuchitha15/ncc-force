import api from './api';

export const attendanceService = {
  getAttendance: async (params = {}) => {
    const { data } = await api.get('/attendance', { params });
    return data;
  },
  getAttendanceById: async (id) => {
    const { data } = await api.get(`/attendance/${id}`);
    return data;
  },
  markAttendance: async (payload) => {
    const { data } = await api.post('/attendance', payload);
    return data;
  },
  updateAttendance: async (id, payload) => {
    const { data } = await api.put(`/attendance/${id}`, payload);
    return data;
  },
  deleteAttendance: async (id) => {
    const { data } = await api.delete(`/attendance/${id}`);
    return data;
  },
};
export default attendanceService;
