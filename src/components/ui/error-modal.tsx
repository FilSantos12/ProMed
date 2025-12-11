import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from './button';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function ErrorModal({ 
  isOpen, 
  onClose, 
  title = 'Ops! Algo deu errado', 
  message 
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay com animação */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal com animação */}
      <div 
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-zoom-in"
          style={{
            animation: 'modalFadeIn 0.2s ease-out'
          }}
        >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="shrink w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700"
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
}