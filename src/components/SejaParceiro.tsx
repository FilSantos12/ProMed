import {
  Calendar,
  Users,
  Shield,
  TrendingUp,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  FileText,
  HeartPulse,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface SejaParceiroProps {
  onSectionChange: (section: string) => void;
}

export function SejaParceiro({ onSectionChange }: SejaParceiroProps) {
  const benefits = [
    {
      icon: Users,
      title: 'Amplie sua carteira de pacientes',
      description:
        'Conecte-se a novos pacientes que buscam atendimento de qualidade na sua especialidade.',
    },
    {
      icon: Calendar,
      title: 'Gerencie sua agenda online',
      description:
        'Configure seus horários, datas e intervalos diretamente pela plataforma, sem complicações.',
    },
    {
      icon: TrendingUp,
      title: 'Cresça profissionalmente',
      description:
        'Acompanhe métricas, avaliações e histórico de atendimentos para evoluir sua prática.',
    },
    {
      icon: Shield,
      title: 'Plataforma segura e profissional',
      description:
        'Seus dados e os dos seus pacientes protegidos com segurança de ponta a ponta.',
    },
    {
      icon: Clock,
      title: 'Otimize seu tempo',
      description:
        'Reduza o tempo gasto com ligações e confirmações. Tudo é feito automaticamente.',
    },
    {
      icon: Star,
      title: 'Receba avaliações e destaque-se',
      description:
        'Pacientes satisfeitos deixam avaliações que aumentam sua visibilidade na plataforma.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Crie seu cadastro',
      description:
        'Preencha o formulário com seus dados profissionais, CRM e especialidade. Leva menos de 5 minutos.',
      icon: FileText,
    },
    {
      number: '02',
      title: 'Aguarde a aprovação',
      description:
        'Nossa equipe analisa seu cadastro e valida suas credenciais. Você será notificado por e-mail.',
      icon: Shield,
    },
    {
      number: '03',
      title: 'Configure sua agenda',
      description:
        'Defina seus dias e horários de atendimento conforme sua disponibilidade.',
      icon: Calendar,
    },
    {
      number: '04',
      title: 'Comece a atender',
      description:
        'Pacientes já podem agendar consultas com você. Bem-vindo à equipe ProMed!',
      icon: HeartPulse,
    },
  ];

  const requirements = [
    'CRM ativo e regular',
    'Diploma de graduação em Medicina',
    'Especialização reconhecida (quando aplicável)',
    'Documento de identidade válido',
    'Foto profissional recente',
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="text-white py-20" style={{ background: 'linear-gradient(to bottom right, #1d4ed8, #2563eb, #3b82f6)' }}>
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-6 text-sm px-4 py-1">
            Para profissionais de saúde
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Seja nosso Parceiro
          </h1>
          <p className="text-xl lg:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto leading-relaxed">
            Junte-se à ProMed e expanda seu alcance profissional. Conecte-se a
            pacientes, gerencie sua agenda e cresça com uma plataforma feita
            para médicos.
          </p>
          <p className="text-blue-200 mb-10 text-lg">
            Cadastro gratuito · Aprovação rápida · Suporte dedicado
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-lg px-10 py-6 rounded-xl shadow-xl"
            onClick={() => onSectionChange('cadastro-profissional')}
          >
            Criar minha conta agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Como funciona?
            </h2>
            <p className="text-lg text-gray-600">
              Em 4 passos simples você já estará atendendo pela ProMed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                    <div className="text-4xl font-black text-blue-100 mb-3">{step.number}</div>
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-blue-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Por que se tornar parceiro ProMed?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Uma plataforma completa para você focar no que mais importa: cuidar dos seus pacientes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={i}
                  className="border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Requisitos para adesão
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Para garantir a qualidade e segurança dos nossos pacientes, solicitamos alguns
                documentos para validar seu cadastro profissional.
              </p>
              <ul className="space-y-3">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">ProMed Parceiros</div>
                  <div className="text-sm text-gray-500">Cadastro profissional</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                Nossa equipe analisa cada cadastro individualmente para garantir que apenas
                profissionais habilitados façam parte da rede ProMed. O prazo médio de
                aprovação é de <strong>1 a 3 dias úteis</strong>.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Sem taxa de cadastro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Suporte durante todo o processo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Notificação por e-mail a cada etapa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20" style={{ backgroundColor: '#1d4ed8' }}>
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Pronto para fazer parte da ProMed?
          </h2>
          <p className="text-blue-100 text-xl mb-10">
            Crie sua conta agora e comece a atender novos pacientes em breve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-lg px-10 py-6 rounded-xl"
              onClick={() => onSectionChange('cadastro-profissional')}
            >
              Criar minha conta
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white bg-transparent hover:bg-white/10 text-lg px-10 py-6 rounded-xl"
              onClick={() => onSectionChange('contato')}
            >
              Falar com a equipe
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
