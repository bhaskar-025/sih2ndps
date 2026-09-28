import { api } from './api';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await api.post<any, ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const res = await api.post<any, ApiResponse<AuthResponse>>('/auth/register', credentials);
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<any, ApiResponse<User>>('/auth/me');
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('maitri_token');
      localStorage.removeItem('maitri_user');
    }
  },
};
