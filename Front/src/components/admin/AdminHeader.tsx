import React from 'react';
import { ShieldCheck, User } from 'lucide-react';

export interface AdminHeaderProps {
  title: string;
  adminUser?: { name: string; role: string; email?: string } | null;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, adminUser }) => {
  return (
    <header className="h-16 bg-white border-b border-neutral-200/80 px-6 flex items-center justify-between">
      <h1 className="text-lg font-bold text-neutral-900">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-neutral-100 py-1.5 px-3 border border-neutral-200">
          <User className="h-4 w-4 text-neutral-600" />
          <span className="text-xs font-semibold text-neutral-800">
            {adminUser?.name || 'Administrador'}
          </span>
          <span className="rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
            {adminUser?.role || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};
