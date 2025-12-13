import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function SuccessModal({ isOpen, onClose, title = 'Sucesso!', message }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-zoom-in">
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
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Botão OK */}
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}