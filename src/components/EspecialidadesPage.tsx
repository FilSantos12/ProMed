import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Heart, Brain, Eye, Bone, Baby, Users, Activity, Stethoscope, Ear, Droplet, type LucideIcon } from 'lucide-react';
import { specialtyService, SpecialtyWithAvailability } from '../services/specialtyService';
import { LoadingSpinner } from './ui/loading-spinner';

interface EspecialidadesPageProps {
  onSectionChange: (section: string) => void;
}

// Mapeamento de ícones
const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  Brain,
  Eye,
  Ear,
  Bone,
  Activity,
  Stethoscope,
  Baby,
  Users,
  Droplet,
};

export function EspecialidadesPage({ onSectionChange }: EspecialidadesPageProps) {
  const [especialidades, setEspecialidades] = useState<SpecialtyWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEspecialidades();
  }, []);

  const loadEspecialidades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await specialtyService.getAvailableSpecialties();
      console.log('Especialidades disponíveis:', data);
      setEspecialidades(data);
    } catch (err: any) {
      console.error('Erro ao carregar especialidades:', err);
      setError('Erro ao carregar especialidades. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgendarConsulta = () => {
    onSectionChange('agendamentos');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando especialidades...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <Button onClick={loadEspecialidades} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calcular estatísticas dinamicamente
  const totalDoctors = especialidades.reduce((sum, esp) => sum + esp.doctors_count, 0);
  const totalSchedules = especialidades.reduce((sum, esp) => sum + esp.available_schedules_count, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nossas Especialidades
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Contamos com uma equipe multidisciplinar de especialistas altamente qualificados,
            prontos para oferecer o melhor atendimento em diversas áreas da medicina.
          </p>
        </div>

        {especialidades.length === 0 ? (
          <div className="text-center py-16">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma especialidade disponível no momento
            </h3>
            <p className="text-gray-600 mb-6">
              Estamos trabalhando para trazer novos especialistas para você.
            </p>
            <Button onClick={() => onSectionChange('contato')}>
              Entre em Contato
            </Button>
          </div>
        ) : (
          <>
            {/* Especialidades Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {especialidades.map((especialidade) => {
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
                      <CardDescription className="text-base">
                        {especialidade.description}
                      </CardDescription>
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

                      <Button
                        className="w-full"
                        onClick={handleAgendarConsulta}
                      >
                        Agendar Consulta
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* CTA Section */}
        <div className="bg-white rounded-xl p-8 text-center shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Não encontrou a especialidade que procura?
          </h3>
          <p className="text-gray-600 mb-6">
            Entre em contato conosco e nossa equipe te ajudará a encontrar o especialista ideal para suas necessidades.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default"
              onClick={() => onSectionChange('contato')}
            >
              Entrar em Contato
            </Button>
            <Button 
              variant="outline"
              onClick={() => onSectionChange('agendamentos')}
            >
              Agendar Consulta
            </Button>
          </div>
        </div>

        {/* Stats */}
        {especialidades.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalDoctors}</div>
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