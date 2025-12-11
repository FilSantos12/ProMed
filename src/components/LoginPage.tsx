import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { User, Stethoscope, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Alert, AlertDescription } from './ui/alert';
import { LoadingSpinner } from './ui/loading-spinner';
import { ErrorModal } from './ui/error-modal';


interface LoginPageProps {
  onSectionChange: (section: string) => void;
}

export function LoginPage({ onSectionChange }: LoginPageProps) {
  const { login, user } = useAuth();
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  {/*const handleLogin = async (e: React.FormEvent, role?: 'patient' | 'doctor' | 'admin') => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setShowErrorModal(false);

    try {
      await login({
        email: loginData.email,
        password: loginData.password
      });

      // Aguardar um pouco para o context atualizar
      setTimeout(() => {
        // Se o role foi passado explicitamente (ex.: formulário do médico), usar ele para redirecionar
        if (role) {
          switch (role) {
            case 'doctor':
              onSectionChange('doctor-area');
              break;
            case 'patient':
              onSectionChange('patient-area');
              break;
            case 'admin':
              onSectionChange('admin-area');
              break;
            default:
              onSectionChange('home');
          }
          return;
        }

        // Caso contrário, tentar inferir do usuário no localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        switch (currentUser.role) {
          case 'doctor':
            onSectionChange('doctor-area');
            break;
          case 'patient':
            onSectionChange('patient-area');
            break;
          case 'admin':
            onSectionChange('admin-area');
            break;
          default:
            onSectionChange('home');
        }
      }, 500);

          const errorTranslations: { [key: string]: string } = {
            'Invalid credentials': 'Email ou senha incorretos.',
            'The provided credentials are incorrect.': 'Email ou senha incorretos.',
            'These credentials do not match our records.': 'Email ou senha incorretos.',
            'Unauthorized': 'Email ou senha incorretos.',
          };
          
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };*/}

  const handleLogin = async (e: React.FormEvent, expectedRole: string) => {
  e.preventDefault();
  
  setLoading(true);
  setErrorMessage('');
  setShowErrorModal(true);

  try {
    await login(loginData.email,loginData.password, expectedRole);

    const user = JSON.parse(localStorage.getItem('@ProMed:user') || '{}');
    
    // Redirecionar baseado no role
    if (user.role === 'admin') {
      onSectionChange('admin-area');
    } else if (user.role === 'doctor') {
      onSectionChange('doctor-area');
    } else {
      onSectionChange('patient-area');
    }

  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Email ou senha incorretos.';
    setErrorMessage(errorMsg);
  } finally {
    setLoading(false);
  }
};

  const handleDemoLogin = async (userType: 'patient' | 'doctor' | 'admin') => {
    setLoading(true);
    setErrorMessage('');
    setShowErrorModal(false);

    {/*const demoCredentials = {
      patient: { email: 'paciente@demo.com', password: 'password' },
      doctor: { email: 'medico@demo.com', password: 'password' },
      admin: { email: 'admin@promed.com', password: 'password' }
    };

   } try { botão de login demo desativado por enquanto
      await login(demoCredentials[userType]);
      
      setTimeout(() => {
        switch (userType) {
          case 'doctor':
            onSectionChange('doctor-area');
            break;
          case 'patient':
            onSectionChange('patient-area');
            break;
          case 'admin':
            onSectionChange('admin-area');
            break;
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login demo.');
    } finally {
      setLoading(false);
    }
      */}
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Acesse sua conta na ProMed</p>
        </div>

        
        {/* MENSAGEM DE ERRO DESATIVADA - USANDO MODAL
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}*/}

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
                <form onSubmit={(e) => handleLogin(e, 'patient')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Senha</Label>
                    <Input
                      id="patient-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Sua senha"
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <User className="w-4 h-4 mr-2" />
                    {loading ? <LoadingSpinner size="sm" /> : 'Entrar como Paciente'}
                  </Button>
                </form>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  {/*<Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDemoLogin('patient')}
                    disabled={loading}
                  >
                    Acesso Demo - Paciente
                  </Button>*/}
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

          {/* Médico e Admin tabs similares... (mantém o mesmo padrão) */}

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
                <form onSubmit={(e) => handleLogin(e, 'doctor')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email</Label>
                    <Input
                      id="doctor-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="medico@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-password">Senha</Label>
                    <Input
                      id="doctor-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Sua senha"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Entrar como Médico
                  </Button>
                </form>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  {/*<Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDemoLogin('doctor')}
                  >
                    Acesso Demo - Médico
                  </Button>*/}
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
                <form onSubmit={(e) => handleLogin(e, 'admin')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="admin@promed.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Senha</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Sua senha"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Entrar como Admin
                  </Button>
                </form>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  {/*<Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDemoLogin('admin')}
                  >
                    Acesso Demo - Admin
                  </Button>*/}
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
        message={errorMessage}  // ✅ CORRIGIDO
      />

      </div>
    </div>
  );
}