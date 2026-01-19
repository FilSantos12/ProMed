import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Calendar, Edit, Eye,
  Stethoscope, Heart, Brain, Bone, Baby, Activity, Eye as EyeIcon, Ear, Users,
  Pill, Syringe, TestTube, Microscope, Thermometer, UserCircle, UserCheck,
  Circle, Square, Triangle, Star, AlertCircle, CheckCircle, XCircle, Info, Zap,
  Sparkles, Sun, Moon, Cloud, Droplet, Shield, Cross,
  Hospital, Ambulance, Bandage, FileHeart, Clipboard, HeartPulse,
  Radar, Target, LucideIcon
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { Pagination } from './Pagination';

// Mapa de ícones disponíveis (mesmo padrão do Specialties.tsx)
const ICON_MAP: Record<string, LucideIcon> = {
  Heart, Brain, Eye: EyeIcon, Ear, Bone, Activity, Stethoscope,
  Pill, Syringe, TestTube, Microscope, Thermometer,
  Baby, User: Users, Users, UserCircle, UserCheck,
  Circle, Square, Triangle, Star,
  AlertCircle, CheckCircle, XCircle, Info, Zap,
  Sparkles, Sun, Moon, Cloud, Droplet,
  Shield, Cross, Hospital, Ambulance, Bandage,
  FileHeart, Clipboard, HeartPulse, Radar, Target
};

interface Doctor {
  id: number;
  name: string;
  email: string;
  cpf: string;
  crm?: string;
  specialty_id?: number;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  cpf: string;
  date_of_birth?: string;
}

interface Specialty {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  specialty_id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'in_progress';
  patient_notes?: string;
  doctor_notes?: string;
  cancellation_reason?: string;
  patient: Patient;
  doctor: Doctor;
  specialty: Specialty;
  created_at?: string;
  updated_at?: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterDate, setFilterDate] = useState('hoje');

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Estados para modais
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Estado para formulário de edição
  const [editFormData, setEditFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    status: '',
    patient_notes: '',
    doctor_notes: ''
  });

  // Hook do Toast
  const toast = useToast();

  const API_URL = 'http://localhost:8000/api/v1/admin';

  // Resetar para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterDate]);

  // Buscar agendamentos quando página ou filtros mudarem
  useEffect(() => {
    fetchAppointments();
  }, [currentPage, filterStatus, filterDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_URL}/appointments?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Extrair dados paginados do Laravel
      if (response.data.data) {
        setAppointments(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
        setTotalItems(response.data.total);
        setItemsPerPage(response.data.per_page);
      } else {
        setAppointments(response.data);
      }
      setError(null);
    } catch (err: any) {
      setError('Erro ao carregar consultas');
      //console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    
    // Remover segundos do horário (15:00:00 -> 15:00)
    const timeWithoutSeconds = appointment.appointment_time.substring(0, 5);
    
    setEditFormData({
      appointment_date: appointment.appointment_date.split('T')[0],
      appointment_time: timeWithoutSeconds,
      status: appointment.status,
      patient_notes: appointment.patient_notes || '',
      doctor_notes: appointment.doctor_notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const token = localStorage.getItem('token');
      
      // Preparar dados no formato correto
      const updateData = {
        appointment_date: editFormData.appointment_date,
        appointment_time: editFormData.appointment_time,
        status: editFormData.status,
        patient_notes: editFormData.patient_notes || null,
        doctor_notes: editFormData.doctor_notes || null
      };

      //console.log('Enviando dados:', updateData);

      const response = await axios.put(
        `${API_URL}/appointments/${selectedAppointment.id}`,
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      //console.log('Resposta:', response.data);
      
      setShowEditModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
      
      // Toast de sucesso
      toast.success('✅ Agendamento atualizado com sucesso!');
      
    } catch (err: any) {
      //console.error('Erro completo:', err.response);
      
      // Formatar erros de validação
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        
        // Traduzir nomes dos campos para português
        const fieldNames: { [key: string]: string } = {
          'appointment_date': 'Data',
          'appointment_time': 'Horário',
          'status': 'Status',
          'patient_notes': 'Observações do Paciente',
          'doctor_notes': 'Observações do Médico',
          'patient_id': 'Paciente',
          'doctor_id': 'Médico'
        };
        
        const errorMessages = Object.keys(errors).map(key => {
          const fieldName = fieldNames[key] || key;
          const messages = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
          return `• ${fieldName}: ${messages.join(', ')}`;
        }).join('\n');
        
        // Toast de erro com mensagens formatadas
        toast.error(`❌ Erro ao salvar:\n\n${errorMessages}`, 8000);
      } else {
        const errorMessage = err.response?.data?.message || 'Erro ao atualizar agendamento. Tente novamente.';
        
        // Toast de erro genérico
        toast.error(`❌ ${errorMessage}`, 6000);
      }
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'Não Compareceu';
      case 'in_progress': return 'Em Andamento';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    // Extrair apenas a parte da data (YYYY-MM-DD) sem considerar horário
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    
    // Criar data usando o horário local (sem conversão UTC)
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Comparar apenas as datas
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hoje';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Ontem';
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Filtro de status
    const matchesStatus = filterStatus === 'todos' || 
      (filterStatus === 'agendado' && appointment.status === 'scheduled') ||
      (filterStatus === 'confirmado' && appointment.status === 'confirmed') ||
      (filterStatus === 'em_andamento' && appointment.status === 'completed') ||
      (filterStatus === 'concluido' && appointment.status === 'completed') ||
      (filterStatus === 'cancelado' && appointment.status === 'cancelled');

    // Filtro de data - Extrair data sem considerar horário UTC
    const [year, month, day] = appointment.appointment_date.split('T')[0].split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    let matchesDate = true;
    if (filterDate === 'hoje') {
      matchesDate = appointmentDate.toDateString() === today.toDateString();
    } else if (filterDate === 'semana') {
      matchesDate = appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
    } else if (filterDate === 'mes') {
      matchesDate = appointmentDate >= startOfMonth && appointmentDate <= endOfMonth;
    }

    return matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Carregando agendamentos...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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

            <Select value={filterDate} onValueChange={setFilterDate}>
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
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhum agendamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatDate(appointment.appointment_date)}</div>
                        <div className="text-sm text-gray-600">{appointment.appointment_time}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {appointment.patient?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {appointment.doctor?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {appointment.specialty?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditAppointment(appointment)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewAppointment(appointment)}
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </CardContent>

      {/* Modal de Visualização */}
      {showViewModal && selectedAppointment && (() => {
        const IconComponent = ICON_MAP[selectedAppointment.specialty?.icon || 'Stethoscope'] || Stethoscope;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModals}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl animate-zoom-in">
            {/* Header - Fixo */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Detalhes do Agendamento</h3>
              </div>
              <button 
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            {/* Body - Scrollable com altura fixa */}
            <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {/* Informações Principais */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Paciente</label>
                  <p className="text-gray-900 font-medium">{selectedAppointment.patient?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedAppointment.patient?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-600">CPF: {selectedAppointment.patient?.cpf || 'N/A'}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-green-900 mb-2">Médico</label>
                  <p className="text-gray-900 font-medium">{selectedAppointment.doctor?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedAppointment.doctor?.email || 'N/A'}</p>
                </div>
              </div>

              {/* Especialidade e Status */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-purple-900 mb-2">Especialidade</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{selectedAppointment.specialty?.name || 'N/A'}</p>
                      {selectedAppointment.specialty?.description && (
                        <p className="text-sm text-gray-600">{selectedAppointment.specialty.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {getStatusLabel(selectedAppointment.status)}
                  </Badge>
                </div>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-orange-900 mb-2">Data</label>
                  <p className="text-gray-900 font-medium">{formatDate(selectedAppointment.appointment_date)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-orange-900 mb-2">Horário</label>
                  <p className="text-gray-900 font-medium text-2xl">{selectedAppointment.appointment_time}</p>
                </div>
              </div>

              {/* Observações */}
              {selectedAppointment.patient_notes && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">📝 Observações do Paciente</label>
                  <p className="text-gray-900">{selectedAppointment.patient_notes}</p>
                </div>
              )}

              {selectedAppointment.doctor_notes && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <label className="block text-sm font-semibold text-green-900 mb-2">🩺 Observações do Médico</label>
                  <p className="text-gray-900">{selectedAppointment.doctor_notes}</p>
                </div>
              )}

              {selectedAppointment.cancellation_reason && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <label className="block text-sm font-semibold text-red-900 mb-2">❌ Motivo do Cancelamento</label>
                  <p className="text-red-700">{selectedAppointment.cancellation_reason}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Criado em</label>
                  <p className="text-sm text-gray-900">{new Date(selectedAppointment.created_at!).toLocaleString('pt-BR')}</p>
                </div>
                
                {selectedAppointment.confirmed_at && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Confirmado em</label>
                    <p className="text-sm text-gray-900">{new Date(selectedAppointment.confirmed_at).toLocaleString('pt-BR')}</p>
                  </div>
                )}

                {selectedAppointment.completed_at && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Concluído em</label>
                    <p className="text-sm text-gray-900">{new Date(selectedAppointment.completed_at).toLocaleString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Fixo */}
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <Button onClick={closeModals} className="shadow-lg">
                Fechar
              </Button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Modal de Edição */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModals}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl animate-zoom-in">
            {/* Header - Fixo */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Editar Agendamento</h3>
              </div>
              <button 
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <form onSubmit={handleUpdateAppointment}>
              {/* Body - Scrollable com altura fixa */}
              <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                {/* Info Box */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium text-blue-900">Paciente:</span>
                      <p className="text-gray-900 font-medium">{selectedAppointment.patient?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-purple-900">Médico:</span>
                      <p className="text-gray-900 font-medium">{selectedAppointment.doctor?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                    <input
                      type="date"
                      value={editFormData.appointment_date}
                      onChange={(e) => setEditFormData({ ...editFormData, appointment_date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ℹ️ O backend requer data de hoje ou futura
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horário *</label>
                    <input
                      type="time"
                      value={editFormData.appointment_time}
                      onChange={(e) => setEditFormData({ ...editFormData, appointment_time: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    id="status-select"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="scheduled">Agendado</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                    <option value="no_show">Não Compareceu</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                {/* Observações do Paciente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📝 Observações do Paciente</label>
                  <textarea
                    value={editFormData.patient_notes}
                    onChange={(e) => setEditFormData({ ...editFormData, patient_notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows={3}
                    placeholder="Observações do paciente..."
                  />
                </div>

                {/* Observações do Médico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🩺 Observações do Médico</label>
                  <textarea
                    value={editFormData.doctor_notes}
                    onChange={(e) => setEditFormData({ ...editFormData, doctor_notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows={3}
                    placeholder="Observações do médico..."
                  />
                </div>
              </div>

              {/* Footer - Fixo */}
              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeModals}
                  className="shadow"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="shadow-lg"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Appointments;