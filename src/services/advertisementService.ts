import api from './api';

export interface Advertisement {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string;
  category: 'medicamento' | 'campanha' | 'dispositivo' | 'educacao' | 'outro';
  target_audience: 'medico' | 'paciente' | 'todos';
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export type AdvertisementForm = Omit<Advertisement, 'id' | 'created_at' | 'updated_at'>;

const advertisementService = {
  // Para médicos: lista anúncios ativos
  getActive: async (): Promise<Advertisement[]> => {
    const { data } = await api.get('/advertisements');
    return data;
  },

  // Admin: lista todos
  adminList: async (): Promise<Advertisement[]> => {
    const { data } = await api.get('/admin/advertisements');
    return data;
  },

  create: async (form: Partial<AdvertisementForm>): Promise<Advertisement> => {
    const { data } = await api.post('/admin/advertisements', form);
    return data.advertisement;
  },

  update: async (id: number, form: Partial<AdvertisementForm>): Promise<Advertisement> => {
    const { data } = await api.put(`/admin/advertisements/${id}`, form);
    return data.advertisement;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/advertisements/${id}`);
  },

  toggleStatus: async (id: number): Promise<Advertisement> => {
    const { data } = await api.patch(`/admin/advertisements/${id}/toggle-status`);
    return data.advertisement;
  },
};

export default advertisementService;
