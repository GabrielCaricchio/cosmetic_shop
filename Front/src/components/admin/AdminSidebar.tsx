import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  ShoppingBag,
  Clock,
  Layers,
  LogOut,
} from 'lucide-react';

export interface AdminSidebarProps {
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  const navItems = [
    { to: '/admin/dashboard', label: 'Visão Geral (KPIs)', icon: LayoutDashboard },
    { to: '/admin/produtos', label: 'Catálogo de Produtos', icon: Layers },
    { to: '/admin/pedidos', label: 'Gestão de Pedidos', icon: ShoppingBag },
    { to: '/admin/reservas', label: 'Trava de Estoque (Redis)', icon: Clock },
  ];

  return (
    <aside className="w-64 bg-neutral-900 text-white flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block">
              Aura Backoffice
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
              Painel Admin
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sair do Painel
        </button>
      </div>
    </aside>
  );
};
