import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from './button';
import  { useState, useEffect } from 'react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function ErrorModal({ isOpen, onClose, title = 'Erro!', message }: ErrorModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  
  useEffect(() => {
    if (isOpen && message) {
      
      setInternalOpen(true);
      setSavedMessage(message);
    }
  }, [isOpen, message]);
  
  const handleClose = () => {
    
    setInternalOpen(false);
    setSavedMessage('');
    setTimeout(() => {
      onClose();
    }, 100);
  };
  
  if (!internalOpen || !savedMessage) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        // Só fecha se clicar no overlay, não no modal
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Conteúdo */}
        <div className="flex flex-col items-center text-center">
          {/* Ícone de erro com animação */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-bounce-in">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Título */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h3>

          {/* Mensagem */}
          <p className="text-gray-600 mb-6 whitespace-pre-line">
            {savedMessage}
          </p>

          {/* Botão OK */}
          <button
            onClick={handleClose}
            type="button"
            className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  );
}