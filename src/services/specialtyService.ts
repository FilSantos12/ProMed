import api from './api';

export interface Specialty {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface SpecialtyWithAvailability extends Specialty {
  doctors_count: number;
  available_schedules_count: number;
  is_available: boolean;
  services?: string[];
}

export const specialtyService = {
  getAll: async (): Promise<Specialty[]> => {
    const response = await api.get('/specialties');
    return response.data;
  },

  // Buscar especialidades com informações de disponibilidade
  getAvailableSpecialties: async (): Promise<SpecialtyWithAvailability[]> => {
    try {
      const response = await api.get('/specialties/available');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar especialidades disponíveis:', error);
      // Fallback: buscar todas e marcar como disponíveis
      const allSpecialties = await specialtyService.getAll();
      return allSpecialties.map(specialty => ({
        ...specialty,
        doctors_count: 0,
        available_schedules_count: 0,
        is_available: false,
        services: []
      }));
    }
  }
};