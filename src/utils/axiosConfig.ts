import axios from 'axios';

// Interceptor para adicionar token em todas as requisições
axios.interceptors.request.use(
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

// Interceptor para tratar erros 401 (token expirado)
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado - limpar e redirecionar para login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Mostrar mensagem
      console.warn('Sessão expirada. Redirecionando para login...');
      
      // Redirecionar para login (ajuste conforme sua navegação)
      window.location.href = '/'; // ou use navigate() do React Router
    }
    return Promise.reject(error);
  }
);

export default axios;