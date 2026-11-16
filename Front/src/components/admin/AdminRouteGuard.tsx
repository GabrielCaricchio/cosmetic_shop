import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

export interface AdminRouteGuardProps {
  children: ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  let isAdmin = false;
  let isLoading = false;

  try {
    const auth = useAuth();
    isAdmin = auth.isAdmin;
    isLoading = auth.isLoading;
  } catch {
    // Caso o componente seja testado ou renderizado fora de um AuthProvider explícito
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('aura_admin_token');
      isAdmin = !!token;
    }
    isLoading = false;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <Spinner size="lg" className="text-brand-700" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRouteGuard;
