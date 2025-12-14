// ============================================
// VALIDADORES REUTILIZÁVEIS - ProMed
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error: string;
}

// Validação de Email
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email inválido' };
  }

  return { isValid: true, error: '' };
};

// Validação de Senha
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Senha deve ter no mínimo 8 caracteres' };
  }

  return { isValid: true, error: '' };
};

// Validação de CPF
export const validateCPF = (cpf: string): ValidationResult => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  if (!cleanCPF) {
    return { isValid: false, error: 'CPF é obrigatório' };
  }

  if (cleanCPF.length !== 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos' };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) {
    return { isValid: false, error: 'CPF inválido' };
  }

  // Validação do dígito verificador
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) {
    return { isValid: false, error: 'CPF inválido' };
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) {
    return { isValid: false, error: 'CPF inválido' };
  }

  return { isValid: true, error: '' };
};

// Validação de Telefone
export const validatePhone = (phone: string): ValidationResult => {
  const cleanPhone = phone.replace(/\D/g, '');

  if (!cleanPhone) {
    return { isValid: false, error: 'Telefone é obrigatório' };
  }

  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return { isValid: false, error: 'Telefone inválido' };
  }

  return { isValid: true, error: '' };
};

// Validação de CRM
export const validateCRM = (crm: string): ValidationResult => {
  const cleanCRM = crm.replace(/\D/g, '');

  if (!cleanCRM) {
    return { isValid: false, error: 'CRM é obrigatório' };
  }

  if (cleanCRM.length < 4 || cleanCRM.length > 6) {
    return { isValid: false, error: 'CRM deve ter entre 4 e 6 dígitos' };
  }

  return { isValid: true, error: '' };
};

// Validação de CEP
export const validateCEP = (cep: string): ValidationResult => {
  const cleanCEP = cep.replace(/\D/g, '');

  if (!cleanCEP) {
    return { isValid: false, error: 'CEP é obrigatório' };
  }

  if (cleanCEP.length !== 8) {
    return { isValid: false, error: 'CEP deve ter 8 dígitos' };
  }

  return { isValid: true, error: '' };
};

// Validação de Nome Completo
export const validateFullName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Nome completo é obrigatório' };
  }

  if (name.trim().split(' ').length < 2) {
    return { isValid: false, error: 'Digite o nome completo' };
  }

  if (name.length < 3) {
    return { isValid: false, error: 'Nome muito curto' };
  }

  return { isValid: true, error: '' };
};