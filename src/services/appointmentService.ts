import api from './api';

// Interfaces
export interface Specialty {
  id: number;
  name: string;
  icon: string;
  description: string | null;
}

export interface Doctor {
  id: number;
  user_id: number;
  specialty_id: number;
  crm: string;
  crm_state: string;
  bio: string | null;
  consultation_price: number;
  consultation_duration: number;
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

export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  day_of_week: string | null;
  schedule_date: string | null;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_available: boolean;
}

export interface AvailableSlots {
  date: string;
  day_of_week: string;
  all_slots: string[];
  available_slots: string[];
  occupied_slots: string[];
}

export interface CreateAppointmentData {
  doctor_id: number;
  specialty_id: number;
  appointment_date: string;
  appointment_time: string;
  patient_notes?: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  specialty_id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  patient_notes: string | null;
  doctor_notes: string | null;
  created_at: string;
  updated_at: string;
}

class AppointmentService {
  // Buscar todas as especialidades
  async getSpecialties(): Promise<Specialty[]> {
    const response = await api.get('/specialties');
    return response.data;
  }

  // Buscar médicos (com filtro opcional por especialidade)
  async getDoctors(filters?: {
    specialty_id?: number;
    search?: string;
  }): Promise<Doctor[]> {
    const response = await api.get('/doctors', { params: filters });
    // A resposta pode vir paginada
    const data = response.data;
    return data.data || data;
  }

  // Buscar horários de um médico
  async getDoctorSchedules(doctorId: number, filters?: {
    schedule_date?: string;
    available?: boolean;
  }): Promise<DoctorSchedule[]> {
    const response = await api.get('/schedules', {
      params: {
        doctor_id: doctorId,
        ...filters,
      },
    });
    return response.data;
  }

  // Buscar slots disponíveis para um horário específico
  async getAvailableSlots(scheduleId: number, date: string): Promise<AvailableSlots> {
    const response = await api.get(`/schedules/${scheduleId}/slots`, {
      params: { date },
    });
    return response.data;
  }

  // Criar um novo agendamento
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data.appointment || response.data;
  }

  // Buscar consultas do usuário autenticado
  async getMyAppointments(filters?: {
    status?: string;
    date?: string;
  }): Promise<Appointment[]> {
    const response = await api.get('/appointments', { params: filters });
    const data = response.data;
    return data.data || data;
  }
}

export const appointmentService = new AppointmentService();
