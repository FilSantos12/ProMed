import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import {
  Calendar, Clock, User, FileText, Download, Eye, Plus, Phone, Camera, Edit, X, AlertCircle,
  Stethoscope, Heart, Brain, Bone, Baby, Activity, Eye as EyeIcon, Ear, Users,
  Pill, Syringe, TestTube, Microscope, Thermometer, UserCircle, UserCheck,
  Circle, Square, Triangle, Star, CheckCircle, XCircle, Info, Zap,
  Sparkles, Sun, Moon, Cloud, Droplet, Shield, Cross,
  Hospital, Ambulance, Bandage, FileHeart, Clipboard, HeartPulse,
  Radar, Target, LucideIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { patientService, PatientProfile, PatientAppointment, PatientStats, MedicalRecord } from '../services/patientService';
import { LoadingSpinner } from './ui/loading-spinner';
import { Alert, AlertDescription } from './ui/alert';
import doctorApplicationService, { DoctorApplicationStatus as DoctorAppStatus } from '../services/doctorApplicationService';
import { DoctorApplicationStatus } from './DoctorApplicationStatus';
import { Pagination } from './Pagination';

// Mapa de ícones disponíveis (mesmo padrão do Specialties.tsx)
const ICON_MAP: Record<string, LucideIcon> = {
  Heart, Brain, Eye: EyeIcon, Ear, Bone, Activity, Stethoscope,
  Pill, Syringe, TestTube, Microscope, Thermometer,
  Baby, User, Users, UserCircle, UserCheck,
  Circle, Square, Triangle, Star,
  AlertCircle, CheckCircle, XCircle, Info, Zap,
  Sparkles, Sun, Moon, Cloud, Droplet,
  Shield, Cross, Hospital, Ambulance, Bandage,
  FileHeart, Clipboard, HeartPulse, Radar, Target
};

interface PatientAreaProps {
  onSectionChange: (section: string) => void;
}

export function PatientArea({ onSectionChange }: PatientAreaProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('consultas');

  // Estados para dados do backend
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);

  // Estados de loading e erro
  const [loading, setLoading] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginação para Consultas
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [appointmentsTotalPages, setAppointmentsTotalPages] = useState(1);
  const [appointmentsTotalItems, setAppointmentsTotalItems] = useState(0);
  const [appointmentsItemsPerPage, setAppointmentsItemsPerPage] = useState(10);

  // Estados para formulários
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: '',
    rg: '',
    emergency_contact: '',
    emergency_phone: '',
    blood_type: '',
    allergies: '',
    chronic_diseases: '',
    medications: '',
    health_insurance: '',
    insurance_number: '',
  });

  // Estados para cancelamento de consulta
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Estados para detalhes de consulta
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);

  // Estados para prontuários médicos
  const [showMedicalRecordsModal, setShowMedicalRecordsModal] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loadingMedicalRecords, setLoadingMedicalRecords] = useState(false);

  // Estados para solicitação de médico
  const [showDoctorApplicationInfo, setShowDoctorApplicationInfo] = useState(false);
  const [doctorApplicationStatus, setDoctorApplicationStatus] = useState<DoctorAppStatus | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
    loadDoctorApplicationStatus();
  }, []);

  // Carregar consultas quando página mudar
  useEffect(() => {
    if (!loading) {
      loadAppointments();
    }
  }, [appointmentsPage]);

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await patientService.getAppointments({ page: appointmentsPage });

      // Extrair dados paginados
      if (response.data) {
        setAppointments(response.data);
        setAppointmentsTotalPages(response.last_page || 1);
        setAppointmentsTotalItems(response.total || 0);
        setAppointmentsItemsPerPage(response.per_page || 10);
      } else {
        setAppointments(response);
      }
    } catch (err: any) {
      console.error('Erro ao carregar consultas:', err);
      toast.error('Erro ao carregar consultas');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileData, statsData] = await Promise.all([
        patientService.getProfile(),
        patientService.getStats(),
      ]);

      setProfile(profileData);
      setStats(statsData);

      // Carregar appointments iniciais
      await loadAppointments();

      // Atualizar estados do formulário
      if (profileData) {
        // Converter birth_date de ISO para YYYY-MM-DD se necessário
        let birthDate = profileData.user?.birth_date || '';
        if (birthDate && birthDate.includes('T')) {
          birthDate = birthDate.split('T')[0];
        }

        setProfileData({
          name: profileData.user?.name || '',
          email: profileData.user?.email || '',
          phone: profileData.user?.phone || '',
          birth_date: birthDate,
          gender: profileData.user?.gender || '',
          rg: profileData.user?.rg || '',
          emergency_contact: profileData.emergency_contact || '',
          emergency_phone: profileData.emergency_phone || '',
          blood_type: profileData.blood_type || '',
          allergies: profileData.allergies || '',
          chronic_diseases: profileData.chronic_diseases || '',
          medications: profileData.medications || '',
          health_insurance: profileData.health_insurance || '',
          insurance_number: profileData.insurance_number || '',
        });

        // Carregar avatar do backend (se existir)
        if (profileData.user?.avatar) {
          // Usar avatar_url se disponível, senão construir URL manualmente
          const avatarUrl = (profileData.user as any).avatar_url ||
                           `${import.meta.env.VITE_API_URL}/storage/${profileData.user.avatar}`;
          setProfilePhoto(avatarUrl);
          console.log('Avatar carregado:', avatarUrl);
        } else {
          console.log('Nenhum avatar encontrado no perfil');
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados do paciente');
      setLoading(false);
      toast.error('Erro ao carregar dados do paciente');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Preview imediato
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePhoto(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload para o backend
        const result = await patientService.uploadAvatar(file);
        setProfilePhoto(result.avatar_url);
        toast.success('Foto atualizada com sucesso!');

        // Recarregar perfil
        const updatedProfile = await patientService.getProfile();
        setProfile(updatedProfile);
      } catch (err: any) {
        console.error('Erro ao fazer upload da foto:', err);
        toast.error(err.response?.data?.message || 'Erro ao fazer upload da foto');
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setEditingProfile(false);
      const updatedProfile = await patientService.updateProfile(profileData);
      setProfile(updatedProfile);
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      toast.error(err.response?.data?.message || 'Erro ao atualizar perfil');
    }
  };

  const handleCancelAppointment = (appointmentId: number) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      console.log('Cancelando consulta ID:', appointmentToCancel);
      console.log('Motivo:', cancellationReason);

      await patientService.cancelAppointment(appointmentToCancel, cancellationReason);
      toast.success('Consulta cancelada com sucesso!');

      // Recarregar consultas
      await loadAppointments();

      setShowCancelModal(false);
      setAppointmentToCancel(null);
      setCancellationReason('');
    } catch (err: any) {
      console.error('Erro ao cancelar consulta:', err);
      console.error('Detalhes do erro:', err.response?.data);

      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Erro ao cancelar consulta';
      toast.error(errorMessage);
    }
  };

  const handleViewDetails = (appointment: PatientAppointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleViewMedicalRecords = async () => {
    try {
      setLoadingMedicalRecords(true);
      setShowMedicalRecordsModal(true);
      const records = await patientService.getMedicalRecords();
      setMedicalRecords(records);
    } catch (err: any) {
      console.error('Erro ao carregar prontuários:', err);
      toast.error('Erro ao carregar prontuários médicos');
    } finally {
      setLoadingMedicalRecords(false);
    }
  };

  // Funções para solicitação de médico
  const loadDoctorApplicationStatus = async () => {
    try {
      const status = await doctorApplicationService.checkApplicationStatus();
      setDoctorApplicationStatus(status);
    } catch (err: any) {
      console.error('Erro ao carregar status da solicitação:', err);
    }
  };

  const handleApplyAsDoctor = () => {
    setShowDoctorApplicationInfo(true);
  };

  const handleProceedToApplication = () => {
    setShowDoctorApplicationInfo(false);
    // Redirecionar para a página de cadastro profissional existente
    onSectionChange('cadastro-profissional');
  };


  const handleAccessDoctorArea = () => {
    onSectionChange('doctor-area');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'Não compareceu';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Se já tem 'T' (formato ISO completo), usar diretamente
      // Senão, adicionar 'T00:00:00' para datas no formato YYYY-MM-DD
      const date = dateString.includes('T')
        ? new Date(dateString)
        : new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-lg">Carregando seus dados...</p>
          <p className="mt-2 text-gray-500 text-sm">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadInitialData} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header with Avatar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
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
                  aria-label="Upload de foto de perfil"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Área do Paciente
                </h1>
                <p className="text-gray-600">
                  Bem-vindo, {profile?.user?.name || user?.name} - CPF: {profile?.user?.cpf || user?.cpf || 'N/A'}
                </p>
              </div>
            </div>

            {/* Botão discreto para solicitar cadastro como médico */}
            {doctorApplicationStatus && !doctorApplicationStatus.has_application && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleApplyAsDoctor}
                className="flex items-center space-x-2 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Solicitar Cadastro Médico</span>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {stats.upcoming_appointments}
                </div>
                <div className="text-sm text-gray-600">Próximas Consultas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {stats.completed_appointments}
                </div>
                <div className="text-sm text-gray-600">Concluídas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {stats.total_appointments}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {stats.cancelled_appointments}
                </div>
                <div className="text-sm text-gray-600">Canceladas</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Doctor Application Status */}
        {doctorApplicationStatus && doctorApplicationStatus.has_application && (
          <div className="mb-8">
            <DoctorApplicationStatus
              status={doctorApplicationStatus}
              onApplyAgain={handleApplyAsDoctor}
              onAccessDoctorArea={handleAccessDoctorArea}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSectionChange('agendamentos')}>
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Agendar Consulta</h3>
              <p className="text-sm text-gray-600">Marque uma nova consulta</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleViewMedicalRecords}>
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
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma consulta encontrada</p>
                    <Button onClick={() => onSectionChange('agendamentos')} className="mt-4">
                      Agendar Primeira Consulta
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Médico</TableHead>
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => {
                        // Estrutura: appointment.doctor = User, appointment.doctor.doctor = Doctor
                        const doctorName = appointment.doctor?.name || 'N/A';
                        const specialtyName = appointment.doctor?.doctor?.specialty?.name || appointment.specialty?.name || 'N/A';
                        const specialtyIcon = appointment.doctor?.doctor?.specialty?.icon || appointment.specialty?.icon || 'Stethoscope';
                        const IconComponent = ICON_MAP[specialtyIcon] || Stethoscope;

                        return (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{formatDate(appointment.appointment_date)}</div>
                                <div className="text-sm text-gray-600 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {appointment.appointment_time}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {doctorName}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                                  <IconComponent className="w-4 h-4 text-gray-700" />
                                </div>
                                <span>{specialtyName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusLabel(appointment.status)}
                              </Badge>
                            </TableCell>
                          <TableCell>
                            {(appointment.status === 'pending' || appointment.status === 'confirmed') ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                Cancelar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(appointment)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Detalhes
                              </Button>
                            )}
                          </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    </Table>

                    {/* Paginação */}
                    <Pagination
                      currentPage={appointmentsPage}
                      totalPages={appointmentsTotalPages}
                      onPageChange={setAppointmentsPage}
                      totalItems={appointmentsTotalItems}
                      itemsPerPage={appointmentsItemsPerPage}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Perfil Tab */}
          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span>Meu Perfil</span>
                    </CardTitle>
                    <CardDescription>
                      Gerencie suas informações pessoais
                    </CardDescription>
                  </div>
                  {!editingProfile ? (
                    <Button onClick={() => setEditingProfile(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleUpdateProfile}>
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProfile(false)}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" value={profile?.user?.cpf || ''} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth">Data de Nascimento</Label>
                    <Input
                      id="birth"
                      type="date"
                      value={profileData.birth_date}
                      onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Input
                      id="gender"
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency">Contato de Emergência</Label>
                    <Input
                      id="emergency"
                      value={profileData.emergency_contact}
                      onChange={(e) => setProfileData({ ...profileData, emergency_contact: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
                    <Input
                      id="emergency_phone"
                      value={profileData.emergency_phone}
                      onChange={(e) => setProfileData({ ...profileData, emergency_phone: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Médicas</CardTitle>
                <CardDescription>
                  Dados importantes para o atendimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="blood_type">Tipo Sanguíneo</Label>
                  <Input
                    id="blood_type"
                    value={profileData.blood_type}
                    onChange={(e) => setProfileData({ ...profileData, blood_type: e.target.value })}
                    disabled={!editingProfile}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea
                    id="allergies"
                    value={profileData.allergies}
                    onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                    disabled={!editingProfile}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronic_diseases">Doenças Crônicas</Label>
                  <Textarea
                    id="chronic_diseases"
                    value={profileData.chronic_diseases}
                    onChange={(e) => setProfileData({ ...profileData, chronic_diseases: e.target.value })}
                    disabled={!editingProfile}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Medicamentos em Uso</Label>
                  <Textarea
                    id="medications"
                    value={profileData.medications}
                    onChange={(e) => setProfileData({ ...profileData, medications: e.target.value })}
                    disabled={!editingProfile}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/*<Card>
              <CardHeader>
                <CardTitle>Convênio</CardTitle>
                <CardDescription>
                  Informações do plano de saúde
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="health_insurance">Convênio</Label>
                    <Input
                      id="health_insurance"
                      value={profileData.health_insurance}
                      onChange={(e) => setProfileData({ ...profileData, health_insurance: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance_number">Número da Carteirinha</Label>
                    <Input
                      id="insurance_number"
                      value={profileData.insurance_number}
                      onChange={(e) => setProfileData({ ...profileData, insurance_number: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>*/}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-zoom-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cancelar Consulta</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <Label htmlFor="cancellation_reason">Motivo do Cancelamento (opcional)</Label>
              <Textarea
                id="cancellation_reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                placeholder="Informe o motivo do cancelamento..."
                className="mt-2"
              />
            </div>

            <div className="flex space-x-3">
              <Button onClick={confirmCancelAppointment} variant="destructive" className="flex-1">
                Confirmar Cancelamento
              </Button>
              <Button onClick={() => setShowCancelModal(false)} variant="outline" className="flex-1">
                Voltar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Consulta */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 p-6 animate-zoom-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Detalhes da Consulta</h3>
                  <p className="text-sm text-gray-600">Informações completas</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Status</Label>
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  {getStatusLabel(selectedAppointment.status)}
                </Badge>
              </div>

              {/* Informações da Consulta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Data</span>
                  </Label>
                  <p className="text-gray-900">{formatDate(selectedAppointment.appointment_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Horário</span>
                  </Label>
                  <p className="text-gray-900">{selectedAppointment.appointment_time}</p>
                </div>
              </div>

              {/* Médico e Especialidade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Médico</span>
                  </Label>
                  <p className="text-gray-900">{selectedAppointment.doctor?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center space-x-1">
                    <Stethoscope className="w-4 h-4" />
                    <span>Especialidade</span>
                  </Label>
                  <p className="text-gray-900">
                    {selectedAppointment.doctor?.doctor?.specialty?.name || selectedAppointment.specialty?.name || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Notas do Paciente */}
              {selectedAppointment.patient_notes && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>Suas Observações</span>
                  </Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedAppointment.patient_notes}</p>
                  </div>
                </div>
              )}

              {/* Notas do Médico */}
              {selectedAppointment.doctor_notes && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center space-x-1">
                    <Stethoscope className="w-4 h-4" />
                    <span>Observações do Médico</span>
                  </Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedAppointment.doctor_notes}</p>
                  </div>
                </div>
              )}

              {/* Motivo do Cancelamento */}
              {selectedAppointment.status === 'cancelled' && selectedAppointment.cancellation_reason && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Motivo do Cancelamento</span>
                  </Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedAppointment.cancellation_reason}</p>
                  </div>
                </div>
              )}

              {/* Informações de Data */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                  {selectedAppointment.confirmed_at && (
                    <div>
                      <span className="font-semibold">Confirmada em:</span>
                      <br />
                      {new Date(selectedAppointment.confirmed_at).toLocaleString('pt-BR')}
                    </div>
                  )}
                  {selectedAppointment.cancelled_at && (
                    <div>
                      <span className="font-semibold">Cancelada em:</span>
                      <br />
                      {new Date(selectedAppointment.cancelled_at).toLocaleString('pt-BR')}
                    </div>
                  )}
                  {selectedAppointment.completed_at && (
                    <div>
                      <span className="font-semibold">Concluída em:</span>
                      <br />
                      {new Date(selectedAppointment.completed_at).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <Button onClick={() => setShowDetailsModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Prontuários Médicos */}
      {showMedicalRecordsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMedicalRecordsModal(false)} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold">Meus Prontuários Médicos</h3>
              </div>
              <button
                onClick={() => setShowMedicalRecordsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {loadingMedicalRecords ? (
                <div className="text-center py-12">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Carregando prontuários...</p>
                </div>
              ) : medicalRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Nenhum prontuário encontrado</p>
                  <p className="text-sm mt-2">Seus prontuários médicos aparecerão aqui após consultas concluídas</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {medicalRecords.map((record) => (
                    <Card key={record.id} className="border-2">
                      <CardHeader className="bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <Stethoscope className="w-5 h-5 text-blue-600" />
                              <span>{record.doctor?.user?.name || 'Médico não informado'}</span>
                            </CardTitle>
                            <CardDescription>
                              {record.doctor?.specialty?.name || 'Especialidade não informada'} - CRM: {record.doctor?.crm || 'N/A'}/{record.doctor?.crm_state || 'N/A'}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-700">
                              {record.appointment ? formatDate(record.appointment.appointment_date) : 'Data não informada'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.appointment?.appointment_time || 'Horário não informado'}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-4">
                        {record.symptoms && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                              <AlertCircle className="w-4 h-4" />
                              <span>Sintomas</span>
                            </Label>
                            <p className="mt-1 text-gray-900">{record.symptoms}</p>
                          </div>
                        )}

                        {record.diagnosis && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                              <Clipboard className="w-4 h-4" />
                              <span>Diagnóstico</span>
                            </Label>
                            <p className="mt-1 text-gray-900">{record.diagnosis}</p>
                          </div>
                        )}

                        {record.treatment && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>Tratamento</span>
                            </Label>
                            <p className="mt-1 text-gray-900">{record.treatment}</p>
                          </div>
                        )}

                        {record.prescription && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                              <Pill className="w-4 h-4" />
                              <span>Prescrição</span>
                            </Label>
                            <p className="mt-1 text-gray-900 whitespace-pre-wrap">{record.prescription}</p>
                          </div>
                        )}

                        {record.observations && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>Observações</span>
                            </Label>
                            <p className="mt-1 text-gray-900">{record.observations}</p>
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
                          Prontuário criado em: {new Date(record.created_at).toLocaleString('pt-BR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <Button onClick={() => setShowMedicalRecordsModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aviso Informativo */}
      {showDoctorApplicationInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDoctorApplicationInfo(false)} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 animate-zoom-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Cadastro de Médicos</h3>
              </div>
              <button
                onClick={() => setShowDoctorApplicationInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  ℹ️ Este formulário é destinado exclusivamente para médicos
                </p>
                <p className="text-sm text-blue-700">
                  Se você é um médico e deseja oferecer seus serviços na plataforma ProMed,
                  você está no lugar certo!
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Documentos necessários:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Diploma de Medicina (PDF, JPG ou PNG)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Documento do CRM - frente e verso (PDF, JPG ou PNG)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Documento de Identidade - RG ou CNH (PDF, JPG ou PNG)</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Sua solicitação será analisada pela equipe administrativa.
                  Você receberá uma notificação por email quando houver uma resposta.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleProceedToApplication}
                className="flex-1"
              >
                Continuar com o Cadastro
              </Button>
              <Button
                onClick={() => setShowDoctorApplicationInfo(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
