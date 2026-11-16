import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientUser, AdminUser, LoginPayload, ClientRegisterPayload } from '../types/auth';
import { apiClient } from '../services/apiClient';

export interface AuthContextType {
  user: ClientUser | null;
  adminUser: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: ClientRegisterPayload) => Promise<void>;
  adminLogin: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ClientUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || localStorage.getItem('admin_token');
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (token && !user) {
      apiClient
        .get('/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/login', payload);
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: ClientRegisterPayload) => {
    if (!payload.lgpd_consent) {
      throw new Error('É necessário aceitar os termos da LGPD para criar uma conta.');
    }
    setIsLoading(true);
    try {
      const res = await apiClient.post('/register', payload);
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/admin/login', payload);
      const { access_token, user: adminData } = res.data;
      setToken(access_token);
      setAdminUser(adminData);
      localStorage.setItem('admin_token', access_token);
      localStorage.setItem('admin_user', JSON.stringify(adminData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAdminUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
