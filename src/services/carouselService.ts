import api from './api';

export interface CarouselSlide {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export type CarouselSlideForm = Omit<CarouselSlide, 'id' | 'created_at' | 'updated_at'>;

const carouselService = {
  // Público — usado na HomePage
  getActive: async (): Promise<CarouselSlide[]> => {
    const { data } = await api.get('/carousel-slides');
    return data;
  },

  // Admin
  adminList: async (): Promise<CarouselSlide[]> => {
    const { data } = await api.get('/admin/carousel-slides');
    return data;
  },

  create: async (form: Partial<CarouselSlideForm>): Promise<CarouselSlide> => {
    const { data } = await api.post('/admin/carousel-slides', form);
    return data.slide;
  },

  update: async (id: number, form: Partial<CarouselSlideForm>): Promise<CarouselSlide> => {
    const { data } = await api.put(`/admin/carousel-slides/${id}`, form);
    return data.slide;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/carousel-slides/${id}`);
  },

  toggleStatus: async (id: number): Promise<CarouselSlide> => {
    const { data } = await api.patch(`/admin/carousel-slides/${id}/toggle-status`);
    return data.slide;
  },
};

export default carouselService;
