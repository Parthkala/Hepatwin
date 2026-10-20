import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const res = await apiClient.post('/auth/token', formData);
    return res.data;
  },
  register: async (username: string, password: string) => {
    const res = await apiClient.post('/auth/register', { username, password });
    return res.data;
  },
};

// Patients API
export const patientsApi = {
  list: async () => {
    const res = await apiClient.get('/patients/');
    return res.data;
  },
  create: async (patient: { name: string; age: number; notes?: string }) => {
    const res = await apiClient.post('/patients/', patient);
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get(`/patients/${id}`);
    return res.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/patients/${id}`);
  },
  listVisits: async (patientId: string) => {
    const res = await apiClient.get(`/patients/${patientId}/visits`);
    return res.data;
  },
  addVisit: async (patientId: string, visit: { month: number; ast: number; alt: number; platelets: number }) => {
    const res = await apiClient.post(`/patients/${patientId}/visits`, visit);
    return res.data;
  },
  deleteVisit: async (patientId: string, visitId: string) => {
    await apiClient.delete(`/patients/${patientId}/visits/${visitId}`);
  },
};

// Twin Pipeline API
export const twinApi = {
  getScores: async (patientId: string) => {
    const res = await apiClient.get(`/twin/${patientId}/scores`);
    return res.data;
  },
  getForecast: async (patientId: string, monthsAhead = 12) => {
    const res = await apiClient.get(`/twin/${patientId}/forecast?months_ahead=${monthsAhead}`);
    return res.data;
  },
  runWhatIf: async (patientId: string, driverScale: number, monthsAhead = 12) => {
    const res = await apiClient.post('/twin/whatif', {
      patient_id: patientId,
      driver_scale: driverScale,
      months_ahead: monthsAhead,
    });
    return res.data;
  },
  getTrafficLight: async (patientId: string) => {
    const res = await apiClient.get(`/twin/${patientId}/traffic-light`);
    return res.data;
  },
  assessHepatitis: async (patientId: string, lifestyle: any) => {
    const res = await apiClient.post(`/twin/${patientId}/hepatitis-assessment`, lifestyle);
    return res.data;
  },
  getStreamFusion: async (patientId: string, pnpla3Risk = false, hasDiabetes = false) => {
    const res = await apiClient.get(`/twin/${patientId}/stream-fusion?pnpla3_risk=${pnpla3Risk}&has_diabetes=${hasDiabetes}`);
    return res.data;
  },
};
