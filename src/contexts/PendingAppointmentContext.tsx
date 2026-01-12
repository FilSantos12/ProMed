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
}

interface PendingAppointmentContextData {
  pendingAppointment: PendingAppointmentData | null;
  hasPendingAppointment: boolean;
  savePendingAppointment: (data: PendingAppointmentData) => void;
  clearPendingAppointment: () => void;
  completePendingAppointment: (userId: number) => Promise<boolean>;
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
        setPendingAppointment(JSON.parse(storedAppointment));
      } catch (error) {
        console.error('Erro ao carregar agendamento pendente:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const savePendingAppointment = (data: PendingAppointmentData) => {
    setPendingAppointment(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const clearPendingAppointment = () => {
    setPendingAppointment(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const completePendingAppointment = async (userId: number): Promise<boolean> => {
    if (!pendingAppointment) {
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

      console.log('=== DEBUG PENDING APPOINTMENT ===');
      console.log('Dados do agendamento pendente:', JSON.stringify(appointmentData, null, 2));
      console.log('User ID:', userId);
      console.log('Pending appointment original:', pendingAppointment);

      await appointmentService.createAppointment(appointmentData);

      toast.success('Agendamento realizado com sucesso!');
      clearPendingAppointment();
      return true;
    } catch (error: any) {
      console.error('=== ERRO PENDING APPOINTMENT ===');
      console.error('Erro ao completar agendamento pendente:', error);
      console.error('Resposta do servidor:', error.response?.data);
      console.error('Erros de validação:', error.response?.data?.errors);

      const errorMessage = error.response?.data?.message || 'Erro ao completar agendamento';
      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        const errorDetails = Object.values(validationErrors).flat().join(', ');
        toast.error(`${errorMessage}: ${errorDetails}`);
      } else {
        toast.error(errorMessage);
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
