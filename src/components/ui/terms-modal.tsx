import React from 'react';
import { X, FileText } from 'lucide-react';
import { Button } from './button';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export function TermsModal({ isOpen, onClose, type }: TermsModalProps) {
  if (!isOpen) return null;

  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl"
        style={{ 
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header - Fixo no topo */}
        <div 
          className="flex items-center justify-between p-6 border-b bg-white"
          style={{ flexShrink: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">
              {isTerms ? 'Termos de Uso' : 'Política de Privacidade'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content - Com scroll */}
        <div 
          className="p-6"
          style={{ 
            overflowY: 'auto',
            flex: 1
          }}
        >
          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Footer - Fixo no rodapé */}
        <div 
          className="flex justify-end gap-3 p-6 border-t bg-white"
          style={{ flexShrink: 0 }}
        >
          <Button onClick={onClose} variant="default">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

// Conteúdo dos Termos de Uso
function TermsContent() {
  return (
    <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h4>
        <p>
          Ao acessar e utilizar a plataforma ProMed, você concorda em cumprir e estar vinculado aos 
          seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, 
          não deverá utilizar nossos serviços.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">2. Descrição dos Serviços</h4>
        <p>
          A ProMed é uma plataforma digital que conecta pacientes e profissionais de saúde, facilitando 
          o agendamento de consultas médicas, gerenciamento de prontuários e comunicação entre as partes.
        </p>
        <p className="mt-2">Os serviços incluem:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Agendamento online de consultas médicas</li>
          <li>Gerenciamento de histórico médico e prontuários</li>
          <li>Comunicação segura entre pacientes e médicos</li>
          <li>Lembretes e notificações de consultas</li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">3. Cadastro e Conta de Usuário</h4>
        <p>
          Para utilizar determinados serviços da plataforma, você deve criar uma conta fornecendo 
          informações precisas, completas e atualizadas. Você é responsável por:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Manter a confidencialidade de sua senha</li>
          <li>Todas as atividades realizadas em sua conta</li>
          <li>Notificar imediatamente qualquer uso não autorizado</li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">4. Uso Adequado da Plataforma</h4>
        <p>Você concorda em NÃO:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Usar a plataforma para qualquer finalidade ilegal ou não autorizada</li>
          <li>Tentar obter acesso não autorizado a sistemas ou redes</li>
          <li>Transmitir vírus, malware ou código malicioso</li>
          <li>Fazer uso comercial não autorizado da plataforma</li>
          <li>Violar direitos de propriedade intelectual</li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">5. Responsabilidades Médicas</h4>
        <p>
          A ProMed atua como intermediária entre pacientes e profissionais de saúde. A plataforma 
          não é responsável por:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Diagnósticos, tratamentos ou decisões médicas</li>
          <li>Qualidade do atendimento prestado pelos profissionais</li>
          <li>Resultados de procedimentos ou tratamentos</li>
        </ul>
        <p className="mt-2">
          Os profissionais de saúde são independentes e responsáveis por seus próprios serviços.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">6. Cancelamentos e Reembolsos</h4>
        <p>
          Cancelamentos de consultas devem ser feitos com no mínimo 24 horas de antecedência. 
          Políticas específicas de cancelamento e reembolso podem variar conforme o profissional.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">7. Propriedade Intelectual</h4>
        <p>
          Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, ícones e software, 
          é propriedade da ProMed ou de seus licenciadores e está protegido por leis de direitos autorais.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">8. Limitação de Responsabilidade</h4>
        <p>
          A ProMed não será responsável por quaisquer danos indiretos, incidentais, especiais ou 
          consequenciais resultantes do uso ou incapacidade de usar a plataforma.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">9. Modificações nos Termos</h4>
        <p>
          Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas 
          serão notificadas por email ou através da plataforma.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">10. Lei Aplicável</h4>
        <p>
          Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa 
          será resolvida nos tribunais competentes de São Paulo/SP.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">11. Contato</h4>
        <p>
          Para dúvidas sobre estes termos, entre em contato conosco:
        </p>
        <ul className="list-none pl-0 mt-2 space-y-1">
          <li>Email: suporte@promed.com.br</li>
          <li>Telefone: (11) 3000-0000</li>
          <li>Endereço: Av. Paulista, 1000 - São Paulo/SP</li>
        </ul>
      </section>

      <div className="mt-8 pt-6 border-t">
        <p className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}

// Conteúdo da Política de Privacidade
function PrivacyContent() {
  return (
    <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">1. Introdução</h4>
        <p>
          A ProMed está comprometida com a proteção da privacidade e dos dados pessoais de seus usuários. 
          Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas 
          informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">2. Dados Coletados</h4>
        <p>Coletamos as seguintes categorias de dados pessoais:</p>
        
        <div className="mt-3">
          <p className="font-semibold">2.1. Dados de Cadastro:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Nome completo</li>
            <li>CPF e RG</li>
            <li>Data de nascimento</li>
            <li>Endereço de email</li>
            <li>Número de telefone</li>
            <li>Endereço residencial</li>
          </ul>
        </div>

        <div className="mt-3">
          <p className="font-semibold">2.2. Dados de Saúde (Pacientes):</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Histórico médico e prontuários</li>
            <li>Alergias e condições de saúde</li>
            <li>Informações de convênio médico</li>
            <li>Resultados de exames</li>
          </ul>
        </div>

        <div className="mt-3">
          <p className="font-semibold">2.3. Dados Profissionais (Médicos):</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Número do CRM e estado</li>
            <li>Especialidade médica</li>
            <li>Formação acadêmica</li>
            <li>Informações profissionais</li>
          </ul>
        </div>

        <div className="mt-3">
          <p className="font-semibold">2.4. Dados de Uso:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Informações de navegação e uso da plataforma</li>
            <li>Endereço IP e localização</li>
            <li>Dispositivo e navegador utilizados</li>
            <li>Logs de acesso</li>
          </ul>
        </div>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">3. Finalidade do Tratamento de Dados</h4>
        <p>Utilizamos seus dados pessoais para:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Criar e gerenciar sua conta na plataforma</li>
          <li>Facilitar agendamentos e consultas médicas</li>
          <li>Armazenar e gerenciar prontuários eletrônicos</li>
          <li>Processar pagamentos e transações</li>
          <li>Enviar notificações e lembretes importantes</li>
          <li>Melhorar nossos serviços e experiência do usuário</li>
          <li>Cumprir obrigações legais e regulatórias</li>
          <li>Prevenir fraudes e garantir a segurança</li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">4. Base Legal para o Tratamento</h4>
        <p>O tratamento de seus dados pessoais é fundamentado em:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><strong>Consentimento:</strong> Para coleta e uso de dados sensíveis de saúde</li>
          <li><strong>Execução de contrato:</strong> Para prestação de serviços da plataforma</li>
          <li><strong>Obrigação legal:</strong> Para cumprimento de normas médicas e sanitárias</li>
          <li><strong>Legítimo interesse:</strong> Para segurança e melhoria dos serviços</li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">5. Compartilhamento de Dados</h4>
        <p>Seus dados podem ser compartilhados com:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><strong>Profissionais de saúde:</strong> Para prestação de serviços médicos</li>
          <li><strong>Prestadores de serviço:</strong> Que auxiliam na operação da plataforma</li>
          <li><strong>Autoridades:</strong> Quando exigido por lei ou ordem judicial</li>
          <li><strong>Parceiros comerciais:</strong> Com seu consentimento explícito</li>
        </ul>
        <p className="mt-2">
          Nunca vendemos seus dados pessoais para terceiros.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">6. Segurança dos Dados</h4>
        <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Criptografia AES-256 para dados sensíveis (CPF, RG, telefone, CRM)</li>
          <li>Certificado SSL/TLS para comunicações</li>
          <li>Controles de acesso rigorosos</li>
          <li>Monitoramento contínuo de segurança</li>
          <li>Backup regular dos dados</li>
          <li>Testes de segurança periódicos</li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">7. Retenção de Dados</h4>
        <p>
          Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas 
          nesta política, salvo quando a lei exigir período maior (como prontuários médicos que 
          devem ser mantidos por 20 anos).
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">8. Seus Direitos (LGPD)</h4>
        <p>Você tem os seguintes direitos sobre seus dados pessoais:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
          <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou desatualizados</li>
          <li><strong>Anonimização ou exclusão:</strong> Solicitar remoção de dados desnecessários</li>
          <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
          <li><strong>Revogação do consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
          <li><strong>Informação sobre compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
          <li><strong>Oposição:</strong> Opor-se ao tratamento de dados</li>
        </ul>
        <p className="mt-2">
          Para exercer seus direitos, entre em contato através do email: privacidade@promed.com.br
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">9. Cookies e Tecnologias Similares</h4>
        <p>
          Utilizamos cookies e tecnologias similares para melhorar sua experiência, personalizar 
          conteúdo e analisar o uso da plataforma. Você pode gerenciar suas preferências de cookies 
          nas configurações do navegador.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">10. Transferência Internacional de Dados</h4>
        <p>
          Seus dados são armazenados em servidores localizados no Brasil. Caso seja necessária 
          transferência internacional, garantiremos proteção adequada conforme exigido pela LGPD.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">11. Alterações nesta Política</h4>
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas 
          serão notificadas por email ou através de aviso na plataforma.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">12. Encarregado de Dados (DPO)</h4>
        <p>
          Nosso Encarregado de Proteção de Dados pode ser contatado em:
        </p>
        <ul className="list-none pl-0 mt-2 space-y-1">
          <li>Email: dpo@promed.com.br</li>
          <li>Telefone: (11) 3000-0001</li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">13. Contato</h4>
        <p>
          Para dúvidas sobre esta política ou sobre tratamento de dados:
        </p>
        <ul className="list-none pl-0 mt-2 space-y-1">
          <li>Email: privacidade@promed.com.br</li>
          <li>Telefone: (11) 3000-0000</li>
          <li>Endereço: Av. Paulista, 1000 - São Paulo/SP - CEP 01310-100</li>
        </ul>
      </section>

      <div className="mt-8 pt-6 border-t">
        <p className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}