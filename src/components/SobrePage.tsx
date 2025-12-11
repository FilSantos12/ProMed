import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Award, Users, Heart, Shield, Clock, MapPin } from 'lucide-react';

export function SobrePage() {
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

  const team = [
    {
      name: 'Dr. Roberto Silva',
      specialty: 'Diretor Clínico',
      credentials: 'CRM 12345-SP',
      experience: '25 anos de experiência',
      description: 'Especialista em Clínica Geral e Medicina Interna com pós-graduação em Gestão Hospitalar.',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Dra. Maria Santos',
      specialty: 'Cardiologista',
      credentials: 'CRM 23456-SP',
      experience: '18 anos de experiência',
      description: 'Especialista em Cardiologia Intervencionista com fellowship em Harvard Medical School.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Dr. Carlos Oliveira',
      specialty: 'Neurologista',
      credentials: 'CRM 34567-SP',
      experience: '20 anos de experiência',
      description: 'Especialista em Neurologia com foco em doenças neurodegenerativas e epilepsia.',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Dra. Ana Costa',
      specialty: 'Pediatra',
      credentials: 'CRM 45678-SP',
      experience: '15 anos de experiência',
      description: 'Especialista em Pediatria e Neonatologia com foco em desenvolvimento infantil.',
      image: 'https://images.unsplash.com/photo-1594824475317-a8e0e0fc3e1e?w=400&h=400&fit=crop&crop=face'
    }
  ];

  const milestones = [
    { year: '2008', event: 'Fundação da ProMed' },
    { year: '2012', event: 'Certificação ISO 9001' },
    { year: '2015', event: 'Inauguração do novo prédio' },
    { year: '2018', event: 'Implementação de prontuário eletrônico' },
    { year: '2020', event: 'Telemedicina durante a pandemia' },
    { year: '2023', event: '15 anos de excelência em saúde' }
  ];

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
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-">
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

        {/* Leadership Team */}
        <section className="mb-15">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa Equipe</h2>
            <p className="text-lg text-gray-600">
              Conheça alguns dos profissionais que lideram nossa equipe médica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mb-2">
                      {member.specialty}
                    </Badge>
                    <div className="text-sm text-gray-500">{member.credentials}</div>
                    <div className="text-sm text-blue-600">{member.experience}</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Facilities and Statistics */}
        <section className="mb-15">
          <div className="grid lg:grid-cols-1 gap-12">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">20+</div>
                <div className="text-gray-600">Médicos</div>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">10+</div>
                <div className="text-gray-600">Anos de Experiência</div>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
                <div className="text-gray-600">Pacientes Atendidos</div>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">8</div>
                <div className="text-gray-600">Especialidades</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}