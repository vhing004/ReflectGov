import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, User, UserRole } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | AuthResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<AuthResponse>;
  register: (data: { username: string; password: string; fullName: string; email?: string; phoneNumber?: string }) => Promise<AuthResponse>;
  logout: () => void;
  isAdminOrStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | AuthResponse | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('reflectgov_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('reflectgov_token');
      if (storedToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
        } catch {
          localStorage.removeItem('reflectgov_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const res = await authApi.login(credentials);
    localStorage.setItem('reflectgov_token', res.token);
    setToken(res.token);
    setUser(res);
    return res;
  };

  const register = async (data: { username: string; password: string; fullName: string; email?: string; phoneNumber?: string }): Promise<AuthResponse> => {
    const res = await authApi.register(data);
    localStorage.setItem('reflectgov_token', res.token);
    setToken(res.token);
    setUser(res);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('reflectgov_token');
    setToken(null);
    setUser(null);
  };

  const role = user?.role as UserRole | undefined;
  const isAdminOrStaff = role === 'Admin' || role === 'Dispatcher' || role === 'Officer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAdminOrStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
