import api from './api';

export const certificateService = {
  getCertificates: async (params = {}) => {
    const { data } = await api.get('/certificates', { params });
    return data;
  },
  getCertificateById: async (id) => {
    const { data } = await api.get(`/certificates/${id}`);
    return data;
  },
  createCertificate: async (formData) => {
    const { data } = await api.post('/certificates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  updateCertificate: async (id, formData) => {
    const { data } = await api.put(`/certificates/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  deleteCertificate: async (id) => {
    const { data } = await api.delete(`/certificates/${id}`);
    return data;
  },
  downloadCertificate: async (id) => {
    const { data } = await api.get(`/certificates/${id}/download`, { responseType: 'blob' });
    return data;
  },
};
export default certificateService;
