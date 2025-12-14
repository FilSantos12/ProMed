import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { User, Stethoscope, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './ui/loading-spinner';
import { ErrorModal } from './ui/error-modal';
import { SuccessModal } from './ui/success-modal';
import { ValidatedInput } from './ValidatedInput';
import { useFormValidation } from '../hooks/useFormValidation';
import { validateEmail, validatePassword } from '../utils/validators';
import { useToast } from '../contexts/ToastContext';

interface LoginPageProps {
  onSectionChange: (section: string) => void;
}

export function LoginPage({ onSectionChange }: LoginPageProps) {
  const { login } = useAuth();
  const toast = useToast();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Hook de validação
  const {
    errors,
    validateField,
    handleBlur,
    validateAll,
    clearErrors,
    shouldShowError,
    isFieldValid,
  } = useFormValidation({
    email: { validate: validateEmail },
    password: { validate: validatePassword },
  });

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setErrorMessage('');
    
    // Valida em tempo real
    validateField(field, value);
  };

  const handleLogin = async (e: React.FormEvent, expectedRole: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Validar todos os campos antes de submeter
    const isValid = validateAll(loginData);

    if (!isValid) {
      toast.warning('Preencha todos os campos corretamente');
      return false;
    }

    setLoading(true);
    setErrorMessage('');
    setShowSuccessModal(false);

    try {
      await login(loginData.email, loginData.password, expectedRole);

      setShowErrorModal(false);

      const user = JSON.parse(localStorage.getItem('@ProMed:user') || '{}');

      setSuccessMessage(`Bem-vindo, ${user.name}!`);
      setShowSuccessModal(true);
      
      // Toast de sucesso
      toast.success(`Login realizado com sucesso! Bem-vindo, ${user.name}!`);

      setTimeout(() => {
        setShowSuccessModal(false);

        if (user.role === 'admin') {
          onSectionChange('admin-area');
        } else if (user.role === 'doctor') {
          onSectionChange('doctor-area');
        } else {
          onSectionChange('patient-area');
        }
      }, 2000);

    } catch (err: any) {
      e.preventDefault();
      e.stopPropagation();

      setShowSuccessModal(false);

      const errorMsg = err.response?.data?.message || 'Email ou senha incorretos.';

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      
      // Toast de erro
      toast.error(errorMsg);

      return false;

    } finally {
      setLoading(false);
    }
    return false;
  };

  // Verifica se o formulário é válido para habilitar o botão
  const isFormValid = () => {
    return (
      loginData.email &&
      loginData.password &&
      !errors.email &&
      !errors.password
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Acesse sua conta na ProMed</p>
        </div>
        <Tabs defaultValue="patient" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patient" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Paciente</span>
            </TabsTrigger>
            <TabsTrigger value="doctor" className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4" />
              <span>Médico</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </TabsTrigger>
          </TabsList>

          {/* Paciente Tab */}
          <TabsContent value="patient">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Área do Paciente</span>
                </CardTitle>
                <CardDescription>
                  Acesse seus agendamentos, histórico médico e muito mais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(e, 'patient') }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email</Label>
                    <ValidatedInput
                      id="patient-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="seu@email.com"
                      disabled={loading}
                      error={errors.email}
                      showError={shouldShowError('email')}
                      isValid={isFieldValid('email')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Senha</Label>
                    <ValidatedInput
                      id="patient-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="Sua senha"
                      disabled={loading}
                      error={errors.password}
                      showError={shouldShowError('password')}
                      isValid={isFieldValid('password')}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !isFormValid()}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {loading ? <LoadingSpinner size="sm" /> : 'Entrar como Paciente'}
                  </Button>
                </form>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="text-center space-y-2">
                    <Button
                      variant="link"
                      className="text-sm"
                      onClick={() => onSectionChange('cadastro-paciente')}
                      disabled={loading}
                    >
                      Não tem conta? Cadastre-se
                    </Button>

                    <Button variant="link" className="text-sm">
                      Esqueceu sua senha?
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Médico Tab */}
          <TabsContent value="doctor">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <span>Área do Médico</span>
                </CardTitle>
                <CardDescription>
                  Gerencie seus agendamentos, prontuários e pacientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(e, 'doctor') }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email</Label>
                    <ValidatedInput
                      id="doctor-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="medico@email.com"
                      disabled={loading}
                      error={errors.email}
                      showError={shouldShowError('email')}
                      isValid={isFieldValid('email')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-password">Senha</Label>
                    <ValidatedInput
                      id="doctor-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="Sua senha"
                      disabled={loading}
                      error={errors.password}
                      showError={shouldShowError('password')}
                      isValid={isFieldValid('password')}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading || !isFormValid()}
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    {loading ? <LoadingSpinner size="sm" /> : 'Entrar como Médico'}
                  </Button>
                </form>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="text-center space-y-2">
                    <Button
                      variant="link"
                      className="text-sm"
                      onClick={() => onSectionChange('cadastro-profissional')}
                    >
                      Não tem conta? Cadastre-se
                    </Button>
                    <br />
                    <Button variant="link" className="text-sm">
                      Esqueceu sua senha?
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Área Administrativa</span>
                </CardTitle>
                <CardDescription>
                  Acesso ao painel administrativo do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(e, 'admin') }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <ValidatedInput
                      id="admin-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="admin@promed.com"
                      disabled={loading}
                      error={errors.email}
                      showError={shouldShowError('email')}
                      isValid={isFieldValid('email')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Senha</Label>
                    <ValidatedInput
                      id="admin-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="Sua senha"
                      disabled={loading}
                      error={errors.password}
                      showError={shouldShowError('password')}
                      isValid={isFieldValid('password')}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading || !isFormValid()}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {loading ? <LoadingSpinner size="sm" /> : 'Entrar como Admin'}
                  </Button>
                </form>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="text-center">
                    <Button variant="link" className="text-sm">
                      Esqueceu sua senha?
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Credenciais de Teste */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">🔐 Credenciais de Teste:</p>
              <p><strong>Admin:</strong> admin@promed.com / password</p>
            </div>
          </CardContent>
        </Card>

        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={errorMessage}
        />

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            const user = JSON.parse(localStorage.getItem('@ProMed:user') || '{}');
            if (user.role === 'admin') {
              onSectionChange('admin-area');
            } else if (user.role === 'doctor') {
              onSectionChange('doctor-area');
            } else {
              onSectionChange('patient-area');
            }
          }}
          title="Login realizado com sucesso!"
          message={successMessage}
        />

      </div>
    </div>
  );
}