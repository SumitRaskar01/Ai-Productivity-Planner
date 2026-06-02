import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser    = (data) => api.post('/auth/login', data);

// ── Plans ─────────────────────────────────────────────────────
export const generatePlan    = (inputText) => api.post('/plan/generate', { inputText });
export const savePlan        = (data)      => api.post('/plan/save', data);
export const getPlanHistory  = ()          => api.get('/plan/history');
export const updatePlan      = (id, generatedPlan) => api.patch(`/plan/${id}`, { generatedPlan });
export const deletePlan      = (id)        => api.delete(`/plan/${id}`);
export const regeneratePlan  = (data)      => api.post('/plan/regenerate', data);

// Export returns a blob — caller must set responseType: 'blob'
export const exportPlanPDF = (id) =>
  api.get(`/plan/export/${id}`, { responseType: 'blob' });

// ── Analytics ─────────────────────────────────────────────────
export const getAnalyticsSummary = () => api.get('/analytics/summary');

// ── Settings ──────────────────────────────────────────────────
export const getSettings    = ()     => api.get('/settings');
export const updateSettings = (data) => api.patch('/settings', data);

// ── AI ────────────────────────────────────────────────────────
export const getCoachInsights = (generatedPlan) =>
  api.post('/ai/coach', { generatedPlan });
