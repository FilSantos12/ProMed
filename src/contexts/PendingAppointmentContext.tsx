import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { appointmentService } from '../services/appointmentService';
import { useToast } from './ToastContext';

export interface PendingAppointmentData {
  specialty_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  patient_notes?: string;
  // Informações extras para exibição
  specialty_name?: string;
  doctor_name?: string;
  // Dados do paciente para pré-preencher cadastro
  patient_name?: string;
  patient_cpf?: string;
  patient_phone?: string;
  patient_email?: string;
  // Timestamp de criação para expiração
  created_at?: number;
}

interface PendingAppointmentContextData {
  pendingAppointment: PendingAppointmentData | null;
  hasPendingAppointment: boolean;
  savePendingAppointment: (data: PendingAppointmentData) => void;
  clearPendingAppointment: () => void;
  completePendingAppointment: (userId: number, showToast?: boolean) => Promise<boolean>;
}

export const PendingAppointmentContext = createContext<PendingAppointmentContextData>(
  {} as PendingAppointmentContextData
);

interface PendingAppointmentProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'pendingAppointment';

export function PendingAppointmentProvider({ children }: PendingAppointmentProviderProps) {
  const [pendingAppointment, setPendingAppointment] = useState<PendingAppointmentData | null>(null);
  const toast = useToast();

  // Carregar agendamento pendente do localStorage ao iniciar
  useEffect(() => {
    const storedAppointment = localStorage.getItem(STORAGE_KEY);
    if (storedAppointment) {
      try {
        const appointment = JSON.parse(storedAppointment);

        // Validar se o agendamento ainda é válido
        const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
        const now = new Date();

        // Verificar se expirou (data passada ou mais de 7 dias)
        const isDatePast = appointmentDateTime <= now;
        const isExpired = appointment.created_at &&
          (now.getTime() - appointment.created_at) / (1000 * 60 * 60 * 24) > 7;

        if (isDatePast || isExpired) {
          // Agendamento expirado - remover silenciosamente
          localStorage.removeItem(STORAGE_KEY);
        } else {
          // Agendamento válido - carregar
          setPendingAppointment(appointment);
        }
      } catch (error) {
        console.error('Erro ao carregar agendamento pendente:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const savePendingAppointment = (data: PendingAppointmentData) => {
    // Adicionar timestamp de criação
    const dataWithTimestamp = {
      ...data,
      created_at: Date.now()
    };
    setPendingAppointment(dataWithTimestamp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  };

  const clearPendingAppointment = () => {
    setPendingAppointment(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isAppointmentValid = (appointment: PendingAppointmentData): boolean => {
    // Verificar se a data do agendamento ainda é futura
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();

    // Se a data/hora já passou, é inválido
    if (appointmentDateTime <= now) {
      return false;
    }

    // Verificar se o agendamento foi criado há mais de 7 dias (expirado)
    if (appointment.created_at) {
      const createdAt = new Date(appointment.created_at);
      const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation > 7) {
        return false;
      }
    }

    return true;
  };

  const completePendingAppointment = async (userId: number, showToast: boolean = true): Promise<boolean> => {
    if (!pendingAppointment) {
      return false;
    }

    // VALIDAÇÃO PRÉVIA: Verificar se o agendamento ainda é válido antes de enviar ao servidor
    if (!isAppointmentValid(pendingAppointment)) {
      // Agendamento expirado ou data passada - limpar silenciosamente
      clearPendingAppointment();
      return false;
    }

    try {
      const appointmentData = {
        patient_id: userId,
        doctor_id: pendingAppointment.doctor_id,
        specialty_id: pendingAppointment.specialty_id,
        appointment_date: pendingAppointment.appointment_date,
        appointment_time: pendingAppointment.appointment_time,
        patient_notes: pendingAppointment.patient_notes,
      };

      await appointmentService.createAppointment(appointmentData);

      if (showToast) {
        toast.success('Agendamento realizado com sucesso!');
      }
      clearPendingAppointment();
      return true;
    } catch (error: any) {
      // Limpar agendamento pendente inválido/expirado
      clearPendingAppointment();

      // Só mostrar erro se showToast for true
      if (showToast) {
        const errorMessage = error.response?.data?.message || 'Erro ao completar agendamento';
        const validationErrors = error.response?.data?.errors;

        if (validationErrors) {
          const errorDetails = Object.values(validationErrors).flat().join(', ');
          toast.error(`${errorMessage}: ${errorDetails}`);
        } else {
          toast.error(errorMessage);
        }
      }
      return false;
    }
  };

  return (
    <PendingAppointmentContext.Provider
      value={{
        pendingAppointment,
        hasPendingAppointment: !!pendingAppointment,
        savePendingAppointment,
        clearPendingAppointment,
        completePendingAppointment,
      }}
    >
      {children}
    </PendingAppointmentContext.Provider>
  );
}

// Hook customizado para facilitar o uso
export function usePendingAppointment() {
  const context = useContext(PendingAppointmentContext);
  if (!context) {
    throw new Error('usePendingAppointment deve ser usado dentro de PendingAppointmentProvider');
  }
  return context;
}
