import React from 'react';
import { Input } from './ui/input';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  showError?: boolean;
  isValid?: boolean;
  onBlur?: () => void;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  error,
  showError,
  isValid,
  className = '',
  onBlur,
  value,
  style,
  ...props
}) => {
  // Só mostra ícone se o campo foi preenchido (tem valor)
  const hasValue = value && String(value).length > 0;
  const shouldShowIcon = hasValue && (showError || isValid);

  const getInputClassName = () => {
    let classes = className;

    if (showError) {
      classes += ' border-red-500 focus:border-red-500 focus:ring-red-500';
    } else if (isValid && hasValue) {
      classes += ' border-green-500 focus:border-green-500 focus:ring-green-500';
    }

    return classes;
  };

  // Adiciona padding inline quando tem ícone
  const inputStyle = {
    ...style,
    paddingRight: shouldShowIcon ? '2.75rem' : style?.paddingRight || undefined,
  };

  return (
    <div className="w-full">
      {/* Container do input com posição relative APENAS para o ícone */}
      <div className="relative">
        <Input
          {...props}
          value={value}
          className={getInputClassName()}
          style={inputStyle}
          onBlur={onBlur}
        />
        
        {/* Ícone de ERRO - centralizado em relação ao INPUT, não ao container */}
        {hasValue && showError && (
          <div 
            className="pointer-events-none" 
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <XCircle className="w-5 h-5 text-red-500" style={{ margin: 0 }} />
          </div>
        )}
        
        {/* Ícone de SUCESSO - centralizado em relação ao INPUT */}
        {hasValue && isValid && !showError && (
          <div 
            className="pointer-events-none"
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" style={{ margin: 0 }} />
          </div>
        )}
      </div>

      {/* Mensagem de erro FORA do container relativo */}
      {showError && error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <XCircle className="w-4 h-4 flex" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};