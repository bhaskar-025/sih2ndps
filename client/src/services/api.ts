import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Base URL for the isolated Express backend (proxied by Vite in dev to eliminate CORS issues)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost:5000')
    ? import.meta.env.VITE_API_URL
    : '/api/v1';

// Create central Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach authorization token and correlation tracking
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('maitri_token');
    if (token && token !== 'mock-jwt-token-sih-demo' && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format responses and handle global error states (401, 403, 500)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const status = error.response.status;

      // Token expiration / unauthorized handling
      if (status === 401) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          localStorage.removeItem('maitri_token');
          localStorage.removeItem('maitri_user');
        }
      }

      const message = error.response.data?.message || 'A server error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Network error: Server is unreachable. Please verify backend status.'));
    }

    return Promise.reject(error);
  }
);

export default api;
