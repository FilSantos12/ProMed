import React from 'react';
import { XCircle, Clock, Ban, AlertCircle } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'pending' | 'rejected' | 'inactive' | 'error';
  message: string;
  rejectionNotes?: string;
}

export function StatusModal({ isOpen, onClose, status, message, rejectionNotes }: StatusModalProps) {
  if (!isOpen) return null;

  // Configuração por tipo de status
  const statusConfig = {
    pending: {
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      titleColor: 'text-yellow-900',
      title: '⏳ Cadastro Pendente',
    },
    rejected: {
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      titleColor: 'text-red-900',
      title: '❌ Cadastro Rejeitado',
    },
    inactive: {
      icon: Ban,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      titleColor: 'text-gray-900',
      title: '🚫 Conta Inativa',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      titleColor: 'text-red-900',
      title: '⚠️ Erro no Login',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Header com ícone */}
        <div className={`${config.bgColor} ${config.borderColor} border-b-2 p-6 rounded-t-lg`}>
          <div className="flex items-center justify-center mb-4">
            <div className={`${config.bgColor} p-4 rounded-full`}>
              <Icon className={`w-12 h-12 ${config.iconColor}`} />
            </div>
          </div>
          <h3 className={`text-2xl font-bold text-center ${config.titleColor}`}>
            {config.title}
          </h3>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 text-center text-lg leading-relaxed">
            {message}
          </p>

          {/* Mostrar motivo da rejeição se existir */}
          {status === 'rejected' && rejectionNotes && (
            <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-4`}>
              <p className="text-sm font-semibold text-red-900 mb-2">
                📝 Motivo da Rejeição:
              </p>
              <p className="text-sm text-red-800 italic">
                {rejectionNotes}
              </p>
            </div>
          )}

          {/* Informações adicionais por status */}
          {status === 'pending' && (
            <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
              <p className="text-sm text-yellow-800">
                <strong>O que fazer?</strong>
                <br />
                • Aguarde a análise da administração
                <br />
                • Você receberá um email quando for aprovado
                <br />
                • Em caso de dúvidas, entre em contato conosco
              </p>
            </div>
          )}

          {status === 'rejected' && (
            <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
              <p className="text-sm text-red-800">
                <strong>O que fazer?</strong>
                <br />
                • Verifique o motivo da rejeição acima
                <br />
                • Entre em contato com a administração
                <br />
                • Você pode realizar um novo cadastro se necessário
              </p>
            </div>
          )}

          {status === 'inactive' && (
            <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
              <p className="text-sm text-gray-800">
                <strong>O que fazer?</strong>
                <br />
                • Entre em contato com o administrador
                <br />
                • Sua conta pode ter sido desativada temporariamente
              </p>
            </div>
          )}
        </div>

        {/* Footer com botão */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-black transition-all duration-200 ${
              status === 'pending'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : status === 'rejected' || status === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}