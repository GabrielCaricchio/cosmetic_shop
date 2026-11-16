import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      className = '',
      containerClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-500">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`
              w-full h-11 px-3.5 text-sm rounded-md border transition-colors
              bg-white text-neutral-900 placeholder:text-neutral-400
              focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700
              disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-neutral-300 hover:border-neutral-400'
              }
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-neutral-500">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
