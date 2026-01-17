import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../contexts/ToastContext';
import { CheckCircle } from 'lucide-react';
import doctorApplicationService from '../services/doctorApplicationService';
import { specialtyService } from '../services/specialtyService';

interface Specialty {
  id: number;
  name: string;
  icon: string;
}

interface DoctorApplicationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function DoctorApplicationForm({ onSuccess, onCancel }: DoctorApplicationFormProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  // Estados brasileiros
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const [formData, setFormData] = useState({
    crm: '',
    crm_state: '',
    specialty_id: '',
    bio: '',
    consultation_price: '100',
    consultation_duration: '30',
    years_experience: '0',
  });

  const [files, setFiles] = useState<{
    diploma_document: File | null;
    crm_document: File | null;
    identity_document: File | null;
  }>({
    diploma_document: null,
    crm_document: null,
    identity_document: null,
  });

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      const data = await specialtyService.getAll();
      setSpecialties(data);
    } catch (error) {
      console.error('Erro ao carregar especialidades:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof files) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Tamanho máximo: 5MB');
        return;
      }
      setFiles({ ...files, [fieldName]: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.crm || !formData.crm_state || !formData.specialty_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!files.diploma_document || !files.crm_document || !files.identity_document) {
      toast.error('Envie todos os documentos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      await doctorApplicationService.applyAsDoctor({
        crm: formData.crm,
        crm_state: formData.crm_state,
        specialty_id: parseInt(formData.specialty_id),
        bio: formData.bio || undefined,
        consultation_price: parseFloat(formData.consultation_price) || undefined,
        consultation_duration: parseInt(formData.consultation_duration) || undefined,
        years_experience: parseInt(formData.years_experience) || undefined,
        diploma_document: files.diploma_document!,
        crm_document: files.crm_document!,
        identity_document: files.identity_document!,
      });

      toast.success('Solicitação enviada com sucesso! Aguarde a análise do administrador.');
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao enviar solicitação';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const FileUploadField = ({
    label,
    fieldName,
    required = false,
    accept = ".pdf,.jpg,.jpeg,.png"
  }: {
    label: string;
    fieldName: keyof typeof files;
    required?: boolean;
    accept?: string;
  }) => {
    const file = files[fieldName];

    return (
      <div className="space-y-2">
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(e, fieldName)}
            className="flex-1"
          />
          {file && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>{file.name}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
        </p>
      </div>
    );
  };

  return (
    <div className="p-6">
      <p className="text-sm text-gray-600 mb-6">
        Preencha os dados abaixo e envie os documentos necessários para análise
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Profissionais</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crm">
                  Número do CRM <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="crm"
                  value={formData.crm}
                  onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                  placeholder="12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crm_state">
                  UF do CRM <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.crm_state}
                  onValueChange={(value) => setFormData({ ...formData, crm_state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty_id">
                  Especialidade <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.specialty_id}
                  onValueChange={(value) => setFormData({ ...formData, specialty_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id.toString()}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_experience">Anos de Experiência</Label>
                <Input
                  id="years_experience"
                  type="number"
                  min="0"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia / Apresentação</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Conte um pouco sobre sua formação e experiência profissional..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="consultation_price">Valor da Consulta (R$)</Label>
                <Input
                  id="consultation_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.consultation_price}
                  onChange={(e) => setFormData({ ...formData, consultation_price: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultation_duration">Duração da Consulta (min)</Label>
                <Input
                  id="consultation_duration"
                  type="number"
                  min="15"
                  max="180"
                  value={formData.consultation_duration}
                  onChange={(e) => setFormData({ ...formData, consultation_duration: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Documentos</h3>

            <FileUploadField
              label="Diploma de Medicina"
              fieldName="diploma_document"
              required
            />

            <FileUploadField
              label="Documento do CRM (frente e verso)"
              fieldName="crm_document"
              required
            />

            <FileUploadField
              label="Documento de Identidade (RG ou CNH)"
              fieldName="identity_document"
              required
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
  );
}
