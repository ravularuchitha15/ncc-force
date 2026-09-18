import api from './api';

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  firebaseLogin: async (idToken, fcmToken = null) => {
    const { data } = await api.post('/auth/firebase-login', { idToken, fcmToken });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  changePassword: async (currentPassword, newPassword) => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
};
export default authService;
