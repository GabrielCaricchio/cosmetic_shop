import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'botanic' | 'champagne';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variantStyles = {
    // Verde Botânico O Boticário
    primary:
      'bg-gradient-to-r from-botanic-800 to-botanic-900 text-white hover:from-botanic-900 hover:to-botanic-950 focus:ring-botanic-700 shadow-soft hover:shadow-luxury border border-botanic-700/20',
    botanic:
      'bg-botanic-900 text-white hover:bg-botanic-950 focus:ring-botanic-700 shadow-soft',
    // Dourado Champagne Luxo
    secondary:
      'bg-champagne-500 text-botanic-950 hover:bg-champagne-400 focus:ring-champagne-400 font-semibold shadow-sm hover:shadow',
    champagne:
      'bg-gradient-to-r from-champagne-400 to-champagne-500 text-botanic-950 font-semibold hover:from-champagne-500 hover:to-champagne-600 focus:ring-champagne-400 shadow-sm',
    outline:
      'border border-warm-300 text-warm-800 hover:bg-warm-100 hover:text-botanic-950 focus:ring-botanic-600',
    danger:
      'bg-terracotta-600 text-white hover:bg-terracotta-700 focus:ring-terracotta-500 shadow-sm',
    ghost:
      'text-warm-700 hover:bg-warm-100 hover:text-botanic-900 focus:ring-warm-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5 min-h-[36px]',
    md: 'text-sm px-5 py-2.5 gap-2 min-h-[44px]', // Altura otimizada para toque mobile (Apple HIG 44pt)
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[50px] font-semibold',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <Loader2 data-testid="spinner" className="animate-spin w-4 h-4 shrink-0" />
      )}
      {children}
    </button>
  );
};
