import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Stethoscope, Edit, Trash2, Plus, Search, Power,
  Heart, Brain, Eye, Ear, Bone, Activity, Pill, Syringe, TestTube,
  Microscope, Thermometer, Baby, User, Users, UserCircle, UserCheck,
  Circle, Square, Triangle, Star, AlertCircle, CheckCircle, XCircle,
  Info, Zap, Sparkles, Sun, Moon, Cloud, Droplet, Shield, Cross,
  Hospital, Ambulance, Bandage, FileHeart, Clipboard, HeartPulse,
  Radar, Target, LucideIcon
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import IconPicker from './IconPicker';

// Mapa de ícones disponíveis
const ICON_MAP: Record<string, LucideIcon> = {
  Heart, Brain, Eye, Ear, Bone, Activity, Stethoscope,
  Pill, Syringe, TestTube, Microscope, Thermometer,
  Baby, User, Users, UserCircle, UserCheck,
  Plus, Circle, Square, Triangle, Star,
  AlertCircle, CheckCircle, XCircle, Info, Zap,
  Sparkles, Sun, Moon, Cloud, Droplet,
  Shield, Cross, Hospital, Ambulance, Bandage,
  FileHeart, Clipboard, HeartPulse, Radar, Target
};

interface Specialty {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  doctors_count?: number;
  created_at: string;
  updated_at: string;
}

const Specialties: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ specialty: Specialty; action: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    is_active: true
  });

  const toast = useToast();
  const API_URL = 'http://localhost:8000/api/v1/admin';

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/specialties`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSpecialties(response.data);
      setError(null);
    } catch (err: any) {
      setError('Erro ao carregar especialidades');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'Stethoscope',
      is_active: true
    });
    setShowCreateModal(true);
  };

  const handleEdit = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description || '',
      icon: specialty.icon || '',
      is_active: specialty.is_active
    });
    setShowEditModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/specialties`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowCreateModal(false);
      fetchSpecialties();
      toast.success('✅ Especialidade criada com sucesso!');
    } catch (err: any) {
      toast.error(`❌ ${err.response?.data?.message || 'Erro ao criar especialidade'}`, 6000);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecialty) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/specialties/${selectedSpecialty.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowEditModal(false);
      setSelectedSpecialty(null);
      fetchSpecialties();
      toast.success('✅ Especialidade atualizada com sucesso!');
    } catch (err: any) {
      toast.error(`❌ ${err.response?.data?.message || 'Erro ao atualizar especialidade'}`, 6000);
    }
  };

  const handleToggleStatus = (specialty: Specialty) => {
    setConfirmAction({
      specialty,
      action: specialty.is_active ? 'desativar' : 'ativar'
    });
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!confirmAction) return;
    const { specialty } = confirmAction;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/specialties/${specialty.id}`,
        { is_active: !specialty.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowConfirmModal(false);
      setConfirmAction(null);
      fetchSpecialties();
      toast.success(`✅ Especialidade ${specialty.is_active ? 'desativada' : 'ativada'} com sucesso!`);
    } catch (err: any) {
      toast.error(`❌ ${err.response?.data?.message || 'Erro ao alterar status'}`, 6000);
    }
  };

  const handleDelete = async (specialty: Specialty) => {
    if (!window.confirm(`Deseja realmente deletar a especialidade "${specialty.name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/specialties/${specialty.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchSpecialties();
      toast.success('✅ Especialidade deletada com sucesso!');
    } catch (err: any) {
      toast.error(`❌ ${err.response?.data?.message || 'Erro ao deletar especialidade'}`, 6000);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowConfirmModal(false);
    setSelectedSpecialty(null);
    setConfirmAction(null);
  };

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    specialty.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Carregando especialidades...</p>
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
              <span>Gerenciar Especialidades</span>
            </CardTitle>
            <CardDescription>
              Cadastre e gerencie as especialidades médicas disponíveis na plataforma
            </CardDescription>
          </div>
          <Button onClick={handleCreate} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nova Especialidade</span>
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar especialidade
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Digite o nome da especialidade..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ícone</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Médicos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSpecialties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  Nenhuma especialidade encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredSpecialties.map((specialty) => {
                const IconComponent = ICON_MAP[specialty.icon || 'Stethoscope'] || Stethoscope;
                return (
                  <TableRow key={specialty.id}>
                    <TableCell>
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-gray-700" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{specialty.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {specialty.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {specialty.doctors_count || 0} médico(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={specialty.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {specialty.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(specialty)}
                        title="Editar especialidade"
                        className="hover:bg-green-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(specialty)}
                        title={specialty.is_active ? 'Desativar' : 'Ativar'}
                        className={specialty.is_active ? 'hover:bg-red-50' : 'hover:bg-green-50'}
                      >
                        <Power className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(specialty)}
                        title="Deletar especialidade"
                        className="hover:bg-red-50 text-red-600"
                        disabled={!!specialty.doctors_count}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals} />

          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Nova Especialidade</h3>
              </div>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmitCreate}>
              <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                <div>
                  <Label htmlFor="name">Nome da Especialidade *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Cardiologia"
                    required
                  />
                </div>

                <IconPicker
                  value={formData.icon}
                  onChange={(icon) => setFormData({ ...formData, icon })}
                  label="Ícone da Especialidade"
                />

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Breve descrição da especialidade..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="is_active">Ativo</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
                <Button type="button" variant="outline" onClick={closeModals}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Especialidade
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && selectedSpecialty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModals} />

          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Edit className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Editar Especialidade</h3>
              </div>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmitEdit}>
              <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                <div>
                  <Label htmlFor="edit-name">Nome da Especialidade *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <IconPicker
                  value={formData.icon}
                  onChange={(icon) => setFormData({ ...formData, icon })}
                  label="Ícone da Especialidade"
                />

                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="edit-is_active">Ativo</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
                <Button type="button" variant="outline" onClick={closeModals}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </div>
            </form>
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
              <h3 className="text-xl font-semibold text-gray-900">
                Confirmar {confirmAction.action === 'ativar' ? 'Ativação' : 'Desativação'}
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Deseja realmente <strong>{confirmAction.action}</strong> a especialidade:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="font-semibold text-gray-900">{confirmAction.specialty.name}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button type="button" variant="outline" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmToggleStatus}
                className={confirmAction.action === 'ativar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {confirmAction.action === 'ativar' ? 'Ativar' : 'Desativar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Specialties;
