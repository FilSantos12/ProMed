import { useEffect, useState } from "react";
import { Award, Users, Heart, Shield } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "./ui/carousel";
import carouselService, { CarouselSlide } from "../services/carouselService";

interface SobrePageProps {
  onSectionChange?: (section: string) => void;
}

const values = [
  {
    icon: Heart,
    title: "Cuidado Humanizado",
    description: "Tratamos cada paciente com respeito, empatia e dedicação individual.",
  },
  {
    icon: Award,
    title: "Excelência Médica",
    description: "Nossos profissionais são altamente qualificados e estão sempre atualizados.",
  },
  {
    icon: Shield,
    title: "Segurança e Qualidade",
    description: "Seguimos os mais rigorosos protocolos de segurança e qualidade.",
  },
  {
    icon: Users,
    title: "Trabalho em Equipe",
    description: "Colaboração multidisciplinar para oferecer o melhor cuidado.",
  },
];

const FALLBACK_SLIDE = "/img/banner_sobre.jpg";

export function SobrePage({ onSectionChange: _ }: SobrePageProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    carouselService.getActive('sobre')
      .then((data) => { if (data.length > 0) setSlides(data); })
      .catch(() => { /* mantém fallback */ });
  }, []);

  useEffect(() => {
    if (!carouselApi || slides.length <= 1) return;
    const id = setInterval(() => carouselApi.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [carouselApi, slides]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sobre a ProMed</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Há mais de 10 anos cuidando da saúde e bem-estar de nossa comunidade com excelência,
            tecnologia avançada e um atendimento verdadeiramente humanizado.
          </p>
        </div>

        {/* Missão + Valores + Imagem */}
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

            {/* Imagem dinâmica ou fallback */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {slides.length > 0 ? (
                <Carousel setApi={setCarouselApi} className="w-full">
                  <CarouselContent>
                    {slides.map((slide, index) => (
                      <CarouselItem key={slide.id || index}>
                        <div className="relative h-96">
                          <ImageWithFallback
                            src={slide.image_url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                          {(slide.title || slide.description) && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                              {slide.title && (
                                <p className="text-white font-semibold text-sm">{slide.title}</p>
                              )}
                              {slide.description && (
                                <p className="text-white/80 text-xs">{slide.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {slides.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>
                  )}
                </Carousel>
              ) : (
                <ImageWithFallback
                  src={FALLBACK_SLIDE}
                  alt="Equipe médica da ProMed"
                  className="w-full h-96 object-cover"
                />
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
