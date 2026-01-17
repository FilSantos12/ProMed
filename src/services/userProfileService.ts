import api from './api';

export interface UserProfile {
  role: 'admin' | 'doctor' | 'patient';
  name: string;
  icon: string;
  redirect: string;
  is_active: boolean;
}

export interface AvailableProfilesResponse {
  active_role: string;
  profiles: UserProfile[];
}

export interface SwitchProfileResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    active_role: string;
    roles: string[];
    has_doctor_profile: boolean;
    has_patient_profile: boolean;
    is_admin: boolean;
  };
}

class UserProfileService {
  /**
   * Trocar perfil ativo
   */
  async switchProfile(role: 'admin' | 'doctor' | 'patient'): Promise<SwitchProfileResponse> {
    const response = await api.post('/user/switch-profile', { role });
    return response.data;
  }

  /**
   * Obter perfis disponíveis
   */
  async getAvailableProfiles(): Promise<AvailableProfilesResponse> {
    const response = await api.get('/user/available-profiles');
    return response.data;
  }
}

export default new UserProfileService();
