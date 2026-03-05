import { Award, Users, Heart, Shield } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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

export function SobrePage({ onSectionChange: _ }: SobrePageProps) {
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

      </div>
    </div>
  );
}
