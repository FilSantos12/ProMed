import React from 'react';
import { IMaskInput } from 'react-imask';
import { cn } from './utils';

interface MaskedInputProps {
  mask: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, onBlur, placeholder, id, required, disabled, className }, ref) => {
    return (
      <IMaskInput
        mask={mask}
        value={value}
        unmask={false} // Mantém a máscara no valor
        onAccept={(value: string) => onChange(value)}
        onBlur={onBlur}
        placeholder={placeholder}
        id={id}
        required={required}
        disabled={disabled}
        inputRef={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
