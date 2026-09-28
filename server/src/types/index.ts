export type UserRole = 'Entrepreneur' | 'Officer' | 'Admin';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
  department?: string;
}

export interface ApiResponseFormat<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}
