import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-warm-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-2xl border px-4 py-3 text-sm text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
            error
              ? 'border-terracotta-400 focus:border-terracotta-500 focus:ring-terracotta-200/50 bg-terracotta-50/20'
              : 'border-warm-200/90 focus:border-botanic-600 focus:ring-botanic-100 bg-white/90 shadow-2xs'
          } disabled:bg-warm-100 disabled:text-warm-400 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-terracotta-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-warm-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
