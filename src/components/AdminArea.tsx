import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Shield, Users, Calendar, BarChart3, Settings, 
  User, Stethoscope, Edit, Trash2, Plus, Search,
  Eye, TrendingUp, Clock, MapPin
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AdminAreaProps {
  onSectionChange?: (section: string) => void;
}

export function AdminArea({ onSectionChange }: AdminAreaProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - em produção viria do backend
  const stats = {
    totalPatients: 1247,
    totalDoctors: 52,
    appointmentsToday: 89,
    revenue: 45320
  };

  const recentAppointments = [
    {
      id: 1,
      time: '09:00',
      patient: 'Maria Silva',
      doctor: 'Dr. Roberto Silva',
      specialty: 'Cardiologia',
      status: 'confirmado'
    },
    {
      id: 2,
      time: '10:30',
      patient: 'João Santos',
      doctor: 'Dra. Ana Costa',
      specialty: 'Pediatria',
      status: 'em_andamento'
    },
    {
      id: 3,
      time: '14:00',
      patient: 'Ana Costa',
      doctor: 'Dr. Carlos Oliveira',
      specialty: 'Neurologia',
      status: 'agendado'
    },
  ];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Roberto Silva',
      specialty: 'Cardiologia',
      crm: 'CRM 12345-SP',
      email: 'roberto@promed.com',
      phone: '(11) 99999-9999',
      status: 'ativo',
      patients: 156
    },
    {
      id: 2,
      name: 'Dra. Maria Santos',
      specialty: 'Cardiologia',
      crm: 'CRM 23456-SP',
      email: 'maria@promed.com',
      phone: '(11) 88888-8888',
      status: 'ativo',
      patients: 142
    },
    {
      id: 3,
      name: 'Dr. Carlos Oliveira',
      specialty: 'Neurologia',
      crm: 'CRM 34567-SP',
      email: 'carlos@promed.com',
      phone: '(11) 77777-7777',
      status: 'inativo',
      patients: 98
    },
  ];

  const patients = [
    {
      id: 1,
      name: 'Maria Silva',
      cpf: '123.456.789-00',
      email: 'maria@email.com',
      phone: '(11) 99999-9999',
      lastVisit: '2024-01-15',
      status: 'ativo'
    },
    {
      id: 2,
      name: 'João Santos',
      cpf: '987.654.321-00',
      email: 'joao@email.com',
      phone: '(11) 88888-8888',
      lastVisit: '2024-01-12',
      status: 'ativo'
    },
    {
      id: 3,
      name: 'Ana Costa',
      cpf: '456.789.123-00',
      email: 'ana@email.com',
      phone: '(11) 77777-7777',
      lastVisit: '2024-01-10',
      status: 'inativo'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': case 'confirmado': case 'em_andamento': return 'bg-green-100 text-green-800';
      case 'inativo': case 'cancelado': return 'bg-red-100 text-red-800';
      case 'agendado': case 'pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'confirmado': return 'Confirmado';
      case 'em_andamento': return 'Em Andamento';
      case 'agendado': return 'Agendado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Bem-vindo, {user?.name ?? 'Usuário'} - Gerencie o sistema ProMed
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="medicos" className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4" />
              <span>Médicos</span>
            </TabsTrigger>
            <TabsTrigger value="pacientes" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Pacientes</span>
            </TabsTrigger>
            <TabsTrigger value="agendamentos" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Agendamentos</span>
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                      <p className="text-sm text-gray-600">Pacientes</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12% este mês
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
                      <p className="text-sm text-gray-600">Médicos</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +3 novos
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.appointmentsToday}</p>
                      <p className="text-sm text-gray-600">Consultas Hoje</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-yellow-600">
                    <Clock className="w-4 h-4 mr-1" />
                    18 pendentes
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">R$ {stats.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Receita Mensal</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +8% vs mês anterior
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Agendamentos de Hoje</span>
                </CardTitle>
                <CardDescription>
                  Acompanhe os agendamentos do dia em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horário</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{appointment.time}</TableCell>
                        <TableCell>{appointment.patient}</TableCell>
                        <TableCell>{appointment.doctor}</TableCell>
                        <TableCell>{appointment.specialty}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Médicos Tab */}
          <TabsContent value="medicos" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <span>Gerenciar Médicos</span>
                    </CardTitle>
                    <CardDescription>
                      Administre o cadastro e informações dos médicos
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Médico
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar médico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>CRM</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Pacientes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>{doctor.specialty}</TableCell>
                        <TableCell>{doctor.crm}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>{doctor.patients}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(doctor.status)}>
                            {getStatusLabel(doctor.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pacientes Tab */}
          <TabsContent value="pacientes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>Gerenciar Pacientes</span>
                    </CardTitle>
                    <CardDescription>
                      Administre o cadastro e informações dos pacientes
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Paciente
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Última Consulta</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.cpf}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>{patient.lastVisit}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(patient.status)}>
                            {getStatusLabel(patient.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agendamentos Tab */}
          <TabsContent value="agendamentos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Gerenciar Agendamentos</span>
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os agendamentos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Select defaultValue="todos">
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="em_andamento">Em andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select defaultValue="hoje">
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoje">Hoje</SelectItem>
                        <SelectItem value="semana">Esta semana</SelectItem>
                        <SelectItem value="mes">Este mês</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Médico</TableHead>
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">Hoje</div>
                              <div className="text-sm text-gray-600">{appointment.time}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{appointment.patient}</TableCell>
                          <TableCell>{appointment.doctor}</TableCell>
                          <TableCell>{appointment.specialty}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusLabel(appointment.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="configuracoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span>Configurações do Sistema</span>
                </CardTitle>
                <CardDescription>
                  Configure as preferências e parâmetros do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações da Clínica</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clinic-name">Nome da Clínica</Label>
                      <Input id="clinic-name" defaultValue="ProMed" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clinic-phone">Telefone</Label>
                      <Input id="clinic-phone" defaultValue="(11) 3456-7890" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clinic-address">Endereço</Label>
                    <Input id="clinic-address" defaultValue="Av. Paulista, 1234 - Bela Vista, São Paulo - SP" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Horários de Funcionamento</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Dias da Semana</Label>
                      <Input defaultValue="Segunda a Sexta" />
                    </div>
                    <div className="space-y-2">
                      <Label>Horário de Início</Label>
                      <Input type="time" defaultValue="07:00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Horário de Fim</Label>
                      <Input type="time" defaultValue="19:00" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configurações de Agendamento</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duração padrão da consulta (min)</Label>
                      <Input type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Antecedência mínima para agendamento (horas)</Label>
                      <Input type="number" defaultValue="2" />
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}