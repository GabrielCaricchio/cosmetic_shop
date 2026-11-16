import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-sm gap-1.5 h-8',
    md: 'text-sm px-4 py-2.5 rounded-md gap-2 h-11',
    lg: 'text-base px-6 py-3.5 rounded-lg gap-2.5 h-13',
  };

  const variantStyles = {
    primary:
      'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 focus:ring-brand-700 disabled:bg-neutral-300 disabled:text-neutral-500 shadow-sm',
    secondary:
      'bg-brand-100 text-brand-900 hover:bg-brand-200 active:bg-brand-300 focus:ring-brand-600 disabled:bg-neutral-100 disabled:text-neutral-400',
    outline:
      'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100 focus:ring-brand-700 disabled:border-neutral-200 disabled:text-neutral-400',
    ghost:
      'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus:ring-neutral-400 disabled:text-neutral-300',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-600 disabled:bg-neutral-300 disabled:text-neutral-500',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Spinner size={size === 'lg' ? 'md' : 'sm'} className="mr-1 text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
