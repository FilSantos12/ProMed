import React, { useState, useEffect } from 'react';
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
import Appointments from './Appointments';
import Patients from './Patients';
import Doctors from './Doctors';
import Dashboard from './Dashboard';
import Specialties from './Specialties';

interface AdminAreaProps {
  onSectionChange?: (section: string) => void;
}

export function AdminArea({ onSectionChange }: AdminAreaProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorsFilter, setDoctorsFilter] = useState<string>('all');

  // ✅ FUNÇÃO PARA VER MÉDICOS PENDENTES (LUGAR CORRETO)
  const handleViewPendingDoctors = () => {
    setDoctorsFilter('pending');
    setActiveTab('medicos');
  };

  // ✅ USEEFFECT PARA RESETAR FILTRO AO TROCAR DE ABA
  useEffect(() => {
    if (activeTab !== 'medicos') {
      setDoctorsFilter('all');
    }
  }, [activeTab]);

  // ⚠️ PROTEÇÃO DE ACESSO - Apenas administradores podem acessar
  useEffect(() => {
    console.log('Verificando acesso - Usuário:', user);

    if (!user) {
      console.log('❌ Usuário não autenticado - Redirecionando para login');
      onSectionChange?.('login');
      return;
    }

    console.log('Role do usuário:', user.role);

    if (user.role !== 'admin') {
      console.log('❌ Usuário não é admin - Redirecionando baseado no role');
      // Redirecionar baseado no role
      if (user.role === 'doctor') {
        onSectionChange?.('doctor-area');
      } else if (user.role === 'patient') {
        onSectionChange?.('patient-area');
      } else {
        onSectionChange?.('home');
      }
    } else {
      console.log('✅ Acesso permitido - Usuário é admin');
    }
  }, [user, onSectionChange]);

  // Se não for admin, não renderiza nada (evita flash de conteúdo)
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

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
          <div className="overflow-x-auto mb-6">
            <TabsList className="inline-flex w-full min-w-max md:grid md:grid-cols-3 lg:grid-cols-5 gap-2">
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
            <TabsTrigger value="especialidades" className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4" />
              <span>Especialidades</span>
            </TabsTrigger>
            <TabsTrigger value="agendamentos" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Agendamentos</span>
            </TabsTrigger>
            {/*<TabsTrigger value="configuracoes" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </TabsTrigger>*/}
          </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard onViewPendingDoctors={handleViewPendingDoctors} />
          </TabsContent>

          {/* Médicos Tab */}
          {activeTab === 'medicos' && (
            <Doctors initialFilterStatus={doctorsFilter} />
          )}

          {/* Pacientes Tab */}
          <TabsContent value="pacientes" className="space-y-6">
            <Patients />
          </TabsContent>

          {/* Especialidades Tab */}
          <TabsContent value="especialidades" className="space-y-6">
            <Specialties />
          </TabsContent>

          {/* Agendamentos Tab */}
          <TabsContent value="agendamentos" className="space-y-6">
            <Appointments />
          </TabsContent>

          {/* Configurações Tab */}
          {/*<TabsContent value="configuracoes" className="space-y-6">
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
          </TabsContent>*/}
        </Tabs>
      </div>
    </div>
  );
}