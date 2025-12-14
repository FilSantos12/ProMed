import { useState, useCallback } from 'react';

interface ValidationRule {
  validate: (value: string) => { isValid: boolean; error: string };
}

interface FormErrors {
  [key: string]: string;
}

interface TouchedFields {
  [key: string]: boolean;
}

export const useFormValidation = (validationRules: { [key: string]: ValidationRule }) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  // Valida um campo específico
  const validateField = useCallback(
    (fieldName: string, value: string) => {
      const rule = validationRules[fieldName];
      if (!rule) return { isValid: true, error: '' };

      const result = rule.validate(value);
      
      setErrors((prev) => ({
        ...prev,
        [fieldName]: result.error,
      }));

      return result;
    },
    [validationRules]
  );

  // Marca campo como tocado (touched)
  const handleBlur = useCallback((fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  }, []);

  // Valida todos os campos
  const validateAll = useCallback(
    (formData: { [key: string]: string }) => {
      const newErrors: FormErrors = {};
      let isValid = true;

      Object.keys(validationRules).forEach((fieldName) => {
        const result = validationRules[fieldName].validate(formData[fieldName] || '');
        if (!result.isValid) {
          newErrors[fieldName] = result.error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      setTouched(
        Object.keys(validationRules).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {} as TouchedFields)
      );

      return isValid;
    },
    [validationRules]
  );

  // Limpa erros
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  // Verifica se deve mostrar erro (campo foi tocado e tem erro)
  const shouldShowError = useCallback(
    (fieldName: string) => {
      return touched[fieldName] && !!errors[fieldName];
    },
    [touched, errors]
  );

  // Verifica se o campo é válido
  const isFieldValid = useCallback(
    (fieldName: string) => {
      return touched[fieldName] && !errors[fieldName];
    },
    [touched, errors]
  );

  return {
    errors,
    touched,
    validateField,
    handleBlur,
    validateAll,
    clearErrors,
    shouldShowError,
    isFieldValid,
  };
};