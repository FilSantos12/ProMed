import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  CalendarIcon,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Heart,
  Brain,
  Eye,
  Ear,
  Bone,
  Activity,
  Stethoscope,
  Pill,
  Syringe,
  TestTube,
  Microscope,
  Thermometer,
  Baby,
  Users,
  Hospital,
  Ambulance,
  Cross,
  Shield,
  Bandage,
  Clipboard,
  HeartPulse,
  LogIn,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";
import { usePendingAppointment } from "../contexts/PendingAppointmentContext";
import {
  appointmentService,
  Specialty,
  Doctor,
} from "../services/appointmentService";
import { LoadingSpinner } from "./ui/loading-spinner";
import { ErrorModal } from "./ui/error-modal";

// Mapa de ícones médicos (sincronizado com IconPicker)
const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  Brain,
  Eye,
  Ear,
  Bone,
  Activity,
  HeartPulse,
  Baby,
  Stethoscope,
  Pill,
  Syringe,
  TestTube,
  Microscope,
  Thermometer,
  Clipboard,
  Bandage,
  Hospital,
  Ambulance,
  Cross,
  Shield,
  Users,
  User,
};

interface AgendamentosPageProps {
  onSectionChange?: (section: string) => void;
  preSelected?: { specialtyId: number; doctorId: number } | null;
  onPreSelectedConsumed?: () => void;
}

export function AgendamentosPage({
  onSectionChange,
  preSelected,
  onPreSelectedConsumed,
}: AgendamentosPageProps = {}) {
  const { user } = useAuth();
  const toast = useToast();
  const { savePendingAppointment } = usePendingAppointment();

  // Estados para dados do backend
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Estados de loading
  const [loading, setLoading] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Estados do formulário
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    observations: "",
  });

  // Estado de sucesso
  const [appointmentCreated, setAppointmentCreated] = useState(false);

  // Estado para modal de login/cadastro
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Estado para modal de sem disponibilidade
  const [noSlotsModal, setNoSlotsModal] = useState({ open: false, title: '', message: '' });

  // ID de médico pendente de seleção (aguarda lista de médicos carregar)
  const [pendingDoctorId, setPendingDoctorId] = useState<string | null>(null);

  // Carregar especialidades ao montar o componente
  useEffect(() => {
    loadSpecialties();
  }, []);

  // Aplicar pré-seleção de especialidade e médico vinda de outro componente
  useEffect(() => {
    if (preSelected) {
      setSelectedSpecialty(preSelected.specialtyId.toString());
      setPendingDoctorId(preSelected.doctorId.toString());
      onPreSelectedConsumed?.();
    }
  }, [preSelected]);

  // Assim que a lista de médicos carregar, aplica o médico pendente
  useEffect(() => {
    if (pendingDoctorId && doctors.length > 0) {
      const exists = doctors.find((d) => d.id.toString() === pendingDoctorId);
      if (exists) {
        setSelectedDoctor(pendingDoctorId);
        setPendingDoctorId(null);
      }
    }
  }, [doctors, pendingDoctorId]);

  // Pré-preencher dados do usuário se estiver logado
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        cpf: user.cpf || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Carregar médicos quando especialidade for selecionada
  useEffect(() => {
    if (selectedSpecialty) {
      loadDoctors(parseInt(selectedSpecialty));
    } else {
      setDoctors([]);
      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTime("");
      setAvailableSlots([]);
    }
  }, [selectedSpecialty]);

  // Carregar horários quando médico e data forem selecionados
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedTime("");
    }
  }, [selectedDoctor, selectedDate]);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getSpecialties();
      setSpecialties(data);
    } catch (err: any) {
      console.error("Erro ao carregar especialidades:", err);
      toast.error("Erro ao carregar especialidades");
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async (specialtyId: number) => {
    try {
      setLoadingDoctors(true);
      const data = await appointmentService.getDoctors({
        specialty_id: specialtyId,
      });
      setDoctors(data);
    } catch (err: any) {
      console.error("Erro ao carregar médicos:", err);
      toast.error("Erro ao carregar médicos");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const doctorId = parseInt(selectedDoctor);
      const dateStr = selectedDate; // selectedDate já é string agora

      // Buscar horários do médico para a data específica
      const schedules = await appointmentService.getDoctorSchedules(doctorId, {
        schedule_date: dateStr,
        available: true,
      });

      if (schedules.length === 0) {
        setAvailableSlots([]);
        setNoSlotsModal({
          open: true,
          title: 'Médico sem agenda nesta data',
          message: `O médico selecionado não possui agenda cadastrada para ${formatDateDisplay(dateStr)}.\n\nPor favor, escolha outra data ou outro médico.`,
        });
        return;
      }

      // Pegar o primeiro horário disponível e buscar os slots
      const schedule = schedules[0];
      const slotsData = await appointmentService.getAvailableSlots(
        schedule.id,
        dateStr,
      );

      // Remover slots que já passaram quando a data selecionada for hoje
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;

      const futureSlots = isToday
        ? slotsData.available_slots.filter((time) => {
            const [slotHour, slotMin] = time.split(':').map(Number);
            return (
              slotHour > now.getHours() ||
              (slotHour === now.getHours() && slotMin > now.getMinutes())
            );
          })
        : slotsData.available_slots;

      setAvailableSlots(futureSlots);

      if (futureSlots.length === 0) {
        setNoSlotsModal({
          open: true,
          title: 'Horários esgotados',
          message: `Todos os horários do dia ${formatDateDisplay(dateStr)} já estão ocupados para este médico.\n\nPor favor, escolha outra data ou outro médico.`,
        });
      }
    } catch (err: any) {
      console.error("Erro ao carregar horários disponíveis:", err);
      toast.error("Erro ao carregar horários disponíveis");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const selectedDoctorInfo = getSelectedDoctorInfo();
    if (!selectedDoctorInfo) {
      toast.error("Médico não encontrado");
      return;
    }

    // Se usuário não está logado, salvar agendamento pendente e mostrar prompt de autenticação
    if (!user) {
      const selectedSpecialtyInfo = specialties.find(
        (s) => s.id.toString() === selectedSpecialty,
      );

      savePendingAppointment({
        specialty_id: parseInt(selectedSpecialty),
        doctor_id: selectedDoctorInfo.user_id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        patient_notes: formData.observations || undefined,
        specialty_name: selectedSpecialtyInfo?.name,
        doctor_name: selectedDoctorInfo.user.name,
      });

      setShowAuthPrompt(true);
      return;
    }

    try {
      setSubmitting(true);

      const appointmentData = {
        patient_id: user.id, // ID do usuário logado (paciente)
        doctor_id: selectedDoctorInfo.user_id, // user_id do médico, não doctor.id
        specialty_id: parseInt(selectedSpecialty),
        appointment_date: selectedDate, // selectedDate já é string no formato YYYY-MM-DD
        appointment_time: selectedTime,
        patient_notes: formData.observations || undefined,
      };

      await appointmentService.createAppointment(appointmentData);

      toast.success("Agendamento realizado com sucesso!");
      setAppointmentCreated(true);

      // Reset form após 3 segundos
      setTimeout(() => {
        resetForm();
        setAppointmentCreated(false);
      }, 3000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Erro ao criar agendamento";
      const validationErrors = err.response?.data?.errors;

      if (validationErrors) {
        const errorDetails = Object.values(validationErrors).flat().join(", ");
        toast.error(`${errorMessage}: ${errorDetails}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDate("");
    setSelectedTime("");
    setSelectedSpecialty("");
    setSelectedDoctor("");
    setFormData({
      name: user?.name || "",
      cpf: user?.cpf || "",
      phone: user?.phone || "",
      email: user?.email || "",
      observations: "",
    });
    setAvailableSlots([]);
  };

  const isFormValid = user
    ? // Usuário logado: apenas dados de agendamento
      selectedDate && selectedTime && selectedSpecialty && selectedDoctor
    : // Usuário não logado: apenas dados de agendamento (dados pessoais removidos)
      selectedDate && selectedTime && selectedSpecialty && selectedDoctor;

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getSelectedDoctorInfo = () => {
    return doctors.find((d) => d.id.toString() === selectedDoctor);
  };

  // Renderizar ícone da especialidade
  const getSpecialtyIcon = (iconName: string | null | undefined) => {
    if (!iconName) return null;
    const IconComponent = ICON_MAP[iconName] || Stethoscope;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (appointmentCreated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Agendamento Confirmado!
            </h2>
            <p className="text-gray-600 mb-4">
              Você receberá uma confirmação por email e SMS com todos os
              detalhes da consulta.
            </p>
            <Button onClick={resetForm} className="mt-4">
              Fazer Novo Agendamento
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showAuthPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Faça login ou cadastre-se para continuar
              </h2>
              <p className="text-gray-600">
                Para confirmar seu agendamento, você precisa ter uma conta em
                nosso sistema.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Seu agendamento:
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                {selectedSpecialty && (
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1.5"
                    >
                      {getSpecialtyIcon(
                        specialties.find(
                          (s) => s.id.toString() === selectedSpecialty,
                        )?.icon,
                      )}
                      {
                        specialties.find(
                          (s) => s.id.toString() === selectedSpecialty,
                        )?.name
                      }
                    </Badge>
                  </div>
                )}
                {getSelectedDoctorInfo() && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Dr(a). {getSelectedDoctorInfo()?.user.name}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                    <span>{formatDateDisplay(selectedDate)}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{selectedTime}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => onSectionChange?.("login")}
                className="w-full"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Já tenho conta - Fazer Login
              </Button>

              <Button
                onClick={() => onSectionChange?.("cadastro-paciente")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Criar nova conta
              </Button>

              <Button
                onClick={() => setShowAuthPrompt(false)}
                variant="ghost"
                className="w-full"
              >
                Voltar ao formulário
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ErrorModal
        isOpen={noSlotsModal.open}
        title={noSlotsModal.title}
        message={noSlotsModal.message}
        onClose={() => setNoSlotsModal({ open: false, title: '', message: '' })}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agendamento de Consultas
          </h1>
          <p className="text-lg text-gray-600">
            Agende sua consulta de forma rápida e fácil. Escolha o especialista,
            data e horário que melhor se adequam à sua necessidade.
          </p>
        </div>

        {/* Agendamento Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>Nova Consulta</span>
            </CardTitle>
            <CardDescription>
              Preencha todos os campos para agendar sua consulta
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Especialidade e Data */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade *</Label>
                  <Select
                    value={selectedSpecialty}
                    onValueChange={setSelectedSpecialty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((spec) => (
                        <SelectItem key={spec.id} value={spec.id.toString()}>
                          <div className="flex items-center gap-2">
                            {getSpecialtyIcon(spec.icon)}
                            <span>{spec.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data da Consulta *</Label>
                  <input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    disabled={!selectedSpecialty}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {!selectedSpecialty && (
                    <p className="text-xs text-gray-500">Selecione uma especialidade primeiro</p>
                  )}
                </div>
              </div>

              {/* Médico e Horário */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Médico *</Label>
                  <Select
                    value={selectedDoctor}
                    onValueChange={setSelectedDoctor}
                    disabled={!selectedSpecialty || loadingDoctors}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingDoctors
                            ? "Carregando..."
                            : !selectedSpecialty
                              ? "Selecione uma especialidade primeiro"
                              : doctors.length === 0
                                ? "Nenhum médico disponível"
                                : "Selecione o médico"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id.toString()}>
                          {doc.user.name} - CRM {doc.crm}/{doc.crm_state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDoctor && getSelectedDoctorInfo() && (
                    <p className="text-sm text-gray-600">
                      Valor da consulta: R${" "}
                      {(
                        Number(getSelectedDoctorInfo()?.consultation_price) || 0
                      ).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Horário *</Label>
                  <Select
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                    disabled={!selectedDoctor || !selectedDate || loadingSlots}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingSlots
                            ? "Carregando horários..."
                            : !selectedDoctor || !selectedDate
                              ? "Selecione médico e data primeiro"
                              : availableSlots.length === 0
                                ? "Nenhum horário disponível"
                                : "Selecione o horário"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{time}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingSlots && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <LoadingSpinner size="sm" />
                      <span>Buscando horários disponíveis...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações - sempre visível */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Observações</span>
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="observations">
                    Descreva seus sintomas ou informações relevantes
                  </Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) =>
                      handleInputChange("observations", e.target.value)
                    }
                    placeholder="(Esse campo é opcional) Descreva sintomas, medicamentos em uso ou outras informações relevantes..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    Estas informações ajudarão o médico a se preparar melhor
                    para sua consulta.
                  </p>
                </div>
              </div>

              {/* Resumo do Agendamento */}
              {(selectedDate ||
                selectedTime ||
                selectedSpecialty ||
                selectedDoctor) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Resumo do Agendamento:
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedSpecialty && (
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1.5"
                        >
                          {getSpecialtyIcon(
                            specialties.find(
                              (s) => s.id.toString() === selectedSpecialty,
                            )?.icon,
                          )}
                          {
                            specialties.find(
                              (s) => s.id.toString() === selectedSpecialty,
                            )?.name
                          }
                        </Badge>
                      </div>
                    )}
                    {selectedDoctor && getSelectedDoctorInfo() && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>{getSelectedDoctorInfo()?.user.name}</span>
                      </div>
                    )}
                    {selectedDate && (
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        <span>{formatDateDisplay(selectedDate)}</span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{selectedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alerta para usuários não logados */}
              {!user && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    Ao clicar em "Agendar Consulta", você será direcionado para
                    fazer login ou criar uma conta para finalizar seu
                    agendamento.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid || submitting}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {user
                      ? "Agendar Consulta"
                      : "Continuar para Login/Cadastro"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informações Importantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Informações Importantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Documentos Necessários:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• RG ou CNH</li>
                  <li>• CPF</li>
                  <li>• Carteirinha do convênio (se houver)</li>
                  <li>• Exames anteriores relacionados</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Política de Cancelamento:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Cancelamento até 24h antes: sem cobrança</li>
                  <li>• Cancelamento com menos de 24h: taxa aplicável</li>
                  <li>• Reagendamento gratuito até 3x</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Chegue com 15 minutos de
                antecedência. Você receberá uma confirmação por email e SMS com
                todos os detalhes da consulta.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
