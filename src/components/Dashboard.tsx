import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import {
  Users, Stethoscope, Calendar, BarChart3,
  TrendingUp, Clock, Eye, AlertCircle
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  doctorsPending: number;
  doctorsApproved: number;
  doctorsRejected: number;
  appointmentsToday: number;
  appointmentsPending: number;
  appointmentsThisMonth: number;
  appointmentsCompleted: number;
  monthlyRevenue: number;
}

interface DashboardProps {
  onViewPendingDoctors?: () => void;
}

interface RecentAppointment {
  id: number;
  time: string;
  patient: string;
  doctor: string;
  specialty: string;
  status: string;
}

interface ChartData {
  last7Days: { date: string; count: number }[];
  doctorsBySpecialty: { name: string; count: number }[];
}

  const Dashboard: React.FC<DashboardProps> = ({ onViewPendingDoctors }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const API_URL = 'http://localhost:8000/api/v1/admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data.stats);
      setRecentAppointments(response.data.recentAppointments || []);
      setCharts(response.data.charts);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
      toast.error('❌ Erro ao carregar dashboard', 6000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'scheduled': 'Agendado',
      'confirmed': 'Confirmado',
      'completed': 'Concluído',
      'cancelled': 'Cancelado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error || 'Erro ao carregar dados'}</p>
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={fetchDashboardData}>
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pacientes */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                <p className="text-sm text-gray-600">Pacientes</p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              Total cadastrados
            </div>
          </CardContent>
        </Card>

        {/* Total Médicos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
                <p className="text-sm text-gray-600">Médicos</p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <span className="text-green-600 font-medium">{stats.doctorsApproved} ativos</span>
              {stats.doctorsPending > 0 && (
                <span className="ml-2 text-yellow-600 font-medium">
                  • {stats.doctorsPending} pendentes
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consultas Hoje */}
        <Card className="hover:shadow-lg transition-shadow">
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
              {stats.appointmentsPending} pendentes
            </div>
          </CardContent>
        </Card>

        {/* Receita Mensal */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">Receita Mensal</p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <span className="text-purple-600 font-medium">
                {stats.appointmentsCompleted} consultas concluídas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas - Médicos Pendentes */}
      {stats.doctorsPending > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    {stats.doctorsPending} médico(s) aguardando aprovação
                  </p>
                  <p className="text-sm text-yellow-700">
                    Revise os cadastros e documentos pendentes
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                onClick={onViewPendingDoctors}
              >
                Ver Pendentes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultas de Hoje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Consultas de Hoje</span>
          </CardTitle>
          <CardDescription>
            Acompanhe os agendamentos do dia em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma consulta agendada para hoje</p>
            </div>
          ) : (
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
                      <Button size="sm" variant="outline" title="Ver detalhes">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resumo do Mês */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Resumo Mensal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">Total de Consultas</span>
                <span className="text-xl font-bold text-blue-600">{stats.appointmentsThisMonth}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">Consultas Concluídas</span>
                <span className="text-xl font-bold text-green-600">{stats.appointmentsCompleted}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-900">Receita Total</span>
                <span className="text-xl font-bold text-purple-600">
                  R$ {stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-green-600" />
              <span>Status dos Médicos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">Aprovados</span>
                <span className="text-xl font-bold text-green-600">{stats.doctorsApproved}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-yellow-900">Pendentes</span>
                <span className="text-xl font-bold text-yellow-600">{stats.doctorsPending}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-900">Rejeitados</span>
                <span className="text-xl font-bold text-red-600">{stats.doctorsRejected}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;