import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Calendar, Clock, User, FileText, Phone, Edit, Check, X, Mail, Plus, Camera, AlertCircle, Trash2, Power } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { doctorService, DoctorProfile, DoctorAppointment, DoctorSchedule, DoctorStats } from '../services/doctorService';
import { LoadingSpinner } from './ui/loading-spinner';
import { Alert, AlertDescription } from './ui/alert';

interface DoctorAreaProps {
  onSectionChange?: (section: string) => void;
}

export function DoctorArea({ onSectionChange: _onSectionChange }: DoctorAreaProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('agenda');

  // Estados para dados do backend
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [appointmentsHistory, setAppointmentsHistory] = useState<DoctorAppointment[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [stats, setStats] = useState<DoctorStats | null>(null);

  // Estados de loading e erro
  const [loading, setLoading] = useState(true);
  const [loadingAppointments] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para formulários
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    consultation_price: 0,
    consultation_duration: 30,
    years_experience: 0,
  });

  // Estados para Controle de Agenda
  const [scheduleForm, setScheduleForm] = useState({
    start_date: '',
    end_date: '',
    start_time: '08:00',
    end_time: '18:00',
    days_of_week: [] as number[],
    consultation_duration: 30,
    break_time: 0,
    lunch_break: '12:00-13:00',
  });

  // Estados para modal de confirmação
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);

  // Estados para edição de horários
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    start_time: '',
    end_time: '',
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileData, statsData, appointmentsData] = await Promise.all([
        doctorService.getProfile(),
        doctorService.getStats(),
        // Buscar apenas consultas NÃO finalizadas (pending e confirmed)
        doctorService.getAppointments({
          status: 'pending,confirmed'
        }),
      ]);

      setProfile(profileData);
      setStats(statsData);
      setAppointments(appointmentsData);

      // Atualizar estados do formulário
      setProfileData({
        bio: profileData?.bio || '',
        consultation_price: profileData?.consultation_price || 0,
        consultation_duration: profileData?.consultation_duration || 30,
        years_experience: profileData?.years_experience || 0,
      });

      // Carregar avatar do backend (se existir)
      if (profileData?.user?.avatar) {
        // Usar avatar_url se disponível, senão construir URL manualmente
        const avatarUrl = (profileData.user as any).avatar_url ||
                         `${import.meta.env.VITE_API_URL}/storage/${profileData.user.avatar}`;
        setProfilePhoto(avatarUrl);
        console.log('Avatar do médico carregado:', avatarUrl);
      } else {
        console.log('Nenhum avatar encontrado no perfil do médico');
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados do médico');
      toast.error('Erro ao carregar dados', 6000);
    } finally {
      setLoading(false);
    }
  };

  // Carregar horários
  const loadSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const schedulesData = await doctorService.getSchedules();
      setSchedules(schedulesData);
    } catch (err: any) {
      console.error('Erro ao carregar horários:', err);
      toast.error('Erro ao carregar horários', 6000);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Carregar histórico de consultas
  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      // Buscar consultas concluídas, canceladas e no_show
      const historyData = await doctorService.getAppointments({
        status: 'completed,cancelled,no_show'
      });
      console.log('Histórico carregado:', historyData);
      console.log('Total de consultas no histórico:', historyData.length);
      setAppointmentsHistory(historyData);
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err);
      console.error('Detalhes do erro:', err.response?.data);
      toast.error('Erro ao carregar histórico de consultas', 6000);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'controle-agenda') {
      loadSchedules();
    } else if (activeTab === 'historico') {
      loadHistory();
    }
  }, [activeTab]);

  // Funções de manipulação de consultas
  const handleConfirmAppointment = async (appointmentId: number) => {
    try {
      await doctorService.confirmAppointment(appointmentId);
      toast.success('Consulta confirmada com sucesso!', 3000);

      // Atualizar lista de consultas
      setAppointments(prev =>
        prev.map(appt =>
          appt.id === appointmentId ? { ...appt, status: 'confirmed' } : appt
        )
      );
    } catch (err: any) {
      console.error('Erro ao confirmar consulta:', err);
      toast.error('Erro ao confirmar consulta', 6000);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    const reason = prompt('Motivo do cancelamento (opcional):');
    try {
      await doctorService.cancelAppointment(appointmentId, reason || undefined);
      toast.success('Consulta cancelada', 3000);

      // Remover da lista de próximas consultas (vai para o histórico)
      setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));

      // Se estiver na aba de histórico, recarregar
      if (activeTab === 'historico') {
        loadHistory();
      }
    } catch (err: any) {
      console.error('Erro ao cancelar consulta:', err);
      toast.error('Erro ao cancelar consulta', 6000);
    }
  };

  const handleCompleteAppointment = async (appointmentId: number) => {
    try {
      await doctorService.completeAppointment(appointmentId);
      toast.success('Consulta marcada como concluída!', 3000);

      // Remover da lista de próximas consultas
      setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));

      // Se estiver na aba de histórico, recarregar
      if (activeTab === 'historico') {
        loadHistory();
      }
    } catch (err: any) {
      console.error('Erro ao completar consulta:', err);
      toast.error('Erro ao completar consulta', 6000);
    }
  };

  const handleNoShowAppointment = async (appointmentId: number) => {
    try {
      await doctorService.noShowAppointment(appointmentId);
      toast.success('Consulta marcada como faltou', 3000);

      // Remover da lista de próximas consultas
      setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));

      // Se estiver na aba de histórico, recarregar
      if (activeTab === 'historico') {
        loadHistory();
      }
    } catch (err: any) {
      console.error('Erro ao marcar como faltou:', err);
      toast.error('Erro ao marcar como faltou', 6000);
    }
  };

  // Upload de foto de perfil
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Preview local imediato
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload para o backend
      const response = await doctorService.uploadAvatar(file);

      // Usar a URL retornada pelo backend
      setProfilePhoto(response.avatar_url);

      toast.success('Foto atualizada com sucesso!', 3000);

      // Atualizar o estado do perfil com a nova URL
      if (profile) {
        setProfile({
          ...profile,
          user: { ...profile.user, avatar: response.avatar_url }
        });
      }
    } catch (err: any) {
      console.error('Erro ao fazer upload da foto:', err);
      toast.error('Erro ao atualizar foto', 6000);
    }
  };

  // Atualizar perfil
  const handleUpdateProfile = async () => {
    try {
      const updatedProfile = await doctorService.updateProfile(profileData);
      setProfile(updatedProfile);
      setEditingProfile(false);
      toast.success('Perfil atualizado com sucesso!', 3000);
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      toast.error('Erro ao atualizar perfil', 6000);
    }
  };

  // Funções de Controle de Agenda
  // Extrair dias da semana únicos de um intervalo de datas
  const extractDaysOfWeek = (startDate: string, endDate: string): number[] => {
    if (!startDate || !endDate) return [];

    // Adicionar T00:00:00 para evitar problemas de timezone
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const daysSet = new Set<number>();

    // Iterar por cada dia no intervalo
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      daysSet.add(date.getDay()); // 0 = domingo, 1 = segunda, etc.
    }

    return Array.from(daysSet).sort();
  };

  const handleAddSchedule = async () => {
    try {
      // Validação
      if (!scheduleForm.start_date || !scheduleForm.end_date) {
        toast.error('Selecione o período de datas (início e fim)', 6000);
        return;
      }

      if (scheduleForm.days_of_week.length === 0) {
        toast.error('Nenhum dia da semana foi detectado no período selecionado', 6000);
        return;
      }

      if (!scheduleForm.start_time || !scheduleForm.end_time) {
        toast.error('Preencha os horários de início e fim', 6000);
        return;
      }

      // Gerar lista de todas as datas no intervalo
      const generateDateRange = (startDate: string, endDate: string): string[] => {
        const dates: string[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          dates.push(date.toISOString().split('T')[0]);
        }

        return dates;
      };

      const allDates = generateDateRange(scheduleForm.start_date, scheduleForm.end_date);

      // Criar um horário para cada data
      const promises = allDates.map(date => {
        const scheduleData = {
          schedule_date: date,
          start_time: scheduleForm.start_time,
          end_time: scheduleForm.end_time,
          is_available: true,
        };
        console.log('Enviando dados do horário:', scheduleData);
        return doctorService.addSchedule(scheduleData);
      });

      await Promise.all(promises);

      toast.success(`${allDates.length} horários adicionados com sucesso!`, 3000);

      // Limpar formulário
      setScheduleForm({
        start_date: '',
        end_date: '',
        start_time: '08:00',
        end_time: '18:00',
        days_of_week: [],
        consultation_duration: 30,
        break_time: 0,
        lunch_break: '12:00-13:00',
      });

      // Recarregar horários
      loadSchedules();
    } catch (err: any) {
      console.error('Erro ao adicionar horários:', err);
      console.error('Detalhes do erro:', err.response?.data);

      // Mostrar mensagem de erro mais específica
      const errorMessage = err.response?.data?.message || 'Erro ao adicionar horários';
      const errors = err.response?.data?.errors;

      if (errors) {
        console.error('Erros de validação:', errors);
        const firstError = Object.values(errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : errorMessage, 6000);
      } else {
        toast.error(errorMessage, 6000);
      }
    }
  };

  const handleDeleteSchedule = (scheduleId: number) => {
    setScheduleToDelete(scheduleId);
    setShowDeleteModal(true);
  };

  const confirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    try {
      await doctorService.deleteSchedule(scheduleToDelete);
      toast.success('Horário deletado com sucesso!', 3000);
      setShowDeleteModal(false);
      setScheduleToDelete(null);
      loadSchedules();
    } catch (err: any) {
      console.error('Erro ao deletar horário:', err);
      toast.error('Erro ao deletar horário', 6000);
    }
  };

  const cancelDeleteSchedule = () => {
    setShowDeleteModal(false);
    setScheduleToDelete(null);
  };

  const handleToggleScheduleAvailability = async (scheduleId: number, currentStatus: boolean) => {
    try {
      await doctorService.updateSchedule(scheduleId, {
        is_available: !currentStatus,
      });
      toast.success(
        !currentStatus ? 'Horário ativado!' : 'Horário desativado!',
        3000
      );
      loadSchedules();
    } catch (err: any) {
      console.error('Erro ao alterar disponibilidade:', err);
      toast.error('Erro ao alterar disponibilidade', 6000);
    }
  };

  const handleStartEditSchedule = (schedule: DoctorSchedule) => {
    setEditingScheduleId(schedule.id);
    setEditForm({
      start_time: schedule.start_time.substring(0, 5),
      end_time: schedule.end_time.substring(0, 5),
    });
  };

  const handleSaveEditSchedule = async () => {
    if (!editingScheduleId) return;

    try {
      await doctorService.updateSchedule(editingScheduleId, {
        start_time: editForm.start_time,
        end_time: editForm.end_time,
      });
      toast.success('Horário atualizado com sucesso!', 3000);
      setEditingScheduleId(null);
      loadSchedules();
    } catch (err: any) {
      console.error('Erro ao atualizar horário:', err);
      toast.error('Erro ao atualizar horário', 6000);
    }
  };

  const handleCancelEditSchedule = () => {
    setEditingScheduleId(null);
    setEditForm({ start_time: '', end_time: '' });
  };

  const getDayName = (dayNumber: number): string => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[dayNumber] || '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'pending': 'Pendente',
      'scheduled': 'Agendado',
      'confirmed': 'Confirmado',
      'completed': 'Concluído',
      'cancelled': 'Cancelado',
      'no_show': 'Não Compareceu',
    };
    return labels[status] || status;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={loadInitialData}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">

                <Camera className="w-6 h-6 text-white" />
              </label>
              <input
                id="doctor-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                aria-label="Upload de foto de perfil"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Área do Médico
              </h1>
              <p className="text-gray-600">
                Bem-vindo, {profile?.user?.name || user?.name || 'Usuário'} - {profile?.specialty?.name || 'Especialidade'} | CRM {profile?.crm || 'N/A'}/{profile?.crm_state || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats?.appointmentsToday || 0}
              </div>
              <div className="text-sm text-gray-600">Consultas Hoje</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats?.appointmentsWeek || 0}
              </div>
              <div className="text-sm text-gray-600">Esta Semana</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats?.appointmentsMonth || 0}
              </div>
              <div className="text-sm text-gray-600">Este Mês</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {stats?.activePatients || 0}
              </div>
              <div className="text-sm text-gray-600">Pacientes Ativos</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="inline-flex w-full h-auto flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
            <TabsTrigger value="agenda" className="flex items-center space-x-2 flex-1 min-w-fit">
              <Calendar className="w-4 h-4" />
              <span>Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="controle-agenda" className="flex items-center space-x-2 flex-1 min-w-fit">
              <Clock className="w-4 h-4" />
              <span>Controle de Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center space-x-2 flex-1 min-w-fit">
              <FileText className="w-4 h-4" />
              <span>Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center space-x-2 flex-1 min-w-fit">
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
                  <span>Próximas Consultas</span>
                </CardTitle>
                <CardDescription>
                  Consultas pendentes e confirmadas (não finalizadas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="mt-2 text-gray-600">Carregando consultas...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma consulta pendente ou confirmada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">
                                  {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{appointment.appointment_time.substring(0, 5)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="font-medium">{appointment.patient?.name || 'Paciente'}</span>
                              </div>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusLabel(appointment.status)}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{appointment.patient?.phone || 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span>{appointment.patient?.email || 'N/A'}</span>
                              </div>
                            </div>

                            {appointment.patient_notes && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 mb-1">Observações do paciente:</p>
                                <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                  {appointment.patient_notes}
                                </p>
                              </div>
                            )}

                            {appointment.doctor_notes && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Suas anotações:</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {appointment.doctor_notes}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <div className="flex space-x-2">
                              {appointment.status === 'pending' && (
                                <>
                                  <button
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      height: '32px',
                                      padding: '0 12px',
                                      fontSize: '14px',
                                      fontWeight: '500',
                                      color: 'white',
                                      backgroundColor: '#16a34a',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.2s'
                                    }}
                                    onClick={() => handleConfirmAppointment(appointment.id)}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                                    title="Confirmar consulta"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Confirmar
                                  </button>
                                  <button
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      height: '32px',
                                      padding: '0 12px',
                                      fontSize: '14px',
                                      fontWeight: '500',
                                      color: '#dc2626',
                                      backgroundColor: 'white',
                                      border: '1px solid #fca5a5',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.2s'
                                    }}
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    title="Cancelar consulta"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancelar
                                  </button>
                                </>
                              )}
                              {appointment.status === 'confirmed' && (
                                <>
                                  <button
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      height: '32px',
                                      padding: '0 12px',
                                      fontSize: '14px',
                                      fontWeight: '500',
                                      color: 'white',
                                      backgroundColor: '#2563eb',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.2s'
                                    }}
                                    onClick={() => handleCompleteAppointment(appointment.id)}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                    title="Marcar como concluída"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Concluir
                                  </button>
                                  <button
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      height: '32px',
                                      padding: '0 12px',
                                      fontSize: '14px',
                                      fontWeight: '500',
                                      color: '#ea580c',
                                      backgroundColor: 'white',
                                      border: '1px solid #fed7aa',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.2s'
                                    }}
                                    onClick={() => handleNoShowAppointment(appointment.id)}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff7ed'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    title="Paciente não compareceu"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Faltou
                                  </button>
                                  <button
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      height: '32px',
                                      padding: '0 12px',
                                      fontSize: '14px',
                                      fontWeight: '500',
                                      color: '#dc2626',
                                      backgroundColor: 'white',
                                      border: '1px solid #fca5a5',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.2s'
                                    }}
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    title="Cancelar consulta"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancelar
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Botões de Contato Rápido */}
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`tel:${appointment.patient?.phone}`)}
                                title="Ligar para o paciente"
                                className="text-green-600 hover:text-green-700"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`mailto:${appointment.patient?.email}`)}
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
                )}
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
                </CardTitle>
                <CardDescription>
                  Configure seus horários de disponibilidade por dia da semana
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Configurações Rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Duração da Consulta</Label>
                    <select
                      className="w-full p-2 border rounded text-sm"
                      aria-label="Duração da Consulta"
                      value={scheduleForm.consultation_duration}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, consultation_duration: Number(e.target.value) })}
                    >
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Intervalo</Label>
                    <select
                      className="w-full p-2 border rounded text-sm"
                      aria-label="Intervalo entre Consultas"
                      value={scheduleForm.break_time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, break_time: Number(e.target.value) })}
                    >
                      <option value="0">Sem intervalo</option>
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Almoço</Label>
                    <select
                      className="w-full p-2 border rounded text-sm"
                      aria-label="Intervalo para Almoço"
                      value={scheduleForm.lunch_break}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, lunch_break: e.target.value })}
                    >
                      <option value="12:00-13:00">12h - 13h</option>
                      <option value="13:00-14:00">13h - 14h</option>
                      <option value="none">Sem intervalo</option>
                    </select>
                  </div>
                </div>

                {/* Novo Período - Formulário Compacto */}
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-medium mb-3 text-sm">Adicionar Horários de Disponibilidade</h4>
                  <div className="space-y-3">
                    {/* Período de Datas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">📅 Data Início do Período</Label>
                        <Input
                          type="date"
                          className="text-sm"
                          value={scheduleForm.start_date}
                          onChange={(e) => {
                            setScheduleForm({ ...scheduleForm, start_date: e.target.value });
                            // Auto-detectar dias da semana se ambas as datas estiverem preenchidas
                            if (e.target.value && scheduleForm.end_date) {
                              const days = extractDaysOfWeek(e.target.value, scheduleForm.end_date);
                              setScheduleForm(prev => ({ ...prev, days_of_week: days }));
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">📅 Data Fim do Período</Label>
                        <Input
                          type="date"
                          className="text-sm"
                          value={scheduleForm.end_date}
                          onChange={(e) => {
                            setScheduleForm({ ...scheduleForm, end_date: e.target.value });
                            // Auto-detectar dias da semana se ambas as datas estiverem preenchidas
                            if (scheduleForm.start_date && e.target.value) {
                              const days = extractDaysOfWeek(scheduleForm.start_date, e.target.value);
                              setScheduleForm(prev => ({ ...prev, days_of_week: days }));
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Horários */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">⏰ Horário Início</Label>
                        <Input
                          type="time"
                          className="text-sm"
                          value={scheduleForm.start_time}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">⏰ Horário Fim</Label>
                        <Input
                          type="time"
                          className="text-sm"
                          value={scheduleForm.end_time}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button className="w-full" size="sm" onClick={handleAddSchedule}>
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </div>

                    {/* Dias da Semana Detectados */}
                    {scheduleForm.days_of_week.length > 0 && (
                      <div className="bg-white border border-blue-300 rounded-md p-3">
                        <p className="text-xs text-gray-600 mb-2 font-medium">✓ Dias da semana detectados automaticamente:</p>
                        <div className="flex flex-wrap gap-2">
                          {scheduleForm.days_of_week.map(dayIndex => (
                            <Badge key={dayIndex} variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                              {getDayName(dayIndex)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {scheduleForm.start_date && scheduleForm.end_date && scheduleForm.days_of_week.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-300 rounded-md p-2">
                        <p className="text-xs text-yellow-800">⚠️ Nenhum dia detectado. Verifique se a data de fim é posterior à data de início.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista de Horários Configurados */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Horários Configurados</h4>

                  {loadingSchedules ? (
                    <div className="text-center py-8">
                      <LoadingSpinner />
                      <p className="mt-2 text-gray-600 text-sm">Carregando horários...</p>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Nenhum horário configurado</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Adicione seus horários de disponibilidade acima
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Agrupar horários por data específica */}
                      {schedules
                        .sort((a, b) => {
                          const dateA = a.schedule_date ? new Date(a.schedule_date).getTime() : 0;
                          const dateB = b.schedule_date ? new Date(b.schedule_date).getTime() : 0;
                          return dateA - dateB;
                        })
                        .reduce((groups: any[], schedule) => {
                          const dateKey = schedule.schedule_date || 'sem-data';
                          const existing = groups.find(g => g.date === dateKey);
                          if (existing) {
                            existing.schedules.push(schedule);
                          } else {
                            groups.push({ date: dateKey, schedules: [schedule] });
                          }
                          return groups;
                        }, [])
                        .map((group) => {
                          const formatDate = (dateString: string) => {
                            if (!dateString || dateString === 'sem-data') return 'Sem data';

                            try {
                              // Extrair apenas a parte da data (YYYY-MM-DD)
                              const datePart = dateString.split('T')[0];
                              const [year, month, day] = datePart.split('-').map(Number);

                              // Criar data sem problemas de timezone
                              const date = new Date(year, month - 1, day);

                              const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                              const dayName = dayNames[date.getDay()];
                              const dayStr = String(day).padStart(2, '0');
                              const monthStr = String(month).padStart(2, '0');

                              return `${dayName}, ${dayStr}/${monthStr}/${year}`;
                            } catch (e) {
                              console.error('Erro ao formatar data:', dateString, e);
                              return 'Data inválida';
                            }
                          };

                          return (
                            <div key={group.date} className="border rounded-lg p-4 bg-white">
                              <div className="flex items-center mb-3">
                                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                                <h5 className="font-medium text-gray-900">{formatDate(group.date)}</h5>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {group.schedules.length} {group.schedules.length === 1 ? 'horário' : 'horários'}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                {group.schedules.map((schedule: DoctorSchedule) => (
                                <div
                                  key={schedule.id}
                                  className={`border rounded-md p-3 ${
                                    schedule.is_available ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    {editingScheduleId === schedule.id ? (
                                      // Modo de Edição
                                      <div className="flex items-center space-x-3 flex-1">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <div className="flex items-center space-x-2">
                                          <Input
                                            type="time"
                                            value={editForm.start_time}
                                            onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                                            className="w-28 text-sm h-8"
                                          />
                                          <span className="text-sm text-gray-600">-</span>
                                          <Input
                                            type="time"
                                            value={editForm.end_time}
                                            onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                                            className="w-28 text-sm h-8"
                                          />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Button
                                            size="sm"
                                            onClick={handleSaveEditSchedule}
                                            className="!bg-green-600 hover:!bg-green-700 !text-white h-8 font-semibold"
                                            style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                                          >
                                            <Check className="w-4 h-4 mr-1" />
                                            Salvar
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCancelEditSchedule}
                                            className="h-8 text-gray-900 border-gray-300"
                                          >
                                            <X className="w-4 h-4 mr-1" />
                                            Cancelar
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      // Modo de Visualização
                                      <>
                                        <div className="flex items-center space-x-4 flex-1">
                                          <div className="flex items-center space-x-2">
                                            <Clock className={`w-4 h-4 ${schedule.is_available ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <span className="text-sm font-medium">
                                              {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            <span>Duração: {scheduleForm.consultation_duration}min</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge
                                            variant="outline"
                                            className={
                                              schedule.is_available
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-gray-100 text-gray-600 border-gray-300'
                                            }
                                          >
                                            {schedule.is_available ? 'Ativo' : 'Inativo'}
                                          </Badge>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleStartEditSchedule(schedule)}
                                            title="Editar horário"
                                            className="hover:bg-blue-100"
                                          >
                                            <Edit className="w-4 h-4 text-blue-600" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleToggleScheduleAvailability(schedule.id, schedule.is_available)}
                                            title={schedule.is_available ? 'Desativar' : 'Ativar'}
                                            className="hover:bg-orange-100"
                                          >
                                            {schedule.is_available ? (
                                              <Power className="w-4 h-4 text-orange-600" />
                                            ) : (
                                              <Check className="w-4 h-4 text-green-600" />
                                            )}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteSchedule(schedule.id)}
                                            title="Deletar permanentemente"
                                            className="hover:bg-red-100"
                                          >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                          </Button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Dica */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Dica:</strong> Configure seus horários de disponibilidade selecionando os dias da semana e
                    definindo o período (início e fim). Você pode adicionar vários horários diferentes para cada dia.
                    Use os botões de ação para ativar/desativar ou deletar horários existentes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico Tab */}
          <TabsContent value="historico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Histórico de Consultas</span>
                </CardTitle>
                <CardDescription>
                  Consultas concluídas, canceladas e não compareceu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="mt-2 text-gray-600">Carregando histórico...</p>
                  </div>
                ) : appointmentsHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma consulta no histórico</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointmentsHistory.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <span className="font-medium">
                                  {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-purple-600" />
                                <span className="font-medium">{appointment.appointment_time.substring(0, 5)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="font-medium">
                                  {appointment.patient?.name || appointment.patient?.user?.name || 'Paciente'}
                                </span>
                              </div>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusLabel(appointment.status)}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{appointment.patient?.phone || appointment.patient?.user?.phone || 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span>{appointment.patient?.email || appointment.patient?.user?.email || 'N/A'}</span>
                              </div>
                            </div>

                            {appointment.patient_notes && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 mb-1">Observações do paciente:</p>
                                <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                  {appointment.patient_notes}
                                </p>
                              </div>
                            )}

                            {appointment.doctor_notes && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 mb-1">Suas anotações:</p>
                                <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                                  {appointment.doctor_notes}
                                </p>
                              </div>
                            )}

                            {appointment.cancellation_reason && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 mb-1">Motivo do cancelamento:</p>
                                <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
                                  {appointment.cancellation_reason}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                              {appointment.completed_at && (
                                <div className="flex items-center space-x-1">
                                  <Check className="w-3 h-3 text-green-600" />
                                  <span>Concluído em: {new Date(appointment.completed_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                              )}
                              {appointment.cancelled_at && (
                                <div className="flex items-center space-x-1">
                                  <X className="w-3 h-3 text-red-600" />
                                  <span>Cancelado em: {new Date(appointment.cancelled_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="configuracoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Configurações do Perfil</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingProfile(!editingProfile)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {editingProfile ? 'Cancelar' : 'Editar'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais e preferências
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={profile?.user?.name || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Entre em contato com o suporte para alterar seu nome
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                      id="specialty"
                      value={profile?.specialty?.name || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="crm">CRM</Label>
                    <Input
                      id="crm"
                      value={profile?.crm || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crm_state">UF</Label>
                    <Input
                      id="crm_state"
                      value={profile?.crm_state || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profile?.user?.phone || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consultation_price">Preço Consulta (R$)</Label>
                    <Input
                      id="consultation_price"
                      type="number"
                      value={profileData.consultation_price}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          consultation_price: Number(e.target.value),
                        })
                      }
                      disabled={!editingProfile}
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultation_duration">Duração (min)</Label>
                    <Input
                      id="consultation_duration"
                      type="number"
                      value={profileData.consultation_duration}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          consultation_duration: Number(e.target.value),
                        })
                      }
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years_experience">Anos de Experiência</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      value={profileData.years_experience}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          years_experience: Number(e.target.value),
                        })
                      }
                      disabled={!editingProfile}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia Profissional</Label>
                  <Textarea
                    id="bio"
                    placeholder="Descreva sua experiência e formação..."
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        bio: e.target.value,
                      })
                    }
                    disabled={!editingProfile}
                  />
                </div>

                {editingProfile && (
                  <Button className="w-full" onClick={handleUpdateProfile}>
                    Salvar Alterações
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Confirmação de Deleção */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fade-in">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelDeleteSchedule}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-zoom-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Tem certeza que deseja deletar este horário permanentemente?
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-xs text-yellow-900">
                <strong className="text-black">Atenção:</strong> Esta ação não pode ser desfeita. O horário será removido permanentemente.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1 text-gray-900 border-gray-300 hover:bg-gray-100"
                onClick={cancelDeleteSchedule}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white font-semibold"
                onClick={confirmDeleteSchedule}
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              >
                Deletar Permanentemente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}