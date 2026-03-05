import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Heart, Brain, Eye, Bone, Baby, Users, Activity, Stethoscope,
  Ear, Droplet, Search, Calendar, User, type LucideIcon,
} from 'lucide-react';
import { specialtyService, SpecialtyWithAvailability } from '../services/specialtyService';
import { LoadingSpinner } from './ui/loading-spinner';
import api from '../services/api';

interface EspecialidadesPageProps {
  onSectionChange: (section: string) => void;
  onBookDoctor?: (specialtyId: number, doctorId: number) => void;
}

interface Doctor {
  id: number;
  specialty_id: number;
  crm: string;
  crm_state: string;
  bio: string | null;
  years_experience: number;
  status: string;
  user: {
    id: number;
    name: string;
    avatar: string | null;
    avatar_url?: string;
  };
  specialty: {
    id: number;
    name: string;
    icon: string;
  };
}

const ICON_MAP: Record<string, LucideIcon> = {
  Heart, Brain, Eye, Ear, Bone, Activity, Stethoscope, Baby, Users, Droplet,
};

export function EspecialidadesPage({ onSectionChange, onBookDoctor }: EspecialidadesPageProps) {
  const [especialidades, setEspecialidades] = useState<SpecialtyWithAvailability[]>([]);
  const [filteredEspecialidades, setFilteredEspecialidades] = useState<SpecialtyWithAvailability[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, selectedSpecialty, doctors, especialidades]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [especialidadesData, doctorsData] = await Promise.all([
        specialtyService.getAvailableSpecialties(),
        api.get('/doctors'),
      ]);

      setEspecialidades(especialidadesData);
      setFilteredEspecialidades(especialidadesData);

      let doctorsArray: Doctor[] = [];
      if (doctorsData.data.data && Array.isArray(doctorsData.data.data)) {
        doctorsArray = doctorsData.data.data;
      } else if (Array.isArray(doctorsData.data)) {
        doctorsArray = doctorsData.data;
      }

      const activeDoctors = doctorsArray.filter(
        (doc) => doc.status === 'approved' || doc.status === 'active',
      );
      setDoctors(activeDoctors);
      setFilteredDoctors(activeDoctors);
    } catch (err: any) {
      setError('Erro ao carregar dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    const term = searchTerm.toLowerCase();

    setFilteredEspecialidades(
      especialidades.filter(
        (esp) =>
          !term ||
          esp.name.toLowerCase().includes(term) ||
          (esp.description && esp.description.toLowerCase().includes(term)),
      ),
    );

    setFilteredDoctors(
      doctors.filter((doc) => {
        const matchesTerm =
          !term ||
          doc.user.name.toLowerCase().includes(term) ||
          doc.specialty.name.toLowerCase().includes(term);
        const matchesSpecialty =
          !selectedSpecialty || doc.specialty_id === selectedSpecialty;
        return matchesTerm && matchesSpecialty;
      }),
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <Button onClick={loadData} className="mt-4">Tentar Novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  const totalSchedules = especialidades.reduce((sum, esp) => sum + esp.available_schedules_count, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Médicos e Especialidades</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça nossa equipe de especialistas e as áreas de atuação disponíveis na ProMed.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nome ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSpecialty || ''}
              onChange={(e) => setSelectedSpecialty(e.target.value ? Number(e.target.value) : null)}
              aria-label="Filtrar por especialidade"
            >
              <option value="">Todas as especialidades</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>{esp.name}</option>
              ))}
            </select>
          </div>
          {(searchTerm || selectedSpecialty) && (
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar filtros</Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="especialidades" className="mb-12">
          <TabsList className="mb-8">
            <TabsTrigger value="especialidades">
              Especialidades ({filteredEspecialidades.length})
            </TabsTrigger>
            <TabsTrigger value="medicos">
              Médicos ({filteredDoctors.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Especialidades */}
          <TabsContent value="especialidades">
            {filteredEspecialidades.length === 0 ? (
              <div className="text-center py-16">
                <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma especialidade encontrada</h3>
                <Button onClick={clearFilters} className="mt-4">Limpar Filtros</Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEspecialidades.map((especialidade) => {
                  const IconComponent = ICON_MAP[especialidade.icon] || Stethoscope;
                  return (
                    <Card
                      key={especialidade.id}
                      className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <IconComponent className="w-8 h-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl mb-2">{especialidade.name}</CardTitle>
                        <CardDescription className="text-base">{especialidade.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm text-gray-600 text-center space-y-1">
                          <div>
                            <span className="font-medium">{especialidade.doctors_count} médicos</span> disponíveis
                          </div>
                          <div className="text-xs text-green-600">
                            {especialidade.available_schedules_count} horários disponíveis
                          </div>
                        </div>
                        <Button className="w-full" onClick={() => onSectionChange('agendamentos')}>
                          Agendar Consulta
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Tab: Médicos */}
          <TabsContent value="medicos">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-16">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum médico encontrado</h3>
                <p className="text-gray-600 mb-6">Tente ajustar os filtros ou fazer uma nova busca</p>
                <Button onClick={clearFilters}>Limpar Filtros</Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDoctors.map((doctor) => {
                  const IconComponent = ICON_MAP[doctor.specialty.icon] || Stethoscope;
                  const avatarUrl =
                    doctor.user.avatar_url ||
                    (doctor.user.avatar
                      ? `${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '')}/storage/${doctor.user.avatar}`
                      : null);

                  return (
                    <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={doctor.user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML =
                                  '<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg">{doctor.user.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pb-6">
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-blue-600" />
                            </div>
                            <Badge variant="secondary">{doctor.specialty.name}</Badge>
                          </div>
                          <div className="text-sm text-gray-500">CRM {doctor.crm}-{doctor.crm_state}</div>
                          {doctor.years_experience > 0 && (
                            <div className="text-sm text-blue-600">
                              {doctor.years_experience}{' '}
                              {doctor.years_experience === 1 ? 'ano' : 'anos'} de experiência
                            </div>
                          )}
                        </div>
                        {doctor.bio && (
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{doctor.bio}</p>
                        )}
                        <Button
                          className="w-full"
                          onClick={() =>
                            onBookDoctor
                              ? onBookDoctor(doctor.specialty_id, doctor.id)
                              : onSectionChange('agendamentos')
                          }
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Agendar Consulta
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <div className="bg-white rounded-xl p-8 text-center shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Não encontrou o que procura?
          </h3>
          <p className="text-gray-600 mb-6">
            Entre em contato conosco e nossa equipe te ajudará a encontrar o especialista ideal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" onClick={() => onSectionChange('contato')}>
              Entrar em Contato
            </Button>
            <Button variant="outline" onClick={() => onSectionChange('agendamentos')}>
              Agendar Consulta
            </Button>
          </div>
        </div>

        {/* Stats */}
        {especialidades.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{doctors.length}</div>
              <div className="text-gray-600">Médicos Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{especialidades.length}</div>
              <div className="text-gray-600">Especialidades Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalSchedules}</div>
              <div className="text-gray-600">Horários Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Atendimento</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
