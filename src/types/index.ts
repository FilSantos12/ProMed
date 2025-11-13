// frontend/src/types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birth_date: string;
  gender?: 'M' | 'F' | 'Outro';
  role: 'admin' | 'doctor' | 'patient';
  avatar?: string;
  is_active: boolean;
  doctor?: Doctor;
  patient?: Patient;
}

export interface Doctor {
  id: number;
  user_id: number;
  specialty_id: number;
  crm: string;
  crm_state: string;
  bio?: string;
  consultation_price?: number;
  consultation_duration: number;
  years_experience?: number;
  specialty?: Specialty;
}

export interface Patient {
  id: number;
  user_id: number;
  emergency_contact?: string;
  emergency_phone?: string;
  blood_type?: string;
  allergies?: string;
  chronic_diseases?: string;
  medications?: string;
  health_insurance?: string;
  insurance_number?: string;
}

export interface Specialty {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  doctors_count?: number;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_end?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  doctor?: Doctor;
  patient?: Patient;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  cpf: string;
  phone: string;
  birth_date: string;
  gender?: 'M' | 'F' | 'Outro';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}