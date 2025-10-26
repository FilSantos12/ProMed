import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Calendar, Clock, User, FileText, Phone, Edit, Check, X, Mail, Plus, Camera } from 'lucide-react';

interface DoctorAreaProps {
  user: any;
}

export function DoctorArea({ user }: DoctorAreaProps) {
  const [activeTab, setActiveTab] = useState('agenda');
  const [profilePhoto, setProfilePhoto] = useState<string>('');

  // Mock data - em produção viria do backend
  const agendamentos = [
    {
      id: 1,
      date: '2024-01-15',
      time: '09:00',
      patient: 'Maria Silva',
      phone: '(11) 99999-9999',
      type: 'Consulta',
      status: 'confirmado',
      observations: 'Paciente com dores no peito'
    },
    {
      id: 2,
      date: '2024-01-15',
      time: '10:30',
      patient: 'João Santos',
      phone: '(11) 88888-8888',
      type: 'Retorno',
      status: 'pendente',
      observations: 'Acompanhamento cardiológico'
    },
    {
      id: 3,
      date: '2024-01-15',
      time: '14:00',
      patient: 'Ana Costa',
      phone: '(11) 77777-7777',
      type: 'Consulta',
      status: 'confirmado',
      observations: 'Check-up anual'
    },
  ];

  const estatisticas = {
    consultasHoje: 5,
    consultasSemana: 28,
    consultasMes: 120,
    pacientesAtivos: 156
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    // Aqui seria feita a atualização no backend
    console.log(`Alterando status do agendamento ${appointmentId} para ${newStatus}`);
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
                htmlFor="doctor-photo-upload" 
                className="cursor-pointer text-blue-600">
                  Enviar foto do médico
                <Camera className="w-6 h-6 text-white" />
              </label>
              <input
                id="doctor-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Área do Médico
              </h1>
              <p className="text-gray-600">
                Bem-vindo, {user.name} - {user.specialty} | {user.crm}
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {estatisticas.consultasHoje}
              </div>
              <div className="text-sm text-gray-600">Consultas Hoje</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {estatisticas.consultasSemana}
              </div>
              <div className="text-sm text-gray-600">Esta Semana</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {estatisticas.consultasMes}
              </div>
              <div className="text-sm text-gray-600">Este Mês</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {estatisticas.pacientesAtivos}
              </div>
              <div className="text-sm text-gray-600">Pacientes Ativos</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agenda" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="controle-agenda" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Controle de Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Agenda Tab */}
          <TabsContent value="agenda" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Agenda do Dia - 15/01/2024</span>
                </CardTitle>
                <CardDescription>
                  Gerencie seus agendamentos e consultas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agendamentos.map((agendamento) => (
                    <div key={agendamento.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{agendamento.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-600" />
                              <span className="font-medium">{agendamento.patient}</span>
                            </div>
                            <Badge variant="outline">{agendamento.type}</Badge>
                            <Badge className={getStatusColor(agendamento.status)}>
                              {getStatusLabel(agendamento.status)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{agendamento.phone}</span>
                            </div>
                          </div>
                          
                          {agendamento.observations && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {agendamento.observations}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <div className="flex space-x-2">
                            {agendamento.status === 'pendente' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStatusChange(agendamento.id, 'confirmado')}
                                  title="Confirmar consulta"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStatusChange(agendamento.id, 'cancelado')}
                                  title="Cancelar consulta"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" title="Editar agendamento">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Botões de Contato Rápido */}
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(`tel:${agendamento.phone}`)}
                              title="Ligar para o paciente"
                              className="text-green-600 hover:text-green-700"
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(`mailto:${agendamento.patient.toLowerCase().replace(' ', '.')}@email.com`)}
                              title="Enviar email para o paciente"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Controle de Agenda Tab */}
          <TabsContent value="controle-agenda" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Controle de Agenda</span>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Período
                  </Button>
                </CardTitle>
                <CardDescription>
                  Configure seus períodos de disponibilidade por data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Configurações Rápidas */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Duração da Consulta</Label>
                    <select className="w-full p-2 border rounded text-sm" aria-label="Duração da Consulta">
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Intervalo</Label>
                    <select className="w-full p-2 border rounded text-sm" aria-label="Intervalo entre Consultas">
                      <option value="0">Sem intervalo</option>
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Almoço</Label>
                    <select className="w-full p-2 border rounded text-sm" aria-label="Intervalo para Almoço">
                      <option value="12:00-13:00">12h - 13h</option>
                      <option value="13:00-14:00">13h - 14h</option>
                      <option value="none">Sem intervalo</option>
                    </select>
                  </div>
                </div>

                {/* Novo Período - Formulário Compacto */}
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-medium mb-3 text-sm">Adicionar Período de Disponibilidade</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Data Início</Label>
                      <Input type="date" className="text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Data Fim</Label>
                      <Input type="date" className="text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Horário Início</Label>
                      <Input type="time" defaultValue="08:00" className="text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Horário Fim</Label>
                      <Input type="time" defaultValue="18:00" className="text-sm" />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" size="sm">
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-4 text-xs">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Seg</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Ter</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Qua</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Qui</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Sex</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Sáb</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Dom</span>
                    </label>
                    <span className="text-gray-500 ml-2">(Aplicar apenas nestes dias)</span>
                  </div>
                </div>

                {/* Lista de Períodos Configurados */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Períodos Configurados</h4>
                  
                  {/* Período Ativo */}
                  <div className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <div className="text-sm">
                            <span className="font-medium">15/01/2025</span>
                            <span className="text-gray-500 mx-1">até</span>
                            <span className="font-medium">30/06/2025</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">08:00 - 18:00</span>
                        </div>
                        <div className="flex space-x-1">
                          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map((dia) => (
                            <span key={dia} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {dia}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Ativo
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex items-center space-x-3">
                      <span>• Almoço: 12:00 - 13:00</span>
                      <span>• Duração: 30 min</span>
                      <span>• Intervalo: 15 min</span>
                    </div>
                  </div>

                  {/* Período com Final de Semana */}
                  <div className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <div className="text-sm">
                            <span className="font-medium">01/02/2025</span>
                            <span className="text-gray-500 mx-1">até</span>
                            <span className="font-medium">31/12/2025</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">09:00 - 13:00</span>
                        </div>
                        <div className="flex space-x-1">
                          {['Sáb', 'Dom'].map((dia) => (
                            <span key={dia} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              {dia}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Ativo
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex items-center space-x-3">
                      <span>• Sem intervalo de almoço</span>
                      <span>• Duração: 45 min</span>
                    </div>
                  </div>

                  {/* Período de Bloqueio */}
                  <div className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-red-600" />
                          <div className="text-sm">
                            <span className="font-medium">25/12/2024</span>
                            <span className="text-gray-500 mx-1">até</span>
                            <span className="font-medium">05/01/2025</span>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-red-700">Férias - Período Bloqueado</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                          Bloqueado
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dica */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Dica:</strong> Configure períodos de disponibilidade por data. Você pode criar múltiplos períodos 
                    com horários diferentes e escolher quais dias da semana aplicar. Para bloquear férias ou eventos, 
                    desmarque todos os dias da semana.
                  </p>
                </div>

                <Button className="w-full">
                  Salvar Todas as Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="configuracoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Configurações do Perfil</span>
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais e preferências
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" defaultValue={user.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input id="specialty" defaultValue={user.specialty} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="crm">CRM</Label>
                    <Input id="crm" defaultValue={user.crm} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(11) 99999-9999" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia Profissional</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Descreva sua experiência e formação..."
                    rows={4}
                  />
                </div>
                
                <Button className="w-full">
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}