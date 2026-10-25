import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((c) => { const t = localStorage.getItem('sp_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401 && localStorage.getItem('sp_token') && !e.config.url.includes('/auth/')) {
    localStorage.removeItem('sp_token'); localStorage.removeItem('sp_user'); window.location.assign('/login');
  }
  return Promise.reject(e);
});
// Human-readable message plus field errors from any failed request.
export const errorInfo = (e) => ({
  message: e.response?.data?.message || (e.request ? 'Cannot reach the server. Check your connection and try again.' : 'Something went wrong.'),
  fields: e.response?.data?.errors || {},
});
export default api;
