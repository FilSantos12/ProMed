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
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Modal } from './ui/modal';
import { ErrorModal } from './ui/error-modal';
import { TermsModal } from './ui/terms-modal';
import InputMask from 'react-input-mask';

interface CadastroPagesProps {
  type: 'patient' | 'professional';
  onSectionChange: (section: string) => void;
}

export function CadastroPages({ type, onSectionChange }: CadastroPagesProps) {
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

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('🟢 handleRegister FOI CHAMADA!');
  console.log('📦 Dados do formulário:', formData);
  console.log('👤 Tipo de cadastro:', type);
  
  setLoading(true);
  setError('');

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

  // Preparar dados para enviar à API
  const dataToSend = {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    password_confirmation: formData.confirmPassword, // Backend espera este nome
    cpf: formData.cpf, 
    rg: formData.rg, 
    phone: formData.phone,
    birth_date: formData.birthDate,
    gender: formData.gender || 'Outro',
    role: type === 'patient' ? 'patient' : 'doctor',
    
    // Campos específicos do médico (se for médico)
    ...(type === 'professional' && {
      crm: formData.crm,
      specialty_id: formData.specialty,
    }),
  };

  console.log('🔵 Dados que serão enviados para API:', dataToSend);

  try {
    const response = await api.post('/register', dataToSend);
    
    console.log('✅ Cadastro realizado com sucesso:', response.data);
    
      // Salvar nome do usuário e abrir modal
      setRegisteredUserName(formData.name);
      setShowSuccessModal(true);
    
 } catch (err: any) {
    console.error('❌ Erro no cadastro:', err);
    console.error('📛 Detalhes do erro:', err.response?.data);
    
    let errorMsg = 'Ocorreu um erro ao realizar o cadastro. Tente novamente.';
    
    // Tratar erros específicos do backend
    if (err.response?.data?.message) {
      errorMsg = err.response.data.message;
    }
    
    // Mostrar erros de validação do backend
    if (err.response?.data?.errors) {
      console.error('❌ Erros de validação:', err.response.data.errors);
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  useEffect(() => {
  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties');
      // Atualizar o estado das especialidades se você tiver um
      console.log('Especialidades:', response.data);
    } catch (error) {
      console.error('Erro ao carregar especialidades:', error);
    }
  };

  if (type === 'professional') {
    fetchSpecialties();
  }
}, [type]);

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
    
    // Redirecionar após 2 segundos
    setTimeout(() => {
      onSectionChange('patient-area');
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
    const response = await api.post('/admin/doctors', {
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

  const especialidades = [
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
  ];

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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                      <InputMask
                        mask="999.999.999-99"
                        value={formData.cpf}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('cpf', e.target.value)}
                      >
                        {(inputProps: any) => (
                          <Input 
                            {...inputProps}
                            id="cpf"
                            placeholder="000.000.000-00"
                            required
                          />
                        )}
                      </InputMask>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG *</Label>
                    <InputMask
                      mask="99.999.999-9"
                      value={formData.rg}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('rg', e.target.value)}
                    >
                      {(inputProps: any) => (
                        <Input 
                          {...inputProps}
                          id="rg"
                          placeholder="00.000.000-0"
                          required
                        />
                      )}
                    </InputMask>
                  </div>
     
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <InputMask
                      mask="(99) 99999-9999"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                    >
                      {(inputProps: any) => (
                        <Input 
                          {...inputProps}
                          id="phone"
                          placeholder="(11) 99999-9999"
                          required
                        />
                      )}
                    </InputMask>
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
                  />
                </div>
                <div className="space-y-2"> 
                  <Label htmlFor="confirmEmail">Confirmar Email *</Label>
                  <Input
                    id="confirmEmail"
                    type="email"
                    value={formData.confirmEmail}
                    onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                    placeholder="Confirme seu@email.com"
                    required
                     className={
                        formData.confirmEmail && formData.email !== formData.confirmEmail
                          ? 'border-red-500 focus:ring-red-500'
                          : formData.confirmEmail && formData.email === formData.confirmEmail
                          ? 'border-green-500 focus:ring-green-500'
                          : ''
                      }
                    />
                    {formData.confirmEmail && formData.email !== formData.confirmEmail && (
                      <p className="text-sm text-red-600">Os emails estão diferentes</p>
                    )}
                    {formData.confirmEmail && formData.email === formData.confirmEmail && (
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
                    <InputMask
                      mask="99999-999"
                      value={formData.cep}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('cep', e.target.value)}
                    >
                      {(inputProps: any) => (
                        <Input 
                          {...inputProps}
                          id="cep"
                          placeholder="00000-000"
                          required
                        />
                      )}
                    </InputMask>
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
                        <Input
                          id="crm"
                          value={formData.crm}
                          onChange={(e) => handleInputChange('crm', e.target.value)}
                          placeholder="CRM 12345-SP"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidade *</Label>
                        <Select value={formData.specialty} onValueChange={(value: string) => handleInputChange('specialty', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a especialidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {especialidades.map((esp) => (
                              <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                    {/* Upload de Diplomas */}
                    <div className="space-y-2">
                      <Label htmlFor="diplomas">Diplomas *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <Label 
                          htmlFor="diplomas" 
                          className="cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Clique para fazer upload dos diplomas
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, JPG ou PNG (máx. 10MB cada)
                          </span>
                        </Label>
                        <Input
                          id="diplomas"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          onChange={handleDiplomasChange}
                          className="hidden"
                        />
                      </div>
                      {diplomas.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {diplomas.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDiploma(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                                <Button 
                                  type="submit"
                                  disabled={loading}
                                >
                                  {loading ? 'Cadastrando...' : 'Criar Conta'}
                                </Button>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Upload de Certificados */}
                    <div className="space-y-2">
                      <Label htmlFor="certificates">Certificados e Especializações</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <Label 
                          htmlFor="certificates" 
                          className="cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Clique para fazer upload dos certificados
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, JPG ou PNG (máx. 10MB cada)
                          </span>
                        </Label>
                        <Input
                          id="certificates"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          onChange={handleCertificatesChange}
                          className="hidden"
                        />
                      </div>
                      {certificates.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {certificates.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-green-600" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCertificate(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                                <Button 
                                  type="submit"
                                  disabled={loading}
                                >
                                  {loading ? 'Cadastrando...' : 'Criar Conta'}
                                </Button>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
                <Button 
                  type="button"  // ← Mudei para "button" temporariamente
                  className="flex-1"
                  disabled={!formData.acceptTerms || !formData.acceptPrivacy}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      console.log('🔴 BOTÃO CLICADO DIRETAMENTE!');
                      console.log('📦 FormData:', formData);
                      handleRegister(e as any);
                    }}
                >
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
  

  
