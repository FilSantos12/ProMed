import api from './api';

// Interfaces
export interface DoctorProfile {
  id: number;
  user_id: number;
  specialty_id: number;
  crm: string;
  crm_state: string;
  bio: string;
  consultation_price: number;
  consultation_duration: number;
  formation: any;
  years_experience: number;
  status: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
  };
  specialty: {
    id: number;
    name: string;
    icon: string;
  };
}

export interface DoctorAppointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  patient_notes: string | null;
  doctor_notes: string | null;
  cancellation_reason: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  patient: {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    user?: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | null;
  schedule_date: string | null;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface DoctorStats {
  appointmentsToday: number;
  appointmentsWeek: number;
  appointmentsMonth: number;
  activePatients: number;
}

class DoctorService {
  // Buscar perfil do médico
  async getProfile(): Promise<DoctorProfile> {
    const response = await api.get('/doctor/profile');
    // O backend retorna { doctor: {...}, stats: {...} }
    return response.data.doctor || response.data;
  }

  // Atualizar perfil do médico
  async updateProfile(data: {
    bio?: string;
    consultation_price?: number;
    consultation_duration?: number;
    years_experience?: number;
  }): Promise<DoctorProfile> {
    const response = await api.put('/doctor/profile', data);
    // O backend retorna { message: '...', doctor: {...} }
    return response.data.doctor || response.data;
  }

  // Upload de avatar
  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/doctor/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Buscar consultas do médico
  async getAppointments(filters?: {
    status?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DoctorAppointment[]> {
    const response = await api.get('/appointments', { params: filters });
    // A resposta pode vir como array direto ou dentro de data
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  }

  // Buscar consultas de hoje
  async getTodayAppointments(): Promise<DoctorAppointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get('/appointments', {
      params: { date: today },
    });
    // A resposta pode vir como array direto ou dentro de data
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  }

  // Confirmar consulta
  async confirmAppointment(appointmentId: number): Promise<void> {
    await api.put(`/appointments/${appointmentId}`, { status: 'confirmed' });
  }

  // Cancelar consulta
  async cancelAppointment(
    appointmentId: number,
    reason?: string
  ): Promise<void> {
    await api.put(`/appointments/${appointmentId}`, {
      status: 'cancelled',
      cancellation_reason: reason,
    });
  }

  // Completar consulta
  async completeAppointment(
    appointmentId: number,
    doctorNotes?: string
  ): Promise<void> {
    await api.put(`/appointments/${appointmentId}`, {
      status: 'completed',
      doctor_notes: doctorNotes,
    });
  }

  // Marcar como não compareceu (no-show)
  async noShowAppointment(appointmentId: number): Promise<void> {
    await api.put(`/appointments/${appointmentId}`, {
      status: 'no_show',
    });
  }

  // Adicionar notas do médico
  async addDoctorNotes(
    appointmentId: number,
    notes: string
  ): Promise<void> {
    await api.put(`/appointments/${appointmentId}`, {
      doctor_notes: notes,
    });
  }

  // Buscar horários/agenda do médico
  async getSchedules(): Promise<DoctorSchedule[]> {
    const response = await api.get('/doctor/schedules');
    // A resposta pode vir como array direto ou dentro de data
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  }

  // Adicionar novo horário
  async addSchedule(data: {
    schedule_date: string;
    start_time: string;
    end_time: string;
    is_available?: boolean;
  }): Promise<DoctorSchedule> {
    const response = await api.post('/doctor/schedules', data);
    // O backend retorna { message: '...', schedule: {...} }
    return response.data.schedule || response.data;
  }

  // Atualizar horário
  async updateSchedule(
    scheduleId: number,
    data: {
      day_of_week?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      start_time?: string;
      end_time?: string;
      is_available?: boolean;
    }
  ): Promise<DoctorSchedule> {
    const response = await api.put(`/doctor/schedules/${scheduleId}`, data);
    // O backend retorna { message: '...', schedule: {...} }
    return response.data.schedule || response.data;
  }

  // Deletar horário
  async deleteSchedule(scheduleId: number): Promise<void> {
    await api.delete(`/doctor/schedules/${scheduleId}`);
  }

  // Buscar estatísticas do médico
  async getStats(): Promise<DoctorStats> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const [todayAppts, weekAppts, monthAppts] = await Promise.all([
        this.getAppointments({ date: today.toISOString().split('T')[0] }),
        this.getAppointments({
          startDate: startOfWeek.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        }),
        this.getAppointments({
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        }),
      ]);

      // Garantir que são arrays
      const todayArray = Array.isArray(todayAppts) ? todayAppts : [];
      const weekArray = Array.isArray(weekAppts) ? weekAppts : [];
      const monthArray = Array.isArray(monthAppts) ? monthAppts : [];

      // Contar pacientes únicos
      const uniquePatients = new Set(
        monthArray.map((appt) => appt.patient_id)
      ).size;

      return {
        appointmentsToday: todayArray.length,
        appointmentsWeek: weekArray.length,
        appointmentsMonth: monthArray.length,
        activePatients: uniquePatients,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Retornar estatísticas vazias em caso de erro
      return {
        appointmentsToday: 0,
        appointmentsWeek: 0,
        appointmentsMonth: 0,
        activePatients: 0,
      };
    }
  }

  // Buscar documentos do médico
  async getDocuments(): Promise<any[]> {
    const response = await api.get('/doctor/documents');
    return response.data;
  }

  // Upload de documento
  async uploadDocument(data: {
    document_type: string;
    file: File;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('file', data.file);
    const response = await api.post('/doctor/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Deletar documento
  async deleteDocument(documentId: number): Promise<void> {
    await api.delete(`/doctor/documents/${documentId}`);
  }

  // Alterar senha
  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> {
    await api.post('/doctor/profile/change-password', data);
  }
}

export const doctorService = new DoctorService();
