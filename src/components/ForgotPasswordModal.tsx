import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { validateEmail } from '../utils/validators';
import { useFormValidation } from '../hooks/useFormValidation';
import { ValidatedInput } from './ValidatedInput';
import { useToast } from '../contexts/ToastContext';
import { forgotPassword } from '../services/passwordResetService';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export function ForgotPasswordModal({ isOpen, onClose, initialEmail }: ForgotPasswordModalProps) {
  const toast = useToast();
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInternalOpen(true);
      setEmail(initialEmail || '');
    }
  }, [isOpen, initialEmail]);

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

    const isValid = validateAll({ email });
    if (!isValid) {
      toast.warning('Digite um email válido');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      setSuccess(true);
      setDevResetLink(response.dev_reset_link || null);
      toast.success(response.message || 'Email enviado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInternalOpen(false);
    setTimeout(() => {
      setEmail(initialEmail || '');
      setSuccess(false);
      setDevResetLink(null);
      clearErrors();
      onClose();
    }, 100);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateField('email', value);
  };

  if (!internalOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fechar */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recuperar Senha</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Digite seu email para receber o link de recuperação
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email cadastrado</Label>
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
              <p className="text-xs text-gray-500">
                Enviaremos um link de recuperação para este email
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !email || !!errors.email}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Link
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Email Enviado!</h3>
              <p className="text-sm text-gray-500">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <p className="text-xs text-gray-400">
                Não esqueça de verificar a pasta de spam.
              </p>
            </div>

            {devResetLink && (
              <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 space-y-2">
                <p className="text-xs font-semibold text-yellow-800">Ambiente de desenvolvimento</p>
                <p className="text-xs text-yellow-700">
                  Use o link abaixo para redefinir a senha sem precisar do email:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setTimeout(() => { window.location.href = devResetLink; }, 150);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  Clique aqui para redefinir a senha
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
