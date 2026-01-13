// frontend/src/contexts/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

interface AuthContextData {
  user: User | null;
  token: string | null;
  signed: boolean;
  loading: boolean;
  login(email: string, password: string, expectedRole: string): Promise<void>;
  logout(): Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, expectedRole: string) => {
    try {
      const response = await api.post('/login', {
        email,
        password,
        expected_role: expectedRole,
      });

      const { token, user } = response.data;

      // CORREÇÃO: Removido o prefixo @ProMed: para padronizar
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setToken(token);
      setUser(user);
    } catch (error: any) {
      throw error;
    }
  };

  // Registro
  const register = async (data: RegisterData) => {
    try {
      const response = await api.post<AuthResponse>('/register', data);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setToken(token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao cadastrar');
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      // Ignorar erros ao fazer logout
    } finally {
      // CORREÇÃO: Removido o prefixo @ProMed: para padronizar
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Limpar agendamento pendente ao fazer logout
      localStorage.removeItem('pendingAppointment');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signed: !!user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}