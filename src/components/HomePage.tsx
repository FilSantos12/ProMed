import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from './ui/carousel';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, Clock, MapPin, Phone, Shield, Users, Award, Heart } from 'lucide-react';

interface HomePageProps {
  onSectionChange: (section: string) => void;
}

export function HomePage({ onSectionChange }: HomePageProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const carouselImages = [
    {
      url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwYXRpZW50JTIwY29uc3VsdGF0aW9ufGVufDF8fHx8MTc2MDY0Njc2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Atendimento Humanizado',
      description: 'Cuidado dedicado para cada paciente'
    },
    {
      url: '/img/banner1.png',
      title: 'Home',
      description: 'publicidade'
    },
    {
      url: 'https://images.unsplash.com/photo-1758206523830-a5b8afb372a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVjaG5vbG9neSUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NjA2NjYwMDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Tecnologia Avançada',
      description: 'Equipamentos de última geração'
    },
    {
      url: 'https://images.unsplash.com/photo-1758206523745-1f334f702660?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwdGVhbSUyMHByb2Zlc3Npb25hbHN8ZW58MXx8fHwxNzYwNjY2MDA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Equipe Especializada',
      description: 'Profissionais altamente qualificados'
    }
  ];

  // Autoplay effect
  useEffect(() => {
    if (!carouselApi) return;

    const intervalId = setInterval(() => {
      carouselApi.scrollNext();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [carouselApi]);

  const services = [
    {
      icon: Heart,
      title: 'Cardiologia',
      description: 'Cuidados especializados para seu coração'
    },
    {
      icon: Users,
      title: 'Clínica Geral',
      description: 'Atendimento médico completo para toda família'
    },
    {
      icon: Shield,
      title: 'Medicina Preventiva',
      description: 'Check-ups e exames de rotina'
    },
    {
      icon: Award,
      title: 'Especialistas',
      description: 'Médicos altamente qualificados'
    }
  ];

  const stats = [
    { number: '10+', label: 'Anos de Experiência' },
    { number: '11+', label: 'Médicos Especialistas' },
    { number: '100+', label: 'Pacientes Atendidos' },
    { number: '24/7', label: 'Atendimento' }
  ];

  return (
    <div className="min-h-screen">
      {/* Carousel Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            {/* Static content on the left */}
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-3xl lg:text-5xl text-gray-900">
                Cuidando da sua saúde com excelência
              </h2>
              <p className="text-lg lg:text-xl text-gray-600">
                Atendimento humanizado, profissionais qualificados para cuidar de você e sua família.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => onSectionChange('agendamentos')}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Consulta
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  onClick={() => onSectionChange('especialidades')}
                >
                  Ver Especialidades
                </Button>
              </div>
            </div>
            
            {/* Carousel with images on the right */}
            <div className="lg:col-span-2">
              <Carousel 
                className="w-full"
                setApi={setCarouselApi}
                opts={{
                  loop: true,
                }}
              >
                <CarouselContent>
                  {carouselImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative h-[280px] lg:h-[350px] rounded-2xl overflow-hidden shadow-xl">
                        <ImageWithFallback
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 bg-white/80 hover:bg-white text-blue-600 border-0" />
                <CarouselNext className="right-2 bg-white/80 hover:bg-white text-blue-600 border-0" />
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nossos Serviços
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Oferecemos uma ampla gama de serviços médicos com foco na qualidade e no atendimento humanizado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onSectionChange('especialidades')}
            >
              Ver Todas as Especialidades
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Pronto para cuidar da sua saúde?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Agende sua consulta hoje mesmo e conte com nossa equipe de especialistas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => onSectionChange('agendamentos')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Consulta
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => onSectionChange('contato')}
              >
                <Phone className="w-5 h-5 mr-2" />
                Entrar em Contato
              </Button>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}