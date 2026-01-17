import api from './api';

export interface DoctorApplicationData {
  crm: string;
  crm_state: string;
  specialty_id: number;
  bio?: string;
  consultation_price?: number;
  consultation_duration?: number;
  formation?: string[];
  years_experience?: number;
  diploma_document: File;
  crm_document: File;
  identity_document: File;
  address_proof_document?: File;
}

export interface DoctorApplicationStatus {
  has_application: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  specialty?: string;
  crm?: string;
  crm_state?: string;
  rejection_reason?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at?: string;
  documents?: Array<{
    id: number;
    type: string;
    name: string;
    status: string;
  }>;
}

export interface PendingDoctor {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  crm: string;
  crm_state: string;
  specialty: string;
  bio: string;
  consultation_price: number;
  consultation_duration: number;
  years_experience: number;
  formation: string[];
  status: string;
  created_at: string;
  documents: Array<{
    id: number;
    type: string;
    name: string;
    size: number;
    url: string;
    status: string;
  }>;
}

class DoctorApplicationService {
  /**
   * Paciente solicita se tornar médico
   */
  async applyAsDoctor(data: DoctorApplicationData) {
    const formData = new FormData();

    // Adicionar campos de texto
    formData.append('crm', data.crm);
    formData.append('crm_state', data.crm_state);
    formData.append('specialty_id', data.specialty_id.toString());

    if (data.bio) formData.append('bio', data.bio);
    if (data.consultation_price) formData.append('consultation_price', data.consultation_price.toString());
    if (data.consultation_duration) formData.append('consultation_duration', data.consultation_duration.toString());
    if (data.years_experience) formData.append('years_experience', data.years_experience.toString());

    if (data.formation && data.formation.length > 0) {
      data.formation.forEach((item, index) => {
        formData.append(`formation[${index}]`, item);
      });
    }

    // Adicionar arquivos
    formData.append('diploma_document', data.diploma_document);
    formData.append('crm_document', data.crm_document);
    formData.append('identity_document', data.identity_document);
    if (data.address_proof_document) {
      formData.append('address_proof_document', data.address_proof_document);
    }

    const response = await api.post('/patient/apply-as-doctor', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Verificar status da solicitação
   */
  async checkApplicationStatus(): Promise<DoctorApplicationStatus> {
    const response = await api.get('/patient/doctor-application-status');
    return response.data;
  }

  /**
   * Admin: Listar médicos pendentes
   */
  async getPendingDoctors(): Promise<{ count: number; applications: PendingDoctor[] }> {
    const response = await api.get('/admin/doctors/pending');
    return response.data;
  }

  /**
   * Admin: Aprovar médico
   */
  async approveDoctor(doctorId: number) {
    const response = await api.post(`/admin/doctors/${doctorId}/approve`);
    return response.data;
  }

  /**
   * Admin: Rejeitar médico
   */
  async rejectDoctor(doctorId: number, reason: string) {
    const response = await api.post(`/admin/doctors/${doctorId}/reject`, { reason });
    return response.data;
  }
}

export default new DoctorApplicationService();
