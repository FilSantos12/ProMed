import React, { useState, useEffect, ReactElement } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import {
  Stethoscope, Edit, Eye, Power, Search, Calendar, CheckCircle, XCircle,
  FileText, Download, GraduationCap, Building2, CreditCard, Camera, Award, File,
  Heart, Brain, Bone, Baby, Activity, Eye as EyeIcon, Ear, Users, Pill,
  Syringe, TestTube, Microscope, Thermometer, UserCircle, UserCheck,
  Circle, Square, Triangle, Star, AlertCircle, Info, Zap,
  Sparkles, Sun, Moon, Cloud, Droplet, Shield, Cross,
  Hospital, Ambulance, Bandage, FileHeart, Clipboard, HeartPulse,
  Radar, Target, LucideIcon
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

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


interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  is_active: boolean;
}

interface Specialty {
  id: number;
  name: string;
  icon?: string;
}

interface Doctor {
  id: number;
  user_id: number;
  specialty_id: number;
  crm: string;
  crm_state: string;
  bio?: string;
  consultation_price?: number;
  consultation_duration?: number;
  formation?: string[];
  years_experience?: number;
  status?: string;
  rejection_notes?: string;
  rejected_at?: string; 
  user: User;
  specialty: Specialty;
}

interface DoctorsProps {
  initialFilterStatus?: string;
}

const Doctors: React.FC<DoctorsProps> = ({ initialFilterStatus }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus || 'all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  //const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showApproveMedicalModal, setShowApproveMedicalModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ doctor: Doctor; action: string } | null>(null);
  //const [approvalAction, setApprovalAction] = useState<{ doctor: Doctor; action: 'approve' | 'reject' } | null>(null);
  const [doctorAppointments, setDoctorAppointments] = useState<any[]>([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showRejectDocumentModal, setShowRejectDocumentModal] = useState(false);
  const [doctorDocuments, setDoctorDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectMedicalModal, setShowRejectMedicalModal] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    crm: '',
    crm_state: '',
    specialty_id: '',
    bio: '',
    consultation_price: '',
    consultation_duration: '',
    years_experience: ''
  });

  const toast = useToast();
  const API_URL = 'http://localhost:8000/api/v1/admin';

  useEffect(() => {
  if (initialFilterStatus) {
    setFilterStatus(initialFilterStatus);
  }
}, [initialFilterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, [filterStatus, filterSpecialty, searchTerm]);

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/specialties');
      setSpecialties(response.data);
    } catch (err) {
      console.error('Erro ao carregar especialidades:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let url = `${API_URL}/doctors?`;
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;
      if (filterSpecialty !== 'all') url += `specialty_id=${filterSpecialty}&`;
      if (searchTerm) url += `search=${searchTerm}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDoctors(response.data.data || response.data);
      setError(null);
    } catch (err: any) {
      setError('Erro ao carregar médicos');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setEditFormData({
      name: doctor.user.name,
      email: doctor.user.email,
      phone: doctor.user.phone,
      crm: doctor.crm,
      crm_state: doctor.crm_state,
      specialty_id: doctor.specialty_id.toString(),
      bio: doctor.bio || '',
      consultation_price: doctor.consultation_price?.toString() || '',
      consultation_duration: doctor.consultation_duration?.toString() || '',
      years_experience: doctor.years_experience?.toString() || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        ...editFormData,
        specialty_id: parseInt(editFormData.specialty_id),
        consultation_price: editFormData.consultation_price ? parseFloat(editFormData.consultation_price) : null,
        consultation_duration: editFormData.consultation_duration ? parseInt(editFormData.consultation_duration) : null,
        years_experience: editFormData.years_experience ? parseInt(editFormData.years_experience) : null
      };

      await axios.put(`${API_URL}/doctors/${selectedDoctor.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      setShowEditModal(false);
      setSelectedDoctor(null);
      fetchDoctors();
      toast.success('✅ Médico atualizado com sucesso!');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const fieldNames: { [key: string]: string } = {
          'name': 'Nome', 'email': 'Email', 'phone': 'Telefone',
          'crm': 'CRM', 'crm_state': 'Estado do CRM', 'specialty_id': 'Especialidade'
        };
        const errorMessages = Object.keys(errors).map(key => {
          const fieldName = fieldNames[key] || key;
          const messages = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
          return `• ${fieldName}: ${messages.join(', ')}`;
        }).join('\n');
        toast.error(`❌ Erro ao salvar:\n\n${errorMessages}`, 8000);
      } else {
        toast.error(`❌ ${err.response?.data?.message || 'Erro ao atualizar médico.'}`, 6000);
      }
    }
  };

  const handleToggleStatus = (doctor: Doctor) => {
    setConfirmAction({ doctor, action: doctor.user.is_active ? 'desativar' : 'ativar' });
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!confirmAction) return;
    const { doctor, action } = confirmAction;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/doctors/${doctor.id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowConfirmModal(false);
      setConfirmAction(null);
      fetchDoctors();
      toast.success(`✅ Médico ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (err: any) {
      toast.error(`❌ ${err.response?.data?.message || 'Erro ao alterar status'}`, 6000);
    }
  };


  const handleApprovalAction = (doctor: Doctor, action: 'approve' | 'reject') => {
    setSelectedDoctor(doctor);

    if (action === 'reject') {
      // Abrir modal de rejeição com justificativa
      setRejectNotes('');
      setShowRejectMedicalModal(true);
    } else {
      // Abrir modal de aprovação (SEM window.confirm)
      setShowApproveMedicalModal(true);
    }
  };

    const confirmApproveMedical = async (doctor: Doctor) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(
        `${API_URL}/doctors/${doctor.id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
        );

        setShowApproveMedicalModal(false);
        setSelectedDoctor(null);
        fetchDoctors();
        toast.success('✅ Médico aprovado com sucesso!');
    } catch (err: any) {
        toast.error(`❌ ${err.response?.data?.message || 'Erro ao aprovar médico'}`, 6000);
    }
    };

  const confirmRejectMedical = async () => {
  if (!rejectNotes.trim()) {
    toast.error('❌ Informe o motivo da rejeição', 6000);
    return;
  }

  if (!selectedDoctor) return;

  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `${API_URL}/doctors/${selectedDoctor.id}/reject`,
      { notes: rejectNotes },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setShowRejectMedicalModal(false);
    setSelectedDoctor(null);
    setRejectNotes('');
    fetchDoctors();
    toast.success('✅ Médico rejeitado com sucesso!');
  } catch (err: any) {
    toast.error(`❌ ${err.response?.data?.message || 'Erro ao rejeitar médico'}`, 6000);
  }
};

  const handleViewAppointments = async (doctor: Doctor) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/doctors/${doctor.id}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedDoctor(doctor);
      setDoctorAppointments(response.data.appointments || []);
      setShowAppointmentsModal(true);
    } catch (err: any) {
      toast.error('❌ Erro ao carregar histórico de consultas', 6000);
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowAppointmentsModal(false);
    setShowConfirmModal(false);
    //setShowApprovalModal(false);
    setShowApproveMedicalModal(false);
    setShowDocumentsModal(false); 
    setShowRejectDocumentModal(false);
    setShowRejectMedicalModal(false); 
    setSelectedDoctor(null);
    setDoctorAppointments([]);
    setDoctorDocuments([]); 
    setSelectedDocument(null); 
    setRejectNotes('');
    setRejectNotes(''); 
    setConfirmAction(null);
    //setApprovalAction(null);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (doctor: Doctor) => {
    if (doctor.status === 'pending') return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    if (doctor.status === 'rejected') return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
    if (!doctor.user.is_active) return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
    return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && doctor.user.is_active && doctor.status === 'approved') ||
      (filterStatus === 'inactive' && !doctor.user.is_active) ||
      (filterStatus === 'pending' && doctor.status === 'pending') ||
      (filterStatus === 'rejected' && doctor.status === 'rejected');
    const matchesSpecialty = filterSpecialty === 'all' || doctor.specialty_id.toString() === filterSpecialty;
    return matchesStatus && matchesSpecialty;
  });

  const handleViewDocuments = async (doctor: Doctor) => {
  try {
    setSelectedDoctor(doctor);
    setShowDocumentsModal(true);
    setLoadingDocuments(true);

    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/doctors/${doctor.id}/documents`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setDoctorDocuments(response.data.documents || []);
  } catch (err: any) {
    toast.error('❌ Erro ao carregar documentos', 6000);
    console.error(err);
  } finally {
    setLoadingDocuments(false);
  }
};

const handleApproveDocument = async (document: any) => {
  if (!window.confirm('Deseja aprovar este documento?')) return;

  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `${API_URL}/doctors/${selectedDoctor?.id}/documents/${document.id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('✅ Documento aprovado com sucesso!');
    
    // Recarregar documentos
    if (selectedDoctor) {
      handleViewDocuments(selectedDoctor);
    }
  } catch (err: any) {
    toast.error(`❌ ${err.response?.data?.message || 'Erro ao aprovar documento'}`, 6000);
  }
};

const handleRejectDocument = (document: any) => {
  setSelectedDocument(document);
  setRejectNotes('');
  setShowRejectDocumentModal(true);
};

const confirmRejectDocument = async () => {
  if (!rejectNotes.trim()) {
    toast.error('❌ Informe o motivo da rejeição', 6000);
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `${API_URL}/doctors/${selectedDoctor?.id}/documents/${selectedDocument.id}/reject`,
      { notes: rejectNotes },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('✅ Documento rejeitado');
    setShowRejectDocumentModal(false);
    setSelectedDocument(null);
    setRejectNotes('');
    
    // Recarregar documentos
    if (selectedDoctor) {
      handleViewDocuments(selectedDoctor);
    }
  } catch (err: any) {
    toast.error(`❌ ${err.response?.data?.message || 'Erro ao rejeitar documento'}`, 6000);
  }
};

// Função antiga (manter para compatibilidade)
const getDocumentTypeName = (type: string) => {
  const types: { [key: string]: string } = {
    'diploma': 'Diploma',
    'crm_document': 'Documento CRM',
    'rg_document': 'RG',
    'photo': 'Foto',
    'certificate': 'Certificado',
    'other': 'Outro'
  };
  return types[type] || type;
};

// Função nova com ícones
const getDocumentIcon = (type: string) => {
  const icons: { [key: string]: { icon: React.ReactElement; name: string } } = {
    'diploma': { 
      icon: <GraduationCap className="w-4 h-4 text-blue-600" />, 
      name: 'Diploma' 
    },
    'crm_document': { 
      icon: <Building2 className="w-4 h-4 text-green-600" />, 
      name: 'Documento CRM' 
    },
    'rg_document': { 
      icon: <CreditCard className="w-4 h-4 text-purple-600" />, 
      name: 'RG' 
    },
    'photo': { 
      icon: <Camera className="w-4 h-4 text-pink-600" />, 
      name: 'Foto' 
    },
    'certificate': { 
      icon: <Award className="w-4 h-4 text-orange-600" />, 
      name: 'Certificado' 
    },
    'other': { 
      icon: <File className="w-4 h-4 text-gray-600" />, 
      name: 'Outro' 
    }
  };
  
  return icons[type] || icons['other'];
};

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Carregando médicos...</p>
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <span>Gerenciar Médicos</span>
            </CardTitle>
            <CardDescription>
              Administre o cadastro, aprovações e informações dos médicos
            </CardDescription>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar médico
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder=" Digite nome, CRM ou email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidade
            </label>
            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {specialties.map(spec => {
                  const IconComponent = ICON_MAP[spec.icon || 'Stethoscope'] || Stethoscope;
                  return (
                    <SelectItem key={spec.id} value={spec.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded">
                          <IconComponent className="w-4 h-4 text-gray-700" />
                        </div>
                        <span>{spec.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CRM</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  Nenhum médico encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors.map((doctor) => {
                const IconComponent = ICON_MAP[doctor.specialty?.icon || 'Stethoscope'] || Stethoscope;
                return (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.user.name}</TableCell>
                    <TableCell>{doctor.crm} - {doctor.crm_state}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                          <IconComponent className="w-4 h-4 text-gray-700" />
                        </div>
                        <span>{doctor.specialty?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{doctor.user.email}</TableCell>
                    <TableCell>{doctor.user.phone}</TableCell>
                    <TableCell>{getStatusBadge(doctor)}</TableCell>
                    <TableCell>
                        <div className="flex space-x-2">
                            <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDoctor(doctor)}
                            title="Visualizar detalhes"
                            className="hover:bg-blue-50"
                            >
                            <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditDoctor(doctor)}
                            title="Editar dados"
                            className="hover:bg-green-50"
                            >
                            <Edit className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewAppointments(doctor)}
                            title="Ver histórico de consultas"
                            className="hover:bg-purple-50"
                            >
                            <Calendar className="w-4 h-4" />
                            </Button>

                            <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDocuments(doctor)}
                            title="Ver documentos"
                            className="hover:bg-orange-50"
                            >
                            <FileText className="w-4 h-4" />
                            </Button>

                            {/* Botões de Aprovação/Rejeição - APENAS para pendentes */}
                            {doctor.status === 'pending' && (
                            <>
                                <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApprovalAction(doctor, 'approve')}
                                title="Aprovar médico"
                                className="hover:bg-green-50 text-green-600"
                                >
                                <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApprovalAction(doctor, 'reject')}
                                title="Rejeitar médico"
                                className="hover:bg-red-50 text-red-600"
                                >
                                <XCircle className="w-4 h-4" />
                                </Button>
                            </>
                            )}

                            {/* Botão Ativar/Desativar - APENAS para aprovados */}
                            {doctor.status === 'approved' && (
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleToggleStatus(doctor)}
                                title={doctor.user.is_active ? 'Desativar médico' : 'Ativar médico'}
                                className={doctor.user.is_active 
                                ? 'hover:bg-red-50 text-red-600' 
                                : 'hover:bg-green-50 text-green-600'}
                            >
                                <Power className="w-4 h-4" />
                                <span className="ml-1 text-xs">
                                {doctor.user.is_active ? 'Desativar' : 'Ativar'}
                                </span>
                            </Button>
                            )}
                        </div>
                        </TableCell>

                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Modal de Visualização */}
      {showViewModal && selectedDoctor && (() => {
        const IconComponent = ICON_MAP[selectedDoctor.specialty?.icon || 'Stethoscope'] || Stethoscope;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals} />

            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Detalhes do Médico</h3>
              </div>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {/* Dados Pessoais */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">👤 Dados Pessoais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-gray-900">{selectedDoctor.user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedDoctor.user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <p className="text-gray-900">{selectedDoctor.user.cpf}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <p className="text-gray-900">{selectedDoctor.user.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    {getStatusBadge(selectedDoctor)}
                  </div>
                </div>
              </div>

              {/* Dados Profissionais */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">🩺 Dados Profissionais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CRM</label>
                    <p className="text-gray-900">{selectedDoctor.crm}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado CRM</label>
                    <p className="text-gray-900">{selectedDoctor.crm_state}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Especialidade</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-gray-700" />
                      </div>
                      <span className="text-gray-900">{selectedDoctor.specialty?.name}</span>
                    </div>
                  </div>
                  {selectedDoctor.years_experience && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Anos de Experiência</label>
                      <p className="text-gray-900">{selectedDoctor.years_experience} anos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-3">💼 Informações Adicionais</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedDoctor.consultation_price && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preço Consulta</label>
                      <p className="text-gray-900">R$ {selectedDoctor.consultation_price}</p>
                    </div>
                  )}
                  {selectedDoctor.consultation_duration && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duração Consulta</label>
                      <p className="text-gray-900">{selectedDoctor.consultation_duration} minutos</p>
                    </div>
                  )}
                  {selectedDoctor.bio && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Biografia</label>
                      <p className="text-gray-900">{selectedDoctor.bio}</p>
                    </div>
                  )}
                </div>
              </div>
              {selectedDoctor.status === 'rejected' && selectedDoctor.rejection_notes && (
                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                    <h4 className="font-semibold text-red-900 mb-3">❌ Motivo da Rejeição</h4>
                    <div className="bg-white p-4 rounded-lg border border-red-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedDoctor.rejection_notes}</p>
                    </div>
                    {selectedDoctor.rejected_at && (
                    <p className="text-sm text-red-700 mt-2">
                        📅 Rejeitado em: {formatDate(selectedDoctor.rejected_at)}
                    </p>
                    )}
                </div>
                )}
            </div>

            <div className="flex justify-end p-6 border-t bg-gray-50">
              <Button onClick={closeModals} className="shadow-lg">Fechar</Button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Modal de Edição */}
      {showEditModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals} />
          
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Editar Médico</h3>
              </div>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form onSubmit={handleUpdateDoctor}>
              <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                {/* Dados Pessoais */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-4">👤 Dados Pessoais</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Dados Profissionais */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-4">🩺 Dados Profissionais</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CRM *</label>
                      <input
                        type="text"
                        value={editFormData.crm}
                        onChange={(e) => setEditFormData({ ...editFormData, crm: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado CRM *</label>
                      <input
                        type="text"
                        value={editFormData.crm_state}
                        onChange={(e) => setEditFormData({ ...editFormData, crm_state: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={2}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade *</label>
                      <select
                        title="Selecione a especialidade"
                        value={editFormData.specialty_id}
                        onChange={(e) => setEditFormData({ ...editFormData, specialty_id: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Selecione</option>
                        {specialties.map(spec => (
                          <option key={spec.id} value={spec.id}>
                            {spec.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Anos de Experiência</label>
                      <input
                        type="number"
                        value={editFormData.years_experience}
                        onChange={(e) => setEditFormData({ ...editFormData, years_experience: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-4">💼 Informações Adicionais</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preço Consulta (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.consultation_price}
                        onChange={(e) => setEditFormData({ ...editFormData, consultation_price: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duração Consulta (min)</label>
                      <input
                        type="number"
                        value={editFormData.consultation_duration}
                        onChange={(e) => setEditFormData({ ...editFormData, consultation_duration: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="15"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Biografia</label>
                      <textarea
                        value={editFormData.bio}
                        onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={3}
                        placeholder="Biografia profissional do médico..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <Button type="button" variant="outline" onClick={closeModals} className="shadow">
                  Cancelar
                </Button>
                <Button type="submit" className="shadow-lg">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Consultas */}
      {showAppointmentsModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals} />
          
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Histórico de Consultas - {selectedDoctor.user.name}
                </h3>
              </div>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {doctorAppointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma consulta encontrada</p>
              ) : (
                <div className="space-y-4">
                  {doctorAppointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Data</label>
                          <p className="text-gray-900">{formatDate(appointment.appointment_date)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Horário</label>
                          <p className="text-gray-900">{appointment.appointment_time}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Paciente</label>
                          <p className="text-gray-900">{appointment.patient?.user?.name || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <Badge className={
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {appointment.status === 'scheduled' ? 'Agendado' :
                             appointment.status === 'confirmed' ? 'Confirmado' :
                             appointment.status === 'completed' ? 'Concluído' :
                             'Cancelado'}
                          </Badge>
                        </div>
                      </div>
                      {appointment.patient_notes && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700">Observações</label>
                          <p className="text-sm text-gray-600">{appointment.patient_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t bg-gray-50">
              <Button onClick={closeModals} className="shadow-lg">Fechar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação (Ativar/Desativar) */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className={`flex items-center justify-between p-6 border-b ${
              confirmAction.action === 'ativar' 
                ? 'bg-gradient-to-r from-green-50 to-white' 
                : 'bg-gradient-to-r from-red-50 to-white'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  confirmAction.action === 'ativar' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Power className={`w-5 h-5 ${
                    confirmAction.action === 'ativar' ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Confirmar {confirmAction.action === 'ativar' ? 'Ativação' : 'Desativação'}
                </h3>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Deseja realmente <strong>{confirmAction.action}</strong> o médico:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900">{confirmAction.doctor.user.name}</p>
                <p className="text-sm text-gray-600">{confirmAction.doctor.user.email}</p>
                <p className="text-sm text-gray-600">CRM: {confirmAction.doctor.crm}-{confirmAction.doctor.crm_state}</p>
              </div>

              {confirmAction.action === 'desativar' && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Atenção:</strong> O médico não poderá mais fazer login no sistema até ser reativado.
                  </p>
                </div>
              )}

              {confirmAction.action === 'ativar' && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✅ O médico poderá fazer login e gerenciar consultas novamente.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowConfirmModal(false)}
                className="shadow"
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={confirmToggleStatus}
                className={`shadow-lg text-black ${
                  confirmAction.action === 'ativar' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction.action === 'ativar' ? 'Ativar' : 'Desativar'} Médico
              </Button>
            </div>
          </div>
        </div>
      )}

      

      {/* Modal de Rejeição de Médico */}
        {showRejectMedicalModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectMedicalModal(false)} />
            
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-red-50 to-white">
                <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Rejeitar Médico</h3>
                </div>
                <button 
                onClick={() => setShowRejectMedicalModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                <span className="text-2xl">×</span>
                </button>
            </div>

            <div className="p-6">
                <p className="text-gray-700 mb-2">
                Rejeitar o cadastro do médico: <strong>{selectedDoctor.user.name}</strong>
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <p className="text-sm text-gray-600">{selectedDoctor.user.email}</p>
                <p className="text-sm text-gray-600">CRM: {selectedDoctor.crm}-{selectedDoctor.crm_state}</p>
                <p className="text-sm text-gray-600">Especialidade: {selectedDoctor.specialty.name}</p>
                </div>

                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo da rejeição *
                </label>
                <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    rows={4}
                    placeholder="Explique o motivo da rejeição do cadastro (obrigatório)..."
                    required
                />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                    ❌ <strong>Atenção:</strong> O médico será notificado da rejeição e não poderá acessar o sistema.
                </p>
                </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowRejectMedicalModal(false)}
                className="shadow"
                >
                Cancelar
                </Button>
                <Button 
                type="button"
                onClick={confirmRejectMedical}
                disabled={!rejectNotes.trim()}
                className="shadow-lg bg-red-600 hover:bg-red-700 text-black"
                >
                Rejeitar Médico
                </Button>
            </div>
            </div>
        </div>
        )}

        {/* Modal de Aprovação de Médico */}
            {showApproveMedicalModal && selectedDoctor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowApproveMedicalModal(false)} />
                
                <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-white">
                    <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Aprovar Médico</h3>
                    </div>
                    <button 
                    onClick={() => setShowApproveMedicalModal(false)} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                    <span className="text-2xl">×</span>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-700 mb-2">
                    Confirmar a aprovação do cadastro do médico:
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                    <p className="font-semibold text-gray-900">{selectedDoctor.user.name}</p>
                    <p className="text-sm text-gray-600">{selectedDoctor.user.email}</p>
                    <p className="text-sm text-gray-600">CRM: {selectedDoctor.crm}-{selectedDoctor.crm_state}</p>
                    <p className="text-sm text-gray-600">Especialidade: {selectedDoctor.specialty.name}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-2">
                        ✅ <strong>Ao aprovar, o médico poderá:</strong>
                    </p>
                    <ul className="text-sm text-green-800 space-y-1 ml-6 list-disc">
                        <li>Fazer login no sistema</li>
                        <li>Gerenciar suas consultas</li>
                        <li>Atualizar seu perfil</li>
                        <li>Visualizar seus horários</li>
                    </ul>
                    </div>

                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Atenção:</strong> Verifique se todos os documentos foram aprovados antes de aprovar o cadastro.
                    </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                    <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowApproveMedicalModal(false)}
                    className="shadow"
                    >
                    Cancelar
                    </Button>
                    <Button 
                    type="button"
                    onClick={() => selectedDoctor && confirmApproveMedical(selectedDoctor)}
                    className="shadow-lg bg-green-600 hover:bg-green-700 text-black"
                    >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar Médico
                    </Button>
                </div>
                </div>
            </div>
            )}
      
      {/* Modal de Documentos */}
      {showDocumentsModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDocumentsModal(false)} />
          
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-5xl">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Documentos do Médico</h3>
                  <p className="text-sm text-gray-600">{selectedDoctor.user.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDocumentsModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {loadingDocuments ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Carregando documentos...</p>
                </div>
              ) : doctorDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum documento enviado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctorDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      className={`border rounded-lg p-4 ${
                        doc.status === 'approved' ? 'border-green-200 bg-green-50' :
                        doc.status === 'rejected' ? 'border-red-200 bg-red-50' :
                        'border-gray-200 bg-white'
                      }`}
                    >
                      {/* Cabeçalho do documento */}
                        <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            {getDocumentIcon(doc.document_type).icon}
                            <span className="font-semibold text-gray-900">
                            {getDocumentIcon(doc.document_type).name}
                            </span>
                        </div>
                        <Badge className={
                            doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }>
                            {doc.status === 'pending' ? 'Pendente' :
                            doc.status === 'approved' ? 'Aprovado' :
                            'Rejeitado'}
                        </Badge>
                        </div>

                     {/* Card clicável (sem preview) */}
                     <div
                        className="mb-3 w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all"
                        onClick={() => window.open(`http://localhost:8000/api/v1/public/doctors/${selectedDoctor.id}/documents/${doc.id}/view/${localStorage.getItem('token')}`, '_blank')}
                        >
                        <div className="text-center">
                            {doc.mime_type?.startsWith('image/') ? (
                            <>
                                <div className="flex justify-center mb-2">
                                {getDocumentIcon(doc.document_type).icon}
                                </div>
                                <p className="text-sm font-semibold text-gray-700">
                                {getDocumentIcon(doc.document_type).name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Clique para visualizar</p>
                            </>
                            ) : doc.mime_type === 'application/pdf' ? (
                            <>
                                <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
                                <p className="text-sm font-semibold text-gray-700">
                                {getDocumentIcon(doc.document_type).name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Clique para ver PDF</p>
                            </>
                            ) : (
                            <>
                                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">Arquivo</p>
                                <p className="text-xs text-gray-400 mt-1">Clique para visualizar</p>
                            </>
                            )}
                        </div>
                    </div>

                      {/* Informações do arquivo */}
                      <div className="text-sm text-gray-600 mb-3">
                        <p className="truncate" title={doc.file_name}>📄 {doc.file_name}</p>
                        <p>📦 {(doc.file_size / 1024).toFixed(2)} KB</p>
                        <p>📅 Enviado: {formatDate(doc.created_at)}</p>
                        {doc.verified_at && (
                          <p>✅ Verificado: {formatDate(doc.verified_at)}</p>
                        )}
                      </div>

                      {/* Notas de rejeição */}
                      {doc.status === 'rejected' && doc.notes && (
                        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                          <p className="text-xs font-semibold text-red-900">Motivo da rejeição:</p>
                          <p className="text-xs text-red-800">{doc.notes}</p>
                        </div>
                      )}

                      {/* Botões de ação */}
                      <div className="flex space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`http://localhost:8000/api/v1/public/doctors/${selectedDoctor.id}/documents/${doc.id}/download/${localStorage.getItem('token')}`, '_blank')}
                            className="flex-1"
                            >
                            <Download className="w-4 h-4 mr-1" />
                            Baixar
                        </Button>

                        {doc.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveDocument(doc)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-black"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRejectDocument(doc)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-black"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t bg-gray-50">
              <Button onClick={() => setShowDocumentsModal(false)} className="shadow-lg">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

    </Card>
  );
};

export default Doctors;