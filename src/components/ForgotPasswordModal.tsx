import React, { useState } from 'react';
import { X, Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { validateEmail } from '../utils/validators';
import { useFormValidation } from '../hooks/useFormValidation';
import { ValidatedInput } from './ValidatedInput';
import { useToast } from '../contexts/ToastContext';
import { forgotPassword } from '../services/passwordResetService';
import '../styles/ForgotPasswordModal.css';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    errors,
    validateField,
    handleBlur,
    validateAll,
    clearErrors,
    shouldShowError,
    isFieldValid,
  } = useFormValidation({
    email: { validate: validateEmail },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar email
    const isValid = validateAll({ email });

    if (!isValid) {
      toast.warning('Digite um email válido');
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword({ email });
      
      setSuccess(true);
      toast.success(response.message || 'Email enviado com sucesso!');

      // Fechar modal após 5 segundos
      setTimeout(() => {
        handleClose();
      }, 5000);

    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    clearErrors();
    onClose();
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateField('email', value);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <Mail className="modal-icon" />
            <div>
              <h2 className="modal-title">Recuperar Senha</h2>
              <p className="modal-subtitle">Digite seu email para receber o link de recuperação</p>
            </div>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {!success ? (
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="recovery-email" className="form-label">
                  Email cadastrado
                </label>
                <ValidatedInput
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="seu@email.com"
                  disabled={loading}
                  error={errors.email}
                  showError={shouldShowError('email')}
                  isValid={isFieldValid('email')}
                />
                <p className="form-hint">
                  Enviaremos um link de recuperação para este email
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !email || !!errors.email}
                >
                  {loading ? (
                    <>
                      <Loader2 className="btn-icon spin" size={18} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="btn-icon" size={18} />
                      Enviar Link
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="success-message">
              <div className="success-icon-wrapper">
                <CheckCircle2 className="success-icon" size={64} />
              </div>
              <h3 className="success-title">Email Enviado!</h3>
              <p className="success-text">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <p className="success-hint">
                Não esqueça de verificar a pasta de spam.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}