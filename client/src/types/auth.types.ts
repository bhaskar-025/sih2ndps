export type UserRole = 'Entrepreneur' | 'Officer' | 'Admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  industryCategory?: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  industryCategory?: string;
  department?: string;
  designation?: string;
}
