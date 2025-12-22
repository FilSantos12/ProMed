import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { validatePassword } from '../utils/validators';
import { useFormValidation } from '../hooks/useFormValidation';
import { ValidatedInput } from './ValidatedInput';
import { useToast } from '../contexts/ToastContext';
import { resetPassword } from '../services/passwordResetService';
import '../styles/ResetPasswordPage.css';

interface ResetPasswordPageProps {
  onSectionChange?: (section: string) => void;
}

export function ResetPasswordPage({ onSectionChange }: ResetPasswordPageProps) {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validação customizada para confirmação de senha
  const validatePasswordConfirmation = (value: string) => {
    if (!value) {
      return { isValid: false, error: 'Confirme sua senha' };
    }
    if (value !== password) {
      return { isValid: false, error: 'As senhas não coincidem' };
    }
    return { isValid: true, error: '' };
  };

  const {
    errors,
    validateField,
    handleBlur,
    validateAll,
    shouldShowError,
    isFieldValid,
  } = useFormValidation({
    password: { validate: validatePassword },
    passwordConfirmation: { validate: validatePasswordConfirmation },
  });

  // Extrair email e token da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const tokenParam = params.get('token');

    if (!emailParam || !tokenParam) {
      toast.error('Link inválido ou expirado');
      setTimeout(() => {
        if (onSectionChange) {
          onSectionChange('login');
        }
      }, 3000);
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);
  }, [toast, onSectionChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos
    const isValid = validateAll({ password, passwordConfirmation });

    if (!isValid) {
      toast.warning('Preencha todos os campos corretamente');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess(true);
      toast.success(response.message || 'Senha redefinida com sucesso!');

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        if (onSectionChange) {
          onSectionChange('login');
        }
      }, 3000);

    } catch (error: any) {
      if (error.message.includes('Token')) {
        toast.error('Link expirado ou inválido. Solicite um novo link de recuperação.');
      } else {
        toast.error(error.message || 'Erro ao redefinir senha');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validateField('password', value);
    
    // Revalidar confirmação se já foi preenchida
    if (passwordConfirmation) {
      validateField('passwordConfirmation', passwordConfirmation);
    }
  };

  const handlePasswordConfirmationChange = (value: string) => {
    setPasswordConfirmation(value);
    validateField('passwordConfirmation', value);
  };

  // Indicador de força da senha
  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    return 'medium';
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        {!success ? (
          <div className="reset-password-card">
            
            {/* Logo */}
              <div className="reset-password-logo flex justify-center items-center w-full">
                <img src="/img/Logo1.JPG" alt="ProMed" className="mx-auto max-w-full h-auto" />
              </div>

            {/* Header */}
            <div className="reset-password-header">
              <Lock className="reset-password-icon" size={48} />
              <h1 className="reset-password-title">Redefinir Senha</h1>
              <p className="reset-password-subtitle">
                Digite sua nova senha abaixo
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="reset-password-form">
              {/* Nova Senha */}
              <div className="form-group">
                <label htmlFor="new-password" className="form-label">
                  Nova Senha
                </label>
                <div className="password-input-wrapper">
                  <ValidatedInput
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Mínimo 8 caracteres"
                    disabled={loading}
                    error={errors.password}
                    showError={shouldShowError('password')}
                    isValid={isFieldValid('password')}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Indicador de força */}
                {passwordStrength && (
                  <div className="password-strength">
                    <div className="password-strength-bar">
                      <div className={`password-strength-fill ${passwordStrength}`}></div>
                    </div>
                    <span className={`password-strength-text ${passwordStrength}`}>
                      {passwordStrength === 'weak' && 'Senha fraca'}
                      {passwordStrength === 'medium' && 'Senha média'}
                      {passwordStrength === 'strong' && 'Senha forte'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="form-group">
                <label htmlFor="confirm-password" className="form-label">
                  Confirmar Nova Senha
                </label>
                <div className="password-input-wrapper">
                  <ValidatedInput
                    id="confirm-password"
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    value={passwordConfirmation}
                    onChange={(e) => handlePasswordConfirmationChange(e.target.value)}
                    onBlur={() => handleBlur('passwordConfirmation')}
                    placeholder="Digite a senha novamente"
                    disabled={loading}
                    error={errors.passwordConfirmation}
                    showError={shouldShowError('passwordConfirmation')}
                    isValid={isFieldValid('passwordConfirmation')}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    tabIndex={-1}
                  >
                    {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading || !password || !passwordConfirmation || !!errors.password || !!errors.passwordConfirmation}
              >
                {loading ? (
                  <>
                    <Loader2 className="btn-icon spin" size={18} />
                    Redefinindo...
                  </>
                ) : (
                  <>
                    <Lock className="btn-icon" size={18} />
                    Redefinir Senha
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="reset-password-card">
            <div className="success-message">
              <div className="success-icon-wrapper">
                <CheckCircle2 className="success-icon" size={72} />
              </div>
              <h2 className="success-title">Senha Redefinida!</h2>
              <p className="success-text">
                Sua senha foi alterada com sucesso. Você será redirecionado para o login.
              </p>
              <div className="success-loader">
                <Loader2 className="spin" size={24} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}