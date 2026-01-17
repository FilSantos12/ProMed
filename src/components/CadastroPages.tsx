import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { User, Stethoscope, FileText, Shield, Mail, Upload, Image, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePendingAppointment } from '../contexts/PendingAppointmentContext';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Modal } from './ui/modal';
import { ErrorModal } from './ui/error-modal';
import { TermsModal } from './ui/terms-modal';
import { MaskedInput } from './ui/masked-input';
import { LoadingSpinner } from './ui/loading-spinner';
import { ProgressBar } from './ui/progress-bar';
import { specialtyService, Specialty } from '../services/specialtyService';

interface CadastroPagesProps {
  type: 'patient' | 'professional';
  onSectionChange: (section: string) => void;
  prefilledData?: {
    name?: string;
    email?: string;
    cpf?: string;
    rg?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
  };
}

export function CadastroPages({ type, onSectionChange, prefilledData }: CadastroPagesProps) {
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: '',
    cpf: '',
    rg: '',
    birthDate: '',
    phone: '',
    email: '',
    confirmEmail: '',
    gender: '',
    password: '',
    confirmPassword: '',
    
    // Endereço
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    
    // Profissional específico
    crm: '',
    crmState: '',
    specialty: '',
    university: '',
    graduationYear: '',
    bio: '',
    consultationPrice: '',
    consultationDuration: '30',
    yearsExperience: '',
    
    // Termos
    acceptTerms: false,
    acceptPrivacy: false
  });

    // Modais de sucesso e erro
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUserName, setRegisteredUserName] = useState('');

  const [diplomas, setDiplomas] = useState<File[]>([]);
  const [certificates, setCertificates] = useState<File[]>([]);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estado para controlar se o campo de confirmação de email foi "tocado"
  const [confirmEmailTouched, setConfirmEmailTouched] = useState(false);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrorMessage('');

  // Validação de senha
  if (formData.password !== formData.confirmPassword) {
    setErrorMessage('As senhas não coincidem. Verifique e tente novamente.');
    setShowErrorModal(true);
    setLoading(false);
    return;
  }

  // Validação de email
  if (formData.email !== formData.confirmEmail) {
    setErrorMessage('Os emails não coincidem. Verifique e tente novamente.');
    setShowErrorModal(true);
    setLoading(false);
    return;
  }

  // Validação dos termos
  if (!formData.acceptTerms || !formData.acceptPrivacy) {
    setErrorMessage('Você precisa aceitar os termos e a política de privacidade');
    setShowErrorModal(true);
    setLoading(false);
    return;
  }

  // Se for médico, validar documentos obrigatórios
  if (type === 'professional') {
    if (!documents.diploma) {
      setErrorMessage('O diploma de medicina é obrigatório.');
      setShowErrorModal(true);
      setLoading(false);
      return;
    }
    if (!documents.crm_document) {
      setErrorMessage('O comprovante de CRM é obrigatório.');
      setShowErrorModal(true);
      setLoading(false);
      return;
    }
    if (!documents.rg_document) {
      setErrorMessage('O documento de identidade (RG/CPF) é obrigatório.');
      setShowErrorModal(true);
      setLoading(false);
      return;
    }
    // Foto só é obrigatória para cadastro inicial (não para paciente virando médico)
    if (!prefilledData && !documents.photo) {
      setErrorMessage('A foto 3x4 é obrigatória.');
      setShowErrorModal(true);
      setLoading(false);
      return;
    }
  }

  // ========================================
// PREPARAR DADOS COM FORMDATA (para enviar arquivos)
// ========================================
let formDataToSend = new FormData();

// Dados básicos (para todos os tipos de usuário)
formDataToSend.append('name', formData.name);
formDataToSend.append('email', formData.email);
formDataToSend.append('password', formData.password);
formDataToSend.append('password_confirmation', formData.confirmPassword);
formDataToSend.append('cpf', formData.cpf);
formDataToSend.append('rg', formData.rg || '');
formDataToSend.append('phone', formData.phone);
formDataToSend.append('birth_date', formData.birthDate);
formDataToSend.append('gender', formData.gender || 'Outro');
formDataToSend.append('role', type === 'patient' ? 'patient' : 'doctor');

// Campos específicos do médico
if (type === 'professional') {
  formDataToSend.append('crm', formData.crm);
  formDataToSend.append('crm_state', formData.crmState);
  formDataToSend.append('specialty_id', formData.specialty);
  formDataToSend.append('bio', formData.bio || '');
  formDataToSend.append('consultation_price', formData.consultationPrice || '0');
  formDataToSend.append('consultation_duration', formData.consultationDuration || '30');
  formDataToSend.append('university', formData.university || '');
  formDataToSend.append('graduation_year', formData.graduationYear || '');
  formDataToSend.append('years_experience', formData.yearsExperience || '0');

  // ========================================
  // ADICIONAR ARQUIVOS
  // ========================================
  if (documents.diploma) {
    formDataToSend.append('diploma', documents.diploma);
  }
  if (documents.crm_document) {
    formDataToSend.append('crm_document', documents.crm_document);
  }
  if (documents.rg_document) {
    formDataToSend.append('rg_document', documents.rg_document);
  }
  if (documents.photo) {
    formDataToSend.append('photo', documents.photo);
  }
}

  try {
        // Escolher endpoint baseado no tipo de cadastro
        let endpoint = '/register';

        // Se for profissional e usuário já está logado (tem prefilledData), usar endpoint de aplicação
        if (type === 'professional' && prefilledData) {
          endpoint = '/patient/apply-as-doctor';

          // Ajustar nomes dos documentos para o endpoint apply-as-doctor
          const applyFormData = new FormData();
          applyFormData.append('crm', formData.crm);
          applyFormData.append('crm_state', formData.crmState);
          applyFormData.append('specialty_id', formData.specialty);
          applyFormData.append('bio', formData.bio || '');
          applyFormData.append('consultation_price', formData.consultationPrice || '0');
          applyFormData.append('consultation_duration', formData.consultationDuration || '30');
          applyFormData.append('years_experience', formData.yearsExperience || '0');

          // Documentos com nomes corretos para o endpoint apply-as-doctor
          if (documents.diploma) {
            applyFormData.append('diploma_document', documents.diploma);
          }
          if (documents.crm_document) {
            applyFormData.append('crm_document', documents.crm_document);
          }
          if (documents.rg_document) {
            applyFormData.append('identity_document', documents.rg_document);
          }
          // Nota: photo não é enviado para apply-as-doctor pois o usuário já tem avatar

          formDataToSend = applyFormData;
        }

        const response = await api.post(endpoint, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        });

      // Salvar nome do usuário e abrir modal
      setRegisteredUserName(formData.name);
      setShowSuccessModal(true);

 } catch (err: any) {
    console.error('Erro completo:', err);
    console.error('Resposta do servidor:', err.response?.data);
    console.error('Status:', err.response?.status);

    let errorMsg = 'Ocorreu um erro ao realizar o cadastro. Tente novamente.';

    // Tratar erros específicos do backend
    if (err.response?.data?.message) {
      errorMsg = err.response.data.message;
    }

    // Mostrar erros de validação do backend
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
    // Mapeamento manual (BACKUP)
    const errorTranslations: { [key: string]: string } = {
      'The cpf has already been taken.': 'Este CPF já está cadastrado no sistema.',
      'The email has already been taken.': 'Este email já está cadastrado no sistema.',
      'The rg has already been taken.': 'Este RG já está cadastrado no sistema.',
      'The phone has already been taken.': 'Este telefone já está cadastrado no sistema.',
      'The crm has already been taken.': 'Este CRM já está cadastrado no sistema.',
      'The password confirmation does not match.': 'A confirmação de senha não confere.',
      'The cpf field is required.': 'O campo CPF é obrigatório.',
      'The email field is required.': 'O campo email é obrigatório.',
      'The password field is required.': 'O campo senha é obrigatório.',
      'The crm state field is required when role is professional.': 'O campo estado do CRM é obrigatório para profissionais.',
      'The crm document field is required when role is professional.': 'O comprovante de CRM é obrigatório.',
      'The photo field is required when role is professional.': 'A foto 3x4 é obrigatória.',
      };
    
    const firstErrorKey = Object.keys(errors)[0];
    const firstErrorArray = errors[firstErrorKey];
    const firstErrorMessage = Array.isArray(firstErrorArray) ? firstErrorArray[0] : firstErrorArray;
    
    // Tentar traduzir, se não encontrar usa a mensagem original
    errorMsg = errorTranslations[firstErrorMessage] || firstErrorMessage;
  }
    
    setErrorMessage(errorMsg);
    setShowErrorModal(true);
    
  } finally {
    setLoading(false);
  }
};

  const handleDiplomasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDiplomas(prev => [...prev, ...files]);
  };

  const handleCertificatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCertificates(prev => [...prev, ...files]);
  };

  const removeDiploma = (index: number) => {
    setDiplomas(prev => prev.filter((_, i) => i !== index));
  };

  const removeCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
  };

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const { hasPendingAppointment, completePendingAppointment, pendingAppointment } = usePendingAppointment();

  // Pré-preencher dados do agendamento pendente se houver
  useEffect(() => {
    if (type === 'patient' && pendingAppointment) {
      setFormData(prev => ({
        ...prev,
        name: pendingAppointment.patient_name || prev.name,
        cpf: pendingAppointment.patient_cpf || prev.cpf,
        phone: pendingAppointment.patient_phone || prev.phone,
        email: pendingAppointment.patient_email || prev.email,
      }));
    }
  }, [pendingAppointment, type]);

  // Preencher dados básicos quando prefilledData for fornecido
  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        name: prefilledData.name || prev.name,
        email: prefilledData.email || prev.email,
        confirmEmail: prefilledData.email || prev.confirmEmail,
        cpf: prefilledData.cpf || prev.cpf,
        rg: prefilledData.rg || prev.rg,
        phone: prefilledData.phone || prev.phone,
        birthDate: prefilledData.birthDate || prev.birthDate,
        gender: prefilledData.gender || prev.gender,
      }));
    }
  }, [prefilledData]);

  // Verificar se campo foi pré-preenchido e deve ser desabilitado
  const isFieldPrefilled = (field: keyof typeof prefilledData) => {
    return prefilledData && prefilledData[field] !== undefined && prefilledData[field] !== '';
  };

  useEffect(() => {
  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties');
      // Atualizar o estado das especialidades se você tiver um
    } catch (error) {
    }
  };

  if (type === 'professional') {
    fetchSpecialties();
  }
}, [type]);

      // Estado para documentos enviados
        const handleFileChange = (field: string, file: File | null) => {
          setDocuments(prev => ({ ...prev, [field]: file }));
        };
      
      const [documents, setDocuments] = useState<{
        diploma: File | null;
        crm_document: File | null;
        rg_document: File | null;
        photo: File | null;
      }>({
        diploma: null,
        crm_document: null,
        rg_document: null,
        photo: null,
      });


      // Buscar especialidades ao montar o componente
      useEffect(() => {
        const fetchSpecialties = async () => {
          setLoadingSpecialties(true);
          try {
            const data = await specialtyService.getAll();
            setSpecialties(data);
          } catch (error) {
          } finally {
            setLoadingSpecialties(false);
          }
        };

        fetchSpecialties();
      }, []);

  // Função para submissão do formulário de cadastro Paciente
const handleSubmitForm = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess(false);

  // Validar senha
  if (formData.password !== formData.confirmPassword) {
    setError('As senhas não coincidem');
    setLoading(false);
    return;
  }

  if (formData.password.length < 8) {
    setError('A senha deve ter no mínimo 8 caracteres');
    setLoading(false);
    return;
  }

  try {
    await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      cpf: formData.cpf,
      phone: formData.phone,
      birth_date: formData.birthDate,
      gender: formData.gender as 'M' | 'F' | 'Outro' | undefined,
    });

    setSuccess(true);

    // Se há agendamento pendente, completá-lo
    if (hasPendingAppointment) {
      setTimeout(async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const success = await completePendingAppointment(user.id);

        if (success) {
          // Redirecionar para área do paciente para ver o agendamento
          onSectionChange('patient-area');
        } else {
          // Se falhou, redirecionar para página de agendamentos para tentar novamente
          onSectionChange('agendamentos');
        }
      }, 2000);
    } else {
      // Redirecionar após 2 segundos normalmente
      setTimeout(() => {
        onSectionChange('patient-area');
      }, 2000);
    }

  } catch (err: any) {
    const errorMessage = err.response?.data?.message 
      || err.response?.data?.errors 
      || err.message 
      || 'Erro ao realizar cadastro. Tente novamente.';
    
    setError(typeof errorMessage === 'object' 
      ? JSON.stringify(errorMessage) 
      : errorMessage
    );
  } finally {
    setLoading(false);
  }
};

// Função para submissão do formulário de cadastro Profissional
    const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess(false);

  // Validar senha
  if (formData.password !== formData.confirmPassword) {
    setError('As senhas não coincidem');
    setLoading(false);
    return;
  }

  if (formData.password.length < 8) {
    setError('A senha deve ter no mínimo 8 caracteres');
    setLoading(false);
    return;
  }

  try {
    const response = await api.post('/admin/professionals', {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      cpf: formData.cpf,
      phone: formData.phone,
      birth_date: formData.birthDate,
      gender: formData.gender as 'M' | 'F' | 'Outro' | undefined,
      specialty_id: parseInt(formData.specialty),
      crm: formData.crm,
      crm_state: formData.crmState,
      bio: formData.bio,
      consultation_price: formData.consultationPrice ? parseFloat(formData.consultationPrice) : undefined,
      consultation_duration: formData.consultationDuration ? parseInt(formData.consultationDuration) : 30,
      years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : undefined,
    });

    setSuccess(true);
    
    // Redirecionar após 2 segundos
    setTimeout(() => {
      onSectionChange('login');
    }, 2000);

  } catch (err: any) {
    const errorMessage = err.response?.data?.message 
      || err.response?.data?.errors 
      || err.message 
      || 'Erro ao realizar cadastro. Tente novamente.';
    
    setError(typeof errorMessage === 'object' 
      ? JSON.stringify(errorMessage) 
      : errorMessage
    );
  } finally {
    setLoading(false);
  }
};

  {/*const especialidades = [
    'Cardiologia',
    'Neurologia',
    'Oftalmologia',
    'Ortopedia',
    'Pediatria',
    'Clínica Geral',
    'Endocrinologia',
    'Pneumologia',
    'Ginecologia',
    'Urologia',
    'Dermatologia',
    'Psiquiatria'
  ];*/}

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {type === 'patient' ? (
              <User className="w-12 h-12 text-blue-600" />
            ) : (
              <Stethoscope className="w-12 h-12 text-blue-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {type === 'patient' ? 'Cadastro de Paciente' : 'Cadastro de Profissional'}
          </h1>
          <p className="text-gray-600">
            {type === 'patient' 
              ? 'Crie sua conta para agendar consultas e acompanhar seu histórico médico'
              : 'Junte-se à nossa equipe de profissionais qualificados'
            }
          </p>
        </div>
        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Formulário de Cadastro</span>
            </CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios (*) para concluir seu cadastro
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  Cadastro realizado com sucesso! Redirecionando...
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Dados Pessoais</span>
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Digite seu nome completo"
                      required
                      disabled={isFieldPrefilled('name')}
                      className={isFieldPrefilled('name') ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <MaskedInput
                      mask="000.000.000-00"
                      value={formData.cpf}
                      onChange={(value) => handleInputChange('cpf', value)}
                      id="cpf"
                      placeholder="000.000.000-00"
                      required
                      disabled={isFieldPrefilled('cpf')}
                      className={isFieldPrefilled('cpf') ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG *</Label>
                    <MaskedInput
                      mask="00.000.000-0"
                      value={formData.rg}
                      onChange={(value) => handleInputChange('rg', value)}
                      id="rg"
                      placeholder="00.000.000-0"
                      required
                      disabled={isFieldPrefilled('rg')}
                      className={isFieldPrefilled('rg') ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      required
                      disabled={isFieldPrefilled('birthDate')}
                      className={isFieldPrefilled('birthDate') ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <MaskedInput
                      mask="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      id="phone"
                      placeholder="(11) 99999-9999"
                      required
                      disabled={isFieldPrefilled('phone')}
                      className={isFieldPrefilled('phone') ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: string) => handleInputChange('gender', value)}
                      disabled={isFieldPrefilled('gender')}
                    >
                      <SelectTrigger className={isFieldPrefilled('gender') ? 'bg-gray-100 cursor-not-allowed' : ''}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                    disabled={isFieldPrefilled('email')}
                    className={isFieldPrefilled('email') ? 'bg-gray-100 cursor-not-allowed' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmEmail">Confirmar Email *</Label>
                  <Input
                    id="confirmEmail"
                    type="email"
                    value={formData.confirmEmail}
                    onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                    onBlur={() => setConfirmEmailTouched(true)}
                    placeholder="Confirme seu@email.com"
                    required
                    disabled={isFieldPrefilled('email')}
                    className={
                      isFieldPrefilled('email')
                        ? 'bg-gray-100 cursor-not-allowed'
                        : confirmEmailTouched && formData.confirmEmail && formData.email !== formData.confirmEmail
                          ? 'border-red-500 focus:ring-red-500'
                          : confirmEmailTouched && formData.confirmEmail && formData.email === formData.confirmEmail
                          ? 'border-green-500 focus:ring-green-500'
                          : ''
                    }
                  />
                    {!isFieldPrefilled('email') && confirmEmailTouched && formData.confirmEmail && formData.email !== formData.confirmEmail && (
                      <p className="text-sm text-red-600">Os emails estão diferentes</p>
                    )}
                    {!isFieldPrefilled('email') && confirmEmailTouched && formData.confirmEmail && formData.email === formData.confirmEmail && (
                      <p className="text-sm text-green-600">✓ Correto, os emails são iguais</p>
                    )}
                </div>
              </div>    

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                  <p className="text-sm text-gray-500"></p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                    disabled={loading}
                    minLength={8}
                      className={
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-500 focus:ring-red-500'
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-500 focus:ring-green-500'
                          : ''
                      }
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-600">As senhas não são iguais</p>
                    )}
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-sm text-green-600">✓ Correto, as senhas são iguais</p>
                    )}
                </div>
              </div>

              <Separator />

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>Endereço</span>
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <MaskedInput
                      mask="00000-000"
                      value={formData.cep}
                      onChange={(value) => handleInputChange('cep', value)}
                      id="cep"
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Rua, Avenida, etc."
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => handleInputChange('number', e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={formData.complement}
                      onChange={(e) => handleInputChange('complement', e.target.value)}
                      placeholder="Apto, Bloco, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      placeholder="Nome do bairro"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Select value={formData.state} onValueChange={(value: string) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Nome da cidade"
                    required
                  />
                </div>
              </div>

              {/* Dados Profissionais (apenas para médicos) */}
              {type === 'professional' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <span>Dados Profissionais</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="crm">CRM *</Label>
                        <MaskedInput
                          mask="000000"
                          value={formData.crm}
                          onChange={(value) => handleInputChange('crm', value.toUpperCase())}
                          id="crm"
                          placeholder="123456"
                          required
                        />
                      </div>

                       {/* Estado do CRM */}
                        <div className="space-y-2">
                          <Label htmlFor="crmState">Estado do CRM *</Label>
                          <select
                            id="crmState"
                            aria-label="Estado do CRM"
                            value={formData.crmState}
                            onChange={(e) => handleInputChange('crmState', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Selecione</option>
                            <option value="AC">AC - Acre</option>
                            <option value="AL">AL - Alagoas</option>
                            <option value="AP">AP - Amapá</option>
                            <option value="AM">AM - Amazonas</option>
                            <option value="BA">BA - Bahia</option>
                            <option value="CE">CE - Ceará</option>
                            <option value="DF">DF - Distrito Federal</option>
                            <option value="ES">ES - Espírito Santo</option>
                            <option value="GO">GO - Goiás</option>
                            <option value="MA">MA - Maranhão</option>
                            <option value="MT">MT - Mato Grosso</option>
                            <option value="MS">MS - Mato Grosso do Sul</option>
                            <option value="MG">MG - Minas Gerais</option>
                            <option value="PA">PA - Pará</option>
                            <option value="PB">PB - Paraíba</option>
                            <option value="PR">PR - Paraná</option>
                            <option value="PE">PE - Pernambuco</option>
                            <option value="PI">PI - Piauí</option>
                            <option value="RJ">RJ - Rio de Janeiro</option>
                            <option value="RN">RN - Rio Grande do Norte</option>
                            <option value="RS">RS - Rio Grande do Sul</option>
                            <option value="RO">RO - Rondônia</option>
                            <option value="RR">RR - Roraima</option>
                            <option value="SC">SC - Santa Catarina</option>
                            <option value="SP">SP - São Paulo</option>
                            <option value="SE">SE - Sergipe</option>
                            <option value="TO">TO - Tocantins</option>
                          </select>
                        </div>

                      

                      <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidade *</Label>
                        <Select value={formData.specialty} onValueChange={(value: string) => handleInputChange('specialty', value)} disabled={loadingSpecialties}>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingSpecialties 
                            ? "Carregando especialidades..." 
                            : "Selecione a especialidade"} />
                          </SelectTrigger>
                          <SelectContent>
                            {specialties.map((spec) => (
                              <SelectItem key={spec.id} value={String(spec.id)}>
                                {spec.icon} {spec.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                            {specialties.length === 0 && !loadingSpecialties && (
                              <p className="text-sm text-red-600">
                                Erro ao carregar especialidades. Recarregue a página.
                              </p>
                            )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="university">Universidade de Formação *</Label>
                        <Input
                          id="university"
                          value={formData.university}
                          onChange={(e) => handleInputChange('university', e.target.value)}
                          placeholder="Nome da universidade"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">Ano de Formação *</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          value={formData.graduationYear}
                          onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                          placeholder="2020"
                          min="1950"
                          max={new Date().getFullYear()}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia Profissional</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Descreva sua experiência, especialização e formação complementar..."
                        rows={4}
                      />
                    </div>

                    {/* Diploma de Medicina */}
                      <div className="space-y-2">
                        <Label htmlFor="diploma" className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>Diploma de Medicina *</span>
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                          <input
                            id="diploma"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('diploma', e.target.files?.[0] || null)}
                            className="hidden"
                            required
                          />
                          <label htmlFor="diploma" className="cursor-pointer block text-center">
                            {documents.diploma ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-center">
                                  <FileText className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">{documents.diploma.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(documents.diploma.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFileChange('diploma', null);
                                  }}
                                >
                                  Remover
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <FileText className="w-12 h-12 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold text-blue-600">Clique para enviar</span>
                                </p>
                                <p className="text-xs text-gray-500">PDF, JPG ou PNG (máx. 5MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Comprovante de CRM */}
                      <div className="space-y-2">
                        <Label htmlFor="crm_document" className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>Comprovante de CRM *</span>
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                          <input
                            id="crm_document"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('crm_document', e.target.files?.[0] || null)}
                            className="hidden"
                            required
                          />
                          <label htmlFor="crm_document" className="cursor-pointer block text-center">
                            {documents.crm_document ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-center">
                                  <FileText className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">{documents.crm_document.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(documents.crm_document.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFileChange('crm_document', null);
                                  }}
                                >
                                  Remover
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <FileText className="w-12 h-12 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold text-blue-600">Clique para enviar</span>
                                </p>
                                <p className="text-xs text-gray-500">PDF, JPG ou PNG (máx. 5MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                      {/* RG/CPF (opcional) */}
                      <div className="space-y-2">
                        <Label htmlFor="rg_document" className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>RG ou CPF (opcional)</span>
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                          <input
                            id="rg_document"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('rg_document', e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          <label htmlFor="rg_document" className="cursor-pointer block text-center">
                            {documents.rg_document ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-center">
                                  <FileText className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">{documents.rg_document.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(documents.rg_document.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFileChange('rg_document', null);
                                  }}
                                >
                                  Remover
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <FileText className="w-12 h-12 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold text-blue-600">Clique para enviar</span>
                                </p>
                                <p className="text-xs text-gray-500">PDF, JPG ou PNG (máx. 5MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Foto 3x4 - apenas para cadastro inicial, não para paciente virando médico */}
                      {!prefilledData && (
                      <div className="space-y-2">
                        <Label htmlFor="photo" className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Foto 3x4 *</span>
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                          <input
                            id="photo"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
                            className="hidden"
                            required={!prefilledData}
                          />
                          <label htmlFor="photo" className="cursor-pointer block text-center">
                            {documents.photo ? (
                              <div className="space-y-2">
                                {documents.photo.type.startsWith('image/') && (
                                  <img 
                                    src={URL.createObjectURL(documents.photo)} 
                                    alt="Preview" 
                                    className="mx-auto h-24 w-24 object-cover rounded-lg"
                                  />
                                )}
                                <p className="text-sm font-medium text-gray-900">{documents.photo.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(documents.photo.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFileChange('photo', null);
                                  }}
                                >
                                  Remover
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <User className="w-12 h-12 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold text-blue-600">Clique para enviar</span>
                                </p>
                                <p className="text-xs text-gray-500">JPG ou PNG (máx. 5MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                      )}
                  </div>
                </>
              )}  
               
              <Separator />

                {/* Termos e Condições */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span>Termos e Condições</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked: boolean | 'indeterminate') => handleInputChange('acceptTerms', checked === true)}
                        required
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed">
                        Aceito os{' '}
                        <button 
                          type="button" 
                          onClick={() => setShowTermsModal(true)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Termos de Uso
                        </button>{' '}
                        e confirmo que li e compreendi todas as condições.
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="privacy"
                        checked={formData.acceptPrivacy}
                        onCheckedChange={(checked: boolean | 'indeterminate') => handleInputChange('acceptPrivacy', checked === true)}
                        required
                      />
                      <Label htmlFor="privacy" className="text-sm leading-relaxed">
                        Aceito a{' '}
                        <button 
                          type="button" 
                          onClick={() => setShowPrivacyModal(true)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Política de Privacidade
                        </button>{' '}
                        e autorizo o tratamento dos meus dados pessoais conforme descrito.
                      </Label>
                    </div>
                  </div>
                </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  {loading && type === 'professional' && (
                    <div className="mt-4">
                      <ProgressBar 
                        progress={uploadProgress} 
                        label="Enviando documentos" 
                      />
                    </div>
                  )}
                <Button 
                  type="button"  // ← Mudei para "button" temporariamente
                  className="flex-1"
                  disabled={!formData.acceptTerms || !formData.acceptPrivacy || loading}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      handleRegister(e as any);
                    }}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span>Cadastrando...</span>
                        </div>
                      ) : (
                        'Criar minha conta'
                      )}
                  {type === 'patient' ? 'Criar Conta de Paciente' : 'Solicitar Cadastro Profissional'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        {type === 'professional' && (
          <Card className="mt-6">
            <CardContent className="pt-6">
               <form onSubmit={handleRegister} className="space-y-6">
                <Shield className="w-12 h-12 text-blue-600 mx-auto" />
                <h4 className="font-medium text-gray-900">Processo de Verificação</h4>
                <p className="text-sm text-gray-600">
                  Seu cadastro passará por um processo de verificação que inclui validação de documentos 
                  e credenciais profissionais. Este processo leva até 48 horas úteis.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Documentos necessários:</strong> CRM ativo, diploma de graduação, 
                    certificados de especialização (se aplicável).
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

    {/* Modal de Erro */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />

    {/* Modal de Sucesso */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onSectionChange('login');
        }}
        title={type === 'patient' ? '🎉 Bem-vindo à ProMed!' : '🩺 Cadastro Profissional Enviado!'}
      >
        <div className="space-y-4">
          {type === 'patient' ? (
            <>
              <p className="text-lg">
                Olá, <strong>{registeredUserName}</strong>!
              </p>
              <p>Seu cadastro foi realizado com sucesso!</p>
              <p className="text-sm text-gray-500">
                Agora você pode fazer login e agendar suas consultas.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg">
                Olá, <strong>Dr(a). {registeredUserName}</strong>!
              </p>
              <p>Sua solicitação de cadastro foi enviada com sucesso!</p>
              <p className="text-sm text-gray-500">
                Nossa equipe irá analisar seus dados e você receberá um email quando seu cadastro for aprovado.
              </p>
            </>
          )}
          
          <div className="pt-4">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                onSectionChange('login');
              }}
              className="w-full"
            >
              {type === 'patient' ? 'Fazer Login' : 'Entendi'}
            </Button>
          </div>
        </div>
      </Modal>


      {/* Modal de Termos de Uso */}
        <TermsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          type="terms"
        />

        {/* Modal de Política de Privacidade */}
        <TermsModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
          type="privacy"
        />

    </div>
  );
}
  

  
