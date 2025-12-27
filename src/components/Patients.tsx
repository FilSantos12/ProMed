import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Users, Edit, Eye, Power, Search, Calendar } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  rg: string;
  birth_date: string;
  gender: string;
  is_active: boolean;
}

interface Patient {
  id: number;
  user_id: number;
  emergency_contact?: string;
  emergency_phone?: string;
  blood_type?: string;
  allergies?: string;
  chronic_diseases?: string;
  medications?: string;
  health_insurance?: string;
  insurance_number?: string;
  user: User;
}

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Input separado para debounce

  // Estados para modais
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ patient: Patient; action: string } | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);

  // Estado para formulário de edição
  const [editFormData, setEditFormData] = useState({
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
    insurance_number: ''
  });

  const toast = useToast();
  const API_URL = 'http://localhost:8000/api/v1/admin';

  // Debounce para busca (aguarda 500ms após parar de digitar)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchPatients();
  }, [filterStatus, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${API_URL}/patients?`;
      if (filterStatus !== 'all') {
        url += `status=${filterStatus}&`;
      }
      if (searchTerm) {
        url += `search=${searchTerm}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPatients(response.data.data || response.data);
      setError(null);
    } catch (err: any) {
      setError('Erro ao carregar pacientes');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditFormData({
      name: patient.user.name,
      email: patient.user.email,
      phone: patient.user.phone,
      birth_date: patient.user.birth_date?.split('T')[0] || '',
      gender: patient.user.gender,
      rg: patient.user.rg,
      emergency_contact: patient.emergency_contact || '',
      emergency_phone: patient.emergency_phone || '',
      blood_type: patient.blood_type || '',
      allergies: patient.allergies || '',
      chronic_diseases: patient.chronic_diseases || '',
      medications: patient.medications || '',
      health_insurance: patient.health_insurance || '',
      insurance_number: patient.insurance_number || ''
    });
    setShowEditModal(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/patients/${selectedPatient.id}`,
        editFormData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      setShowEditModal(false);
      setSelectedPatient(null);
      fetchPatients();
      toast.success('✅ Paciente atualizado com sucesso!');
      
    } catch (err: any) {
      console.error('Erro completo:', err.response);
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const fieldNames: { [key: string]: string } = {
          'name': 'Nome',
          'email': 'Email',
          'phone': 'Telefone',
          'birth_date': 'Data de Nascimento',
          'gender': 'Gênero',
          'rg': 'RG',
          'emergency_contact': 'Contato de Emergência',
          'emergency_phone': 'Telefone de Emergência',
          'blood_type': 'Tipo Sanguíneo'
        };
        
        const errorMessages = Object.keys(errors).map(key => {
          const fieldName = fieldNames[key] || key;
          const messages = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
          return `• ${fieldName}: ${messages.join(', ')}`;
        }).join('\n');
        
        toast.error(`❌ Erro ao salvar:\n\n${errorMessages}`, 8000);
      } else {
        const errorMessage = err.response?.data?.message || 'Erro ao atualizar paciente. Tente novamente.';
        toast.error(`❌ ${errorMessage}`, 6000);
      }
    }
  };

  const handleToggleStatus = (patient: Patient) => {
    const action = patient.user.is_active ? 'desativar' : 'ativar';
    setConfirmAction({ patient, action });
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!confirmAction) return;

    const { patient, action } = confirmAction;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/patients/${patient.id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowConfirmModal(false);
      setConfirmAction(null);
      fetchPatients();
      toast.success(`✅ Paciente ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (err: any) {
      toast.error(`❌ ${err.response?.data?.message || 'Erro ao alterar status'}`, 6000);
    }
  };

  const handleViewAppointments = async (patient: Patient) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/patients/${patient.id}/appointments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedPatient(patient);
      setPatientAppointments(response.data.appointments || []);
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
    setSelectedPatient(null);
    setPatientAppointments([]);
    setConfirmAction(null);
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const filteredPatients = patients.filter(patient => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && patient.user.is_active) ||
      (filterStatus === 'inactive' && !patient.user.is_active);
    
    return matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Carregando pacientes...</p>
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
              <Users className="w-5 h-5 text-blue-600" />
              <span>Gerenciar Pacientes</span>
            </CardTitle>
            <CardDescription>
              Administre o cadastro e informações dos pacientes
            </CardDescription>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar paciente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder=" Digite nome, CPF ou email..."
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
              <TableHead>CPF</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  Nenhum paciente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.user.name}</TableCell>
                  <TableCell>{patient.user.cpf}</TableCell>
                  <TableCell>{patient.user.email}</TableCell>
                  <TableCell>{patient.user.phone}</TableCell>
                  <TableCell>
                    {patient.user.birth_date ? `${calculateAge(patient.user.birth_date)} anos` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={patient.user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {patient.user.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewPatient(patient)}
                        title="Visualizar detalhes"
                        className="hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditPatient(patient)}
                        title="Editar dados"
                        className="hover:bg-green-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewAppointments(patient)}
                        title="Ver histórico de consultas"
                        className="hover:bg-purple-50"
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleToggleStatus(patient)}
                        title={patient.user.is_active ? 'Desativar paciente' : 'Ativar paciente'}
                        className={patient.user.is_active ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}
                      >
                        <Power className="w-4 h-4" />
                        <span className="ml-1 text-xs">
                          {patient.user.is_active ? 'Desativar' : 'Ativar'}
                        </span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Modal de Visualização */}
      {showViewModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals} />
          
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Detalhes do Paciente</h3>
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
                    <p className="text-gray-900">{selectedPatient.user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedPatient.user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <p className="text-gray-900">{selectedPatient.user.cpf}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RG</label>
                    <p className="text-gray-900">{selectedPatient.user.rg || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <p className="text-gray-900">{selectedPatient.user.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <p className="text-gray-900">
                      {selectedPatient.user.birth_date ? formatDate(selectedPatient.user.birth_date) : '-'}
                      {selectedPatient.user.birth_date && (
                        <span className="text-sm text-gray-600 ml-2">
                          ({calculateAge(selectedPatient.user.birth_date)} anos)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gênero</label>
                    <p className="text-gray-900">{selectedPatient.user.gender || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <Badge className={selectedPatient.user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {selectedPatient.user.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contato de Emergência */}
              {(selectedPatient.emergency_contact || selectedPatient.emergency_phone) && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-3">🚨 Contato de Emergência</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPatient.emergency_contact && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <p className="text-gray-900">{selectedPatient.emergency_contact}</p>
                      </div>
                    )}
                    {selectedPatient.emergency_phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone</label>
                        <p className="text-gray-900">{selectedPatient.emergency_phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informações Médicas */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">🩺 Informações Médicas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo Sanguíneo</label>
                    <p className="text-gray-900">{selectedPatient.blood_type || '-'}</p>
                  </div>
                  {selectedPatient.allergies && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Alergias</label>
                      <p className="text-gray-900">{selectedPatient.allergies}</p>
                    </div>
                  )}
                  {selectedPatient.chronic_diseases && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Doenças Crônicas</label>
                      <p className="text-gray-900">{selectedPatient.chronic_diseases}</p>
                    </div>
                  )}
                  {selectedPatient.medications && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Medicamentos em Uso</label>
                      <p className="text-gray-900">{selectedPatient.medications}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Plano de Saúde */}
              {(selectedPatient.health_insurance || selectedPatient.insurance_number) && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-3">💳 Plano de Saúde</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPatient.health_insurance && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Operadora</label>
                        <p className="text-gray-900">{selectedPatient.health_insurance}</p>
                      </div>
                    )}
                    {selectedPatient.insurance_number && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Número da Carteirinha</label>
                        <p className="text-gray-900">{selectedPatient.insurance_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t bg-gray-50">
              <Button onClick={closeModals} className="shadow-lg">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals} />
          
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Editar Paciente</h3>
              </div>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <form onSubmit={handleUpdatePatient}>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">RG</label>
                      <input
                        type="text"
                        value={editFormData.rg}
                        onChange={(e) => setEditFormData({ ...editFormData, rg: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                      <input
                        type="date"
                        value={editFormData.birth_date}
                        onChange={(e) => setEditFormData({ ...editFormData, birth_date: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gênero</label>
                      <select
                        title="Selecione o gênero"
                        value={editFormData.gender}
                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contato de Emergência */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-4">🚨 Contato de Emergência</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                      <input
                        type="text"
                        value={editFormData.emergency_contact}
                        onChange={(e) => setEditFormData({ ...editFormData, emergency_contact: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                      <input
                        type="text"
                        value={editFormData.emergency_phone}
                        onChange={(e) => setEditFormData({ ...editFormData, emergency_phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Informações Médicas */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-4">🩺 Informações Médicas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Sanguíneo</label>
                      <select
                        title="Selecione o tipo sanguíneo"
                        value={editFormData.blood_type}
                        onChange={(e) => setEditFormData({ ...editFormData, blood_type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alergias</label>
                      <textarea
                        value={editFormData.allergies}
                        onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={2}
                        placeholder="Descreva as alergias conhecidas..."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Doenças Crônicas</label>
                      <textarea
                        value={editFormData.chronic_diseases}
                        onChange={(e) => setEditFormData({ ...editFormData, chronic_diseases: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={2}
                        placeholder="Descreva as doenças crônicas..."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medicamentos em Uso</label>
                      <textarea
                        value={editFormData.medications}
                        onChange={(e) => setEditFormData({ ...editFormData, medications: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={2}
                        placeholder="Liste os medicamentos em uso..."
                      />
                    </div>
                  </div>
                </div>

                {/* Plano de Saúde */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-4">💳 Plano de Saúde</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Operadora</label>
                      <input
                        type="text"
                        value={editFormData.health_insurance}
                        onChange={(e) => setEditFormData({ ...editFormData, health_insurance: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número da Carteirinha</label>
                      <input
                        type="text"
                        value={editFormData.insurance_number}
                        onChange={(e) => setEditFormData({ ...editFormData, insurance_number: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      {showAppointmentsModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals} />
          
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Histórico de Consultas - {selectedPatient.user.name}
                </h3>
              </div>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {patientAppointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma consulta encontrada</p>
              ) : (
                <div className="space-y-4">
                  {patientAppointments.map((appointment) => (
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
                          <label className="block text-sm font-medium text-gray-700">Médico</label>
                          <p className="text-gray-900">{appointment.doctor?.user?.name || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Especialidade</label>
                          <p className="text-gray-900">{appointment.doctor?.specialty?.name || '-'}</p>
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
              <Button onClick={closeModals} className="shadow-lg">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
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
                  confirmAction.action === 'ativar' 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  <Power className={`w-5 h-5 ${
                    confirmAction.action === 'ativar' 
                      ? 'text-green-600' 
                      : 'text-red-600'
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
                Deseja realmente <strong>{confirmAction.action}</strong> o paciente:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900">{confirmAction.patient.user.name}</p>
                <p className="text-sm text-gray-600">{confirmAction.patient.user.email}</p>
                <p className="text-sm text-gray-600">CPF: {confirmAction.patient.user.cpf}</p>
              </div>

              {confirmAction.action === 'desativar' && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Atenção:</strong> O paciente não poderá mais fazer login no sistema até ser reativado.
                  </p>
                </div>
              )}

              {confirmAction.action === 'ativar' && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✅ O paciente poderá fazer login e agendar consultas novamente.
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
                    {confirmAction.action === 'ativar' ? 'Ativar' : 'Desativar'} Paciente
                </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Patients;