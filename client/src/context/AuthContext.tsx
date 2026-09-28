import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { authService } from '../services/authService';
import { DEMO_CREDENTIALS } from '../data/mockData';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchRoleDemo: (role: UserRole) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth from localStorage, ensuring real backend JWT is active
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('maitri_token');
      const storedUser = localStorage.getItem('maitri_user');

      // Purge legacy mock token and authenticate with live backend
      if (
        !storedToken ||
        storedToken === 'mock-jwt-token-sih-demo' ||
        !storedUser ||
        storedUser.includes('mock-') ||
        storedUser.includes('Rahul Deshmukh')
      ) {
        try {
          const { user: liveUser, token: liveToken } = await authService.login({
            email: 'raj@industries.com',
            password: '12345678',
          });
          setUser(liveUser);
          setToken(liveToken);
          localStorage.setItem('maitri_token', liveToken);
          localStorage.setItem('maitri_user', JSON.stringify(liveUser));
        } catch (e) {
          console.warn('Initial live auth login fallback warning:', e);
        }
      } else {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          const verifiedUser = await authService.getCurrentUser();
          if (verifiedUser) {
            setUser(verifiedUser);
            localStorage.setItem('maitri_user', JSON.stringify(verifiedUser));
          }
        } catch {
          // If token expired, re-login with default seeded entrepreneur
          try {
            const { user: liveUser, token: liveToken } = await authService.login({
              email: 'raj@industries.com',
              password: '12345678',
            });
            setUser(liveUser);
            setToken(liveToken);
            localStorage.setItem('maitri_token', liveToken);
            localStorage.setItem('maitri_user', JSON.stringify(liveUser));
          } catch {
            localStorage.removeItem('maitri_token');
            localStorage.removeItem('maitri_user');
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, token: authToken } = await authService.login(credentials);
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('maitri_token', authToken);
      localStorage.setItem('maitri_user', JSON.stringify(loggedInUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const { user: newUser, token: authToken } = await authService.register(credentials);
      setUser(newUser);
      setToken(authToken);
      localStorage.setItem('maitri_token', authToken);
      localStorage.setItem('maitri_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('maitri_token');
      localStorage.removeItem('maitri_user');
    }
  };

  const switchRoleDemo = async (role: UserRole) => {
    const credentialsMap: Record<UserRole, { email: string; pass: string }> = {
      Entrepreneur: { email: 'raj@industries.com', pass: '12345678' },
      Officer: { email: 'officer@maitri.com', pass: '12345678' },
      Admin: { email: 'admin@maitri.com', pass: '12345678' },
    };
    const creds = credentialsMap[role];
    if (creds) {
      try {
        await login({ email: creds.email, password: creds.pass });
        window.location.reload();
      } catch (err) {
        console.error('Failed to switch demo persona:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        switchRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
