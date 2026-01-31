import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ApiResponse {
  message: string;
}

export interface ApiError {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

/**
 * Solicita recuperação de senha
 */
export const forgotPassword = async (data: ForgotPasswordData): Promise<ApiResponse> => {
  try {
    const response = await axios.post<ApiResponse>(`${API_URL}/forgot-password`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw { message: 'Erro ao conectar com o servidor. Tente novamente.' };
  }
};

/**
 * Redefine a senha com token
 */
export const resetPassword = async (data: ResetPasswordData): Promise<ApiResponse> => {
  try {
    const response = await axios.post<ApiResponse>(`${API_URL}/reset-password`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw { message: 'Erro ao conectar com o servidor. Tente novamente.' };
  }
};