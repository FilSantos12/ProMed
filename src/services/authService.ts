import api from './api';
import { RegisterData, AuthResponse } from '../types';

export const authService = {
  // Registrar paciente
  registerPatient: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/register', data);
    return response.data;
  },

  // Registrar médico (apenas admin pode fazer)
  registerDoctor: async (data: any): Promise<any> => {
    const response = await api.post('/admin/doctors', data);
    return response.data;
  },
};