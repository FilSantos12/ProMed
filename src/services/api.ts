// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/login')
                        || error.config?.url?.includes('/register');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Token inválido ou expirado — limpar sessão e redirecionar para home
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('pendingAppointment');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;