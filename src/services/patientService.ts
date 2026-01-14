import api from './api';

// Interfaces
export interface PatientProfile {
  id: number;
  user_id: number;
  emergency_contact: string | null;
  emergency_phone: string | null;
  blood_type: string | null;
  allergies: string | null;
  chronic_diseases: string | null;
  medications: string | null;
  health_insurance: string | null;
  insurance_number: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    birth_date: string | null;
    gender: string | null;
    rg: string | null;
    avatar: string | null;
  };
}

export interface PatientAppointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  specialty_id: number | null;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  patient_notes: string | null;
  doctor_notes: string | null;
  cancellation_reason: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  // doctor é o User (médico)
  doctor: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
    // doctor.doctor é o registro Doctor
    doctor?: {
      id: number;
      user_id: number;
      specialty_id: number;
      crm: string;
      crm_state: string;
      specialty: {
        id: number;
        name: string;
        icon: string;
      };
    };
  };
  // Relação direta com specialty
  specialty?: {
    id: number;
    name: string;
    icon: string;
  };
}

export interface PatientStats {
  total_appointments: number;
  upcoming_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
}

export interface MedicalRecord {
  id: number;
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  symptoms: string | null;
  diagnosis: string | null;
  treatment: string | null;
  prescription: string | null;
  observations: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
  appointment?: {
    id: number;
    appointment_date: string;
    appointment_time: string;
    status: string;
  };
  doctor?: {
    id: number;
    user_id: number;
    specialty_id: number;
    crm: string;
    crm_state: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
    specialty: {
      id: number;
      name: string;
      icon: string;
    };
  };
}

class PatientService {
  // Buscar perfil do paciente
  async getProfile(): Promise<PatientProfile> {
    const response = await api.get('/patient/profile');
    return response.data.patient || response.data;
  }

  // Atualizar perfil do paciente
  async updateProfile(data: {
    name?: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
    rg?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    blood_type?: string;
    allergies?: string;
    chronic_diseases?: string;
    medications?: string;
    health_insurance?: string;
    insurance_number?: string;
  }): Promise<PatientProfile> {
    const response = await api.put('/patient/profile', data);
    return response.data.patient || response.data;
  }

  // Upload de avatar
  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/patient/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Buscar consultas do paciente
  async getAppointments(filters?: {
    status?: string;
    date?: string;
  }): Promise<PatientAppointment[]> {
    const response = await api.get('/patient/appointments', { params: filters });
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  }

  // Buscar consultas futuras
  async getUpcomingAppointments(): Promise<PatientAppointment[]> {
    const response = await api.get('/patient/appointments/upcoming');
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  }

  // Cancelar consulta
  async cancelAppointment(
    appointmentId: number,
    reason?: string
  ): Promise<PatientAppointment> {
    const response = await api.post(`/patient/appointments/${appointmentId}/cancel`, {
      cancellation_reason: reason,
    });
    return response.data.appointment || response.data;
  }

  // Alterar senha
  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> {
    await api.post('/patient/profile/change-password', data);
  }

  // Buscar estatísticas do paciente
  async getStats(): Promise<PatientStats> {
    try {
      const response = await api.get('/patient/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total_appointments: 0,
        upcoming_appointments: 0,
        completed_appointments: 0,
        cancelled_appointments: 0,
      };
    }
  }

  // Buscar prontuários médicos do paciente
  async getMedicalRecords(): Promise<MedicalRecord[]> {
    try {
      const response = await api.get('/patient/medical-records');
      const data = response.data;
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erro ao buscar prontuários médicos:', error);
      return [];
    }
  }
}

export const patientService = new PatientService();
