import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  children?: React.ReactNode;
  /** Rótulo do botão de navegação secundário (ex: "Área do Paciente") */
  navigationLabel?: string;
  /** Callback do botão de navegação; se definido, exibe o botão ao lado de "Fechar" */
  onNavigate?: () => void;
}

export function SuccessModal({ isOpen, onClose, title = 'Sucesso!', message, children, navigationLabel, onNavigate }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-zoom-in overflow-y-auto max-h-[90vh]">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Conteúdo */}
        <div className="flex flex-col items-center text-center">
          {/* Ícone de sucesso com animação */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce-in">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Título */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h3>

          {/* Mensagem */}
          <p className="text-gray-600 mb-4">
            {message}
          </p>

          {/* Conteúdo extra (dados do agendamento, etc.) */}
          {children && (
            <div className="w-full mb-4">
              {children}
            </div>
          )}

          {/* Botões */}
          {onNavigate ? (
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button
                onClick={onClose}
                style={{ flex: 1 }}
                className="border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Fechar
              </button>
              <button
                onClick={onNavigate}
                style={{ flex: 1, background: '#16a34a', color: 'white' }}
                className="py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {navigationLabel ?? 'Continuar'}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}