import React, { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'champagne';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium leading-tight',
    md: 'text-xs px-2.5 py-1 font-semibold leading-normal',
  };

  const variantStyles = {
    neutral: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    brand: 'bg-brand-100 text-brand-900 border border-brand-200',
    champagne: 'bg-amber-100/60 text-amber-900 border border-amber-300/50',
  };

  return (
    <span
      className={`inline-flex items-center rounded-pill tracking-wide uppercase ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
