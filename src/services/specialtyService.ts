import api from './api';

export interface Specialty {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export const specialtyService = {
  getAll: async (): Promise<Specialty[]> => {
    const response = await api.get('/specialties');
    return response.data;
  }
};