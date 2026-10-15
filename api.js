import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_BASE_API || 'http://localhost:3001',
});

// Interceptor para enviar o Token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para redirecionar ao login se o token for inválido ou expirar (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;