import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Award, Users, Heart, Shield, Search, Calendar, User, Stethoscope, type LucideIcon } from 'lucide-react';
import { LoadingSpinner } from './ui/loading-spinner';
import api from '../services/api';
import { specialtyService } from '../services/specialtyService';

interface SobrePageProps {
  onSectionChange?: (section: string) => void;
}

interface Doctor {
  id: number;
  user_id: number;
  specialty_id: number;
  crm: string;
  crm_state: string;
  bio: string | null;
  consultation_price: number;
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
  available_schedules_count?: number;
}

interface Specialty {
  id: number;
  name: string;
  icon: string;
}

// Mapeamento de ícones
const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  Brain: Award,
  Eye: Users,
  Ear: Users,
  Bone: Users,
  Activity: Heart,
  Stethoscope,
  Baby: Users,
  Users,
  Droplet: Users,
};

export function SobrePage({ onSectionChange }: SobrePageProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);

  const values = [
    {
      icon: Heart,
      title: 'Cuidado Humanizado',
      description: 'Tratamos cada paciente com respeito, empatia e dedicação individual.'
    },
    {
      icon: Award,
      title: 'Excelência Médica',
      description: 'Nossos profissionais são altamente qualificados e estão sempre atualizados.'
    },
    {
      icon: Shield,
      title: 'Segurança e Qualidade',
      description: 'Seguimos os mais rigorosos protocolos de segurança e qualidade.'
    },
    {
      icon: Users,
      title: 'Trabalho em Equipe',
      description: 'Colaboração multidisciplinar para oferecer o melhor cuidado.'
    }
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedSpecialty, doctors]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsData, specialtiesData] = await Promise.all([
        api.get('/doctors'),
        specialtyService.getAll()
      ]);

      console.log('Resposta completa dos médicos:', doctorsData.data);
      console.log('Dados das especialidades:', specialtiesData);

      // O backend retorna paginação, então os dados estão em data.data
      let doctorsArray = [];
      if (doctorsData.data.data && Array.isArray(doctorsData.data.data)) {
        // Dados paginados
        doctorsArray = doctorsData.data.data;
      } else if (Array.isArray(doctorsData.data)) {
        // Dados diretos (sem paginação)
        doctorsArray = doctorsData.data;
      }

      console.log('Médicos encontrados:', doctorsArray.length);
      console.log('Médicos:', doctorsArray);

      // Filtrar apenas médicos com status approved ou active
      const activeDoctors = doctorsArray.filter(
        (doc: Doctor) => doc.status === 'approved' || doc.status === 'active'
      );

      console.log('Médicos ativos/aprovados:', activeDoctors.length);

      setDoctors(activeDoctors);
      setFilteredDoctors(activeDoctors);
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Filtrar por termo de busca (nome ou especialidade)
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por especialidade selecionada
    if (selectedSpecialty) {
      filtered = filtered.filter((doctor) => doctor.specialty_id === selectedSpecialty);
    }

    setFilteredDoctors(filtered);
  };

  const handleAgendarConsulta = () => {
    if (onSectionChange) {
      onSectionChange('agendamentos');
    }
  };

  // Calcular estatísticas
  const totalDoctors = doctors.length;
  const totalSpecialties = new Set(doctors.map((d) => d.specialty_id)).size;
  const avgExperience = doctors.length > 0
    ? Math.round(doctors.reduce((sum, d) => sum + d.years_experience, 0) / doctors.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sobre a ProMed
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Há mais de 10 anos cuidando da saúde e bem-estar de nossa comunidade com excelência, 
            tecnologia avançada e um atendimento verdadeiramente humanizado.
          </p>
        </div>

        {/* Hero Image and Mission */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Nossa Missão</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Oferecer cuidados médicos de excelência, combinando tecnologia avançada com 
                atendimento humanizado, promovendo a saúde e o bem-estar de nossos pacientes 
                e da comunidade.
              </p>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Nossos Valores:</h3>
                <div className="grid grid-cols-1 gap-4">
                  {values.map((value, index) => {
                    const Icon = value.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{value.title}</h4>
                          <p className="text-gray-600 text-sm">{value.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="/img/banner_sobre.jpg"
                  alt="Equipe médica da ProMed"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Nossos Médicos */}
        <section className="mb-15">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossos Médicos</h2>
            <p className="text-lg text-gray-600 mb-8">
              Conheça os profissionais que fazem parte da nossa equipe
            </p>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por especialidade */}
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSpecialty || ''}
                onChange={(e) => setSelectedSpecialty(e.target.value ? Number(e.target.value) : null)}
                aria-label="Filtrar por especialidade"
              >
                <option value="">Todas as especialidades</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contadores */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'médico encontrado' : 'médicos encontrados'}
              </span>
              {(searchTerm || selectedSpecialty) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty(null);
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Carregando médicos...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-16">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum médico encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Tente ajustar os filtros ou fazer uma nova busca
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty(null);
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDoctors.map((doctor) => {
                const IconComponent = ICON_MAP[doctor.specialty.icon] || Stethoscope;

                // Usar avatar_url se disponível, senão construir URL manualmente
                const avatarUrl = (doctor.user as any).avatar_url ||
                                (doctor.user.avatar
                                  ? `http://localhost:8000/storage/${doctor.user.avatar}`
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
                              console.log('Erro ao carregar avatar:', avatarUrl);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2">{doctor.user.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-blue-600" />
                          </div>
                          <Badge variant="secondary">{doctor.specialty.name}</Badge>
                        </div>
                        <div className="text-sm text-gray-500 mb-1">
                          CRM {doctor.crm}-{doctor.crm_state}
                        </div>
                        {doctor.years_experience > 0 && (
                          <div className="text-sm text-blue-600">
                            {doctor.years_experience} {doctor.years_experience === 1 ? 'ano' : 'anos'} de experiência
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {doctor.bio && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                          {doctor.bio}
                        </p>
                      )}
                      <Button className="w-full" onClick={handleAgendarConsulta}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar Consulta
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Facilities and Statistics */}
        {!loading && doctors.length > 0 && (
          <section className="mb-15">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">{totalDoctors}</div>
                <div className="text-gray-600">Médicos Ativos</div>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">{totalSpecialties}</div>
                <div className="text-gray-600">Especialidades</div>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">{avgExperience}+</div>
                <div className="text-gray-600">Anos de Experiência Média</div>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Atendimento</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}