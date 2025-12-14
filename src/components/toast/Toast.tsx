import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrada
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Duração da animação de saída
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      case 'info':
        return <Info size={20} />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Sucesso';
      case 'error':
        return 'Erro';
      case 'warning':
        return 'Atenção';
      case 'info':
        return 'Informação';
    }
  };

  return (
    <div 
      className={`toast toast-${type} ${isVisible ? 'toast-visible' : ''} ${isLeaving ? 'toast-leaving' : ''}`}
    >
      <div className="toast-icon">
        {getIcon()}
      </div>
      
      <div className="toast-content">
        <div className="toast-title">{getTitle()}</div>
        <div className="toast-message">{message}</div>
      </div>

      <button 
        className="toast-close"
        onClick={handleClose}
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;