import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'botanic' | 'gold' | 'terracotta' | 'vegan';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-warm-100 text-warm-800 border-warm-200/80',
    botanic: 'bg-botanic-50 text-botanic-800 border-botanic-200 font-semibold',
    gold: 'bg-champagne-100 text-champagne-800 border-champagne-300 font-semibold',
    vegan: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 font-medium',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-terracotta-50 text-terracotta-700 border-terracotta-200',
    terracotta: 'bg-terracotta-50 text-terracotta-700 border-terracotta-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wide uppercase',
    md: 'text-xs px-2.5 py-1 font-medium tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border shadow-2xs backdrop-blur-xs transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
