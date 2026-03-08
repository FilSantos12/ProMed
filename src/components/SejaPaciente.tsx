import {
  Calendar,
  Clock,
  Shield,
  Heart,
  FileText,
  CheckCircle2,
  ArrowRight,
  User,
  HeartPulse,
  Bell,
  Lock,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface SejaPacienteProps {
  onSectionChange: (section: string) => void;
}

const TEAL = {
  700: '#0f766e',
  600: '#0d9488',
  500: '#14b8a6',
  100: '#ccfbf1',
  50:  '#f0fdfa',
};

export function SejaPaciente({ onSectionChange }: SejaPacienteProps) {
  const benefits = [
    {
      icon: Calendar,
      title: 'Agende consultas com facilidade',
      description:
        'Marque consultas online em minutos, sem filas e sem ligações. Escolha o médico, data e horário.',
    },
    {
      icon: Heart,
      title: 'Escolha seu especialista',
      description:
        'Acesse nossa rede de médicos qualificados e escolha o profissional ideal para o seu caso.',
    },
    {
      icon: FileText,
      title: 'Histórico médico organizado',
      description:
        'Tenha acesso ao seu histórico de consultas e prontuários em um só lugar, a qualquer hora.',
    },
    {
      icon: Bell,
      title: 'Lembretes e confirmações',
      description:
        'Receba notificações sobre suas consultas para nunca perder um agendamento importante.',
    },
    {
      icon: Shield,
      title: 'Dados protegidos',
      description:
        'Suas informações de saúde são tratadas com total sigilo e segurança, seguindo as normas da LGPD.',
    },
    {
      icon: Clock,
      title: 'Reagende quando precisar',
      description:
        'Precisou mudar a data? Reagende sua consulta diretamente pela plataforma, sem burocracia.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Crie sua conta',
      description:
        'Preencha seus dados pessoais e crie sua conta gratuitamente. Leva menos de 3 minutos.',
      icon: User,
    },
    {
      number: '02',
      title: 'Complete seu perfil',
      description:
        'Informe seus dados de saúde para que os médicos possam atendê-lo da melhor forma.',
      icon: FileText,
    },
    {
      number: '03',
      title: 'Escolha seu médico',
      description:
        'Navegue pela nossa lista de especialistas e encontre o profissional ideal para você.',
      icon: Heart,
    },
    {
      number: '04',
      title: 'Agende sua consulta',
      description:
        'Selecione a data e horário disponíveis e confirme seu agendamento em poucos cliques.',
      icon: HeartPulse,
    },
  ];

  const guarantees = [
    'Cadastro 100% gratuito',
    'Sem mensalidades ou taxas ocultas',
    'Dados protegidos pela LGPD',
    'Cancelamento e reagendamento facilitados',
    'Suporte disponível para dúvidas',
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section
        className="text-white py-20"
        style={{ background: `linear-gradient(to bottom right, ${TEAL[700]}, ${TEAL[600]}, ${TEAL[500]})` }}
      >
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <Badge className="mb-6 text-sm px-4 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            Para pacientes
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Seja nosso Paciente
          </h1>
          <p className="text-xl lg:text-2xl mb-4 max-w-3xl mx-auto leading-relaxed" style={{ color: '#99f6e4' }}>
            Cuide da sua saúde com praticidade. Agende consultas, acompanhe seu
            histórico e encontre os melhores especialistas na ProMed.
          </p>
          <p className="mb-10 text-lg" style={{ color: '#5eead4' }}>
            Cadastro gratuito · Sem burocracia · Sua saúde em primeiro lugar
          </p>
          <Button
            size="lg"
            className="font-semibold text-lg px-10 py-6 rounded-xl shadow-xl"
            style={{ backgroundColor: 'white', color: TEAL[700] }}
            onClick={() => onSectionChange('cadastro-paciente')}
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
              Em 4 passos simples você já está cuidando da sua saúde pela ProMed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                    <div className="text-4xl font-black mb-3" style={{ color: TEAL[100] }}>{step.number}</div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: TEAL[600] }}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6" style={{ color: TEAL[500] }} />
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
              Por que ser paciente ProMed?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para cuidar da sua saúde em um só lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <Card key={i} className="border border-gray-100 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: TEAL[100] }}>
                      <Icon className="w-6 h-6" style={{ color: TEAL[600] }} />
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

      {/* Guarantees Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nossas garantias para você
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Sua confiança é nossa prioridade. Por isso, oferecemos total
                transparência e segurança em cada etapa do seu cuidado com a saúde.
              </p>
              <ul className="space-y-3">
                {guarantees.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: TEAL[500] }} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-8 border" style={{ backgroundColor: TEAL[50], borderColor: TEAL[100] }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: TEAL[600] }}>
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Privacidade e Segurança</div>
                  <div className="text-sm text-gray-500">Seus dados protegidos</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                Todas as suas informações pessoais e de saúde são armazenadas com
                criptografia e seguem rigorosamente as diretrizes da{' '}
                <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. Você tem
                controle total sobre seus dados.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                {[
                  'Dados criptografados em trânsito e em repouso',
                  'Acesso somente por profissionais autorizados',
                  'Você pode solicitar exclusão dos dados a qualquer momento',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: TEAL[500] }} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20" style={{ backgroundColor: TEAL[700] }}>
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Cuide da sua saúde hoje mesmo
          </h2>
          <p className="text-xl mb-10" style={{ color: '#99f6e4' }}>
            Crie sua conta gratuita e agende sua primeira consulta em minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="font-semibold text-lg px-10 py-6 rounded-xl"
              style={{ backgroundColor: 'white', color: TEAL[700] }}
              onClick={() => onSectionChange('cadastro-paciente')}
            >
              Criar minha conta
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white bg-transparent hover:bg-white/10 text-lg px-10 py-6 rounded-xl"
              onClick={() => onSectionChange('agendamentos')}
            >
              Ver médicos disponíveis
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
