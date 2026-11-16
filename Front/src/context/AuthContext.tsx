import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/authApi';
import { AUTH_TOKEN_KEY, ADMIN_TOKEN_KEY } from '../services/apiClient';
import {
  ClientUser,
  AdminUser,
  LoginCredentials,
  RegisterData,
  AdminLoginCredentials,
} from '../types/auth';

interface AuthContextType {
  user: ClientUser | null;
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  adminLogin: (credentials: AdminLoginCredentials) => Promise<void>;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Inicialização: restaura sessões persistidas
  useEffect(() => {
    const initAuth = async () => {
      const clientToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

      if (adminToken) {
        // Tenta decodificar ou ler adminUser salvo no localStorage
        const savedAdmin = localStorage.getItem('aura_admin_user');
        if (savedAdmin) {
          try {
            setAdminUser(JSON.parse(savedAdmin));
          } catch {
            setAdminUser({ id: 1, name: 'Administrador', email: 'admin@auracosmeticos.com.br', role: 'Admin' });
          }
        } else {
          setAdminUser({ id: 1, name: 'Administrador', email: 'admin@auracosmeticos.com.br', role: 'Admin' });
        }
      }

      if (clientToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
        } catch {
          // Token expirado ou inválido
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    const profile = await authApi.getMe().catch(() => ({
      id: response.user_id,
      name: response.name,
      email: credentials.email,
      role: response.role,
    }));
    setUser(profile);
    setIsAuthModalOpen(false);
  };

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data);
    const profile: ClientUser = {
      id: response.user_id,
      name: response.name || data.name,
      email: data.email,
      phone: data.phone,
      role: response.role,
    };
    setUser(profile);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const adminLogin = async (credentials: AdminLoginCredentials) => {
    const response = await authApi.adminLogin(credentials);
    const admin: AdminUser = {
      id: response.user_id,
      name: response.name,
      email: credentials.email,
      role: response.role,
    };
    setAdminUser(admin);
    localStorage.setItem('aura_admin_user', JSON.stringify(admin));
  };

  const adminLogout = () => {
    authApi.adminLogout();
    localStorage.removeItem('aura_admin_user');
    setAdminUser(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        isAuthenticated: !!user,
        isAdmin: !!adminUser,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
