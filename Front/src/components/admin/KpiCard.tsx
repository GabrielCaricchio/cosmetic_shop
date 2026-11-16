import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'rose' | 'emerald' | 'amber' | 'blue';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'rose',
}) => {
  const variantStyles = {
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-neutral-200 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="mt-1 text-2xl font-black text-neutral-900">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>}
      </div>

      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.bg}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
};
