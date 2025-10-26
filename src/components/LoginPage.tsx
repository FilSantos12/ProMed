import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { User, Lock, Mail, Stethoscope, Shield } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: any) => void;
  onSectionChange: (section: string) => void;
}

export function LoginPage({ onLogin, onSectionChange }: LoginPageProps) {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = (e: React.FormEvent, userType: 'patient' | 'doctor' | 'admin') => {
    e.preventDefault();
    
    // Simulação de login - em produção seria feita validação real
    const users = {
      patient: {
        id: 1,
        name: 'João Silva',
        email: loginData.email,
        role: 'patient',
        phone: '(11) 99999-9999',
        cpf: '123.456.789-00'
      },
      doctor: {
        id: 2,
        name: 'Dr. Roberto Silva',
        email: loginData.email,
        role: 'doctor',
        specialty: 'Cardiologia',
        crm: 'CRM 12345-SP'
      },
      admin: {
        id: 3,
        name: 'Admin Sistema',
        email: loginData.email,
        role: 'admin'
      }
    };

    onLogin(users[userType]);
  };

  const handleDemoLogin = (userType: 'patient' | 'doctor' | 'admin') => {
    const users = {
      patient: {
        id: 1,
        name: 'João Silva (Demo)',
        email: 'paciente@demo.com',
        role: 'patient',
        phone: '(11) 99999-9999',
        cpf: '123.456.789-00'
      },
      doctor: {
        id: 2,
        name: 'Dr. Roberto Silva (Demo)',
        email: 'medico@demo.com',
        role: 'doctor',
        specialty: 'Cardiologia',
        crm: 'CRM 12345-SP'
      },
      admin: {
        id: 3,
        name: 'Admin Sistema (Demo)',
        email: 'admin@demo.com',
        role: 'admin'
      }
    };

    onLogin(users[userType]);
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
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Entrar como Paciente
                  </Button>
                </form>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDemoLogin('patient')}
                  >
                    Acesso Demo - Paciente
                  </Button>
                  <div className="text-center space-y-2">
                    <Button 
                      variant="link" 
                      className="text-sm"
                      onClick={() => onSectionChange('cadastro-paciente')}
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDemoLogin('doctor')}
                  >
                    Acesso Demo - Médico
                  </Button>
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDemoLogin('admin')}
                  >
                    Acesso Demo - Admin
                  </Button>
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

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h4 className="font-medium text-gray-900">Primeira vez aqui?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Utilize os botões "Acesso Demo" para testar as funcionalidades do sistema
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSectionChange('cadastro-paciente')}
                >
                  Cadastro Paciente
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSectionChange('cadastro-profissional')}
                >
                  Cadastro Médico
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}