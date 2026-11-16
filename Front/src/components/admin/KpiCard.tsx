import React, { ReactNode } from 'react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'brand';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'neutral',
}) => {
  const iconColorStyles = {
    neutral: 'bg-neutral-100 text-neutral-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    brand: 'bg-brand-100 text-brand-800',
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-xs flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
          {title}
        </span>
        <span className="text-2xl font-bold text-neutral-900 font-serif mt-1 block">
          {value}
        </span>
        {subtitle && (
          <span className="text-[11px] text-neutral-500 mt-1 block font-medium">
            {subtitle}
          </span>
        )}
      </div>

      <div className={`p-3 rounded-lg shrink-0 ${iconColorStyles[variant]}`}>
        {icon}
      </div>
    </div>
  );
};

export default KpiCard;
