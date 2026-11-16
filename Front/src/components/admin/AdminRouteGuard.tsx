import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export interface AdminRouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();

  const adminToken = localStorage.getItem('admin_token');
  const adminUserStr = localStorage.getItem('admin_user');
  let adminUser: { role?: string } | null = null;
  if (adminUserStr) {
    try {
      adminUser = JSON.parse(adminUserStr);
    } catch {
      adminUser = null;
    }
  }

  const isAuthenticated = Boolean(adminToken && adminUser);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && adminUser?.role && !allowedRoles.includes(adminUser.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-6">
        <div className="bg-white p-6 rounded-2xl shadow-md max-w-md text-center">
          <h2 className="text-lg font-bold text-red-600">Acesso Restrito</h2>
          <p className="text-sm text-neutral-600 mt-2">
            Seu perfil ({adminUser.role}) não tem permissão para acessar esta seção.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
