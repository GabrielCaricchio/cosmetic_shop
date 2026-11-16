import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Lock,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const { adminUser, adminLogout } = useAuth();

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/produtos', label: 'Cosméticos & Catálogo', icon: Package },
    { to: '/admin/pedidos', label: 'Gestão de Pedidos', icon: ShoppingCart },
    { to: '/admin/reservas', label: 'Monitor de Concorrência', icon: Lock },
  ];

  return (
    <aside className="w-64 bg-brand-950 text-neutral-100 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-brand-900">
        <span className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm">
          A
        </span>
        <div>
          <span className="font-serif font-bold text-base text-white tracking-wide block leading-none">
            Aura Backoffice
          </span>
          <span className="text-[10px] text-accent-400 font-semibold uppercase tracking-wider">
            Painel Gerencial
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors
                ${
                  isActive
                    ? 'bg-brand-800 text-white shadow-xs'
                    : 'text-neutral-300 hover:bg-brand-900/60 hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0 text-accent-400" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-brand-900 bg-brand-950/80">
        <div className="flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="text-xs font-semibold text-white block truncate">
              {adminUser?.name || 'Administrador'}
            </span>
            <span className="text-[10px] text-accent-400 font-medium block">
              {adminUser?.role || 'Admin'}
            </span>
          </div>

          <button
            onClick={adminLogout}
            title="Sair do painel"
            aria-label="Sair do painel"
            className="p-2 text-neutral-400 hover:text-white hover:bg-brand-900 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
