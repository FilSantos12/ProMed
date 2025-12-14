import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar, Clock, User, FileText, Download, Eye, Plus, Phone, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';


interface PatientAreaProps {
  
  onSectionChange: (section: string) => void;
}

export function PatientArea({ onSectionChange }: PatientAreaProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('consultas');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  

  // Mock data - em produção viria do backend
  const consultas = [
    {
      id: 1,
      date: '2024-01-20',
      time: '10:00',
      doctor: 'Dr. Roberto Silva',
      specialty: 'Cardiologia',
      status: 'agendada',
      type: 'Consulta',
      location: 'Consultório 201'
    },
    {
      id: 2,
      date: '2024-01-15',
      time: '14:30',
      doctor: 'Dra. Maria Santos',
      specialty: 'Cardiologia',
      status: 'concluida',
      type: 'Retorno',
      location: 'Consultório 203'
    },
    {
      id: 3,
      date: '2024-01-10',
      time: '09:00',
      doctor: 'Dr. Carlos Oliveira',
      specialty: 'Neurologia',
      status: 'concluida',
      type: 'Consulta',
      location: 'Consultório 105'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-100 text-blue-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'disponivel': return 'bg-green-100 text-green-800';
      case 'processando': return 'bg-yellow-100 text-yellow-800';
      case 'ativa': return 'bg-green-100 text-green-800';
      case 'finalizada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendada': return 'Agendada';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      case 'disponivel': return 'Disponível';
      case 'processando': return 'Processando';
      case 'ativa': return 'Ativa';
      case 'finalizada': return 'Finalizada';
      default: return status;
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header with Avatar */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <label 
                htmlFor="patient-photo-upload" 
                className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  
                <Camera className="w-6 h-6 text-white" />
              </label>
              <input
                id="patient-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                arial-label="Upload de foto de perfil"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Área do Paciente
              </h1>
              <p className="text-gray-600">
                Bem-vindo, {user?.name} - CPF: {user?.cpf}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSectionChange('agendamentos')}>
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Agendar Consulta</h3>
              <p className="text-sm text-gray-600">Marque uma nova consulta</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Histórico Médico</h3>
              <p className="text-sm text-gray-600">Visualizar prontuário</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="consultas" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Consultas</span>
            </TabsTrigger>
            <TabsTrigger value="perfil" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* Consultas Tab */}
          <TabsContent value="consultas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span>Minhas Consultas</span>
                    </CardTitle>
                    <CardDescription>
                      Visualize suas consultas agendadas e histórico
                    </CardDescription>
                  </div>
                  <Button onClick={() => onSectionChange('agendamentos')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Consulta
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultas.map((consulta) => (
                      <TableRow key={consulta.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{consulta.date}</div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {consulta.time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{consulta.doctor}</TableCell>
                        <TableCell>{consulta.specialty}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{consulta.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(consulta.status)}>
                            {getStatusLabel(consulta.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {consulta.status === 'agendada' ? (
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                Reagendar
                              </Button>
                              <Button size="sm" variant="outline">
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Detalhes
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Perfil Tab */}
          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Meu Perfil</span>
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" defaultValue={user?.cpf} disabled />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" defaultValue={user?.phone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth">Data de Nascimento</Label>
                    <Input id="birth" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency">Contato de Emergência</Label>
                    <Input id="emergency" placeholder="(11) 99999-9999" />
                  </div>
                </div>
                
                <Button className="w-full">
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Convênios</CardTitle>
                <CardDescription>
                  Gerencie seus planos de saúde
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Unimed</h4>
                        <p className="text-sm text-gray-600">Cartão: 123456789</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Convênio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}