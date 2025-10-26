import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Brain, Eye, Bone, Baby, Users, Activity, Stethoscope } from 'lucide-react';

interface EspecialidadesPageProps {
  onSectionChange: (section: string) => void;
}

export function EspecialidadesPage({ onSectionChange }: EspecialidadesPageProps) {
  const especialidades = [
    {
      icon: Heart,
      title: 'Cardiologia',
      description: 'Diagnóstico e tratamento de doenças cardiovasculares',
      doctorsCount: 8,
      services: ['Ecocardiograma', 'Teste Ergométrico', 'Holter 24h', 'Consulta Cardiológica'],
      available: true
    },
    {
      icon: Brain,
      title: 'Neurologia',
      description: 'Tratamento de distúrbios do sistema nervoso',
      doctorsCount: 5,
      services: ['EEG', 'Consulta Neurológica', 'Tratamento de Enxaqueca', 'Avaliação Cognitiva'],
      available: true
    },
    {
      icon: Eye,
      title: 'Oftalmologia',
      description: 'Cuidados completos para a saúde dos seus olhos',
      doctorsCount: 6,
      services: ['Exame de Vista', 'Cirurgia de Catarata', 'Tratamento de Glaucoma', 'Retinografia'],
      available: true
    },
    {
      icon: Bone,
      title: 'Ortopedia',
      description: 'Tratamento de lesões e doenças do sistema musculoesquelético',
      doctorsCount: 7,
      services: ['Raio-X', 'Ressonância Magnética', 'Fisioterapia', 'Cirurgia Ortopédica'],
      available: true
    },
    {
      icon: Baby,
      title: 'Pediatria',
      description: 'Cuidados médicos especializados para crianças e adolescentes',
      doctorsCount: 10,
      services: ['Puericultura', 'Vacinação', 'Consulta Pediátrica', 'Desenvolvimento Infantil'],
      available: true
    },
    {
      icon: Users,
      title: 'Clínica Geral',
      description: 'Atendimento médico abrangente para toda a família',
      doctorsCount: 12,
      services: ['Check-up Geral', 'Exames de Rotina', 'Consulta Geral', 'Medicina Preventiva'],
      available: true
    },
    {
      icon: Activity,
      title: 'Endocrinologia',
      description: 'Tratamento de distúrbios hormonais e metabólicos',
      doctorsCount: 4,
      services: ['Diabetes', 'Tireoide', 'Obesidade', 'Distúrbios Hormonais'],
      available: true
    },
    {
      icon: Stethoscope,
      title: 'Pneumologia',
      description: 'Especialidade focada em doenças respiratórias',
      doctorsCount: 3,
      services: ['Espirometria', 'Bronquioscopia', 'Consulta Pneumológica', 'Tratamento de Asma'],
      available: false
    }
  ];

  const handleAgendarConsulta = (especialidade: string) => {
    onSectionChange('agendamentos');
  };

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

        {/* Especialidades Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {especialidades.map((especialidade, index) => {
            const Icon = especialidade.icon;
            return (
              <Card 
                key={index} 
                className={`hover:shadow-lg transition-all duration-300 ${
                  !especialidade.available ? 'opacity-75' : 'hover:-translate-y-1'
                }`}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CardTitle className="text-xl">{especialidade.title}</CardTitle>
                    {!especialidade.available && (
                      <Badge variant="secondary" className="text-xs">
                        Em breve
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">
                    {especialidade.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600 text-center">
                    <span className="font-medium">{especialidade.doctorsCount} médicos</span> especialistas
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Serviços oferecidos:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {especialidade.services.map((service, serviceIndex) => (
                        <li key={serviceIndex} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full"
                    disabled={!especialidade.available}
                    onClick={() => handleAgendarConsulta(especialidade.title)}
                  >
                    {especialidade.available ? 'Agendar Consulta' : 'Em breve'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">20+</div>
            <div className="text-gray-600">Médicos Especialistas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">8</div>
            <div className="text-gray-600">Especialidades Ativas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">10+</div>
            <div className="text-gray-600">Anos de Experiência</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Atendimento</div>
          </div>
        </div>
      </div>
    </div>
  );
}