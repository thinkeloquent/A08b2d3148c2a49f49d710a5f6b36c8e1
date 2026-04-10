import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-3 py-2.5 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent
          disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400
          placeholder:text-slate-300
          transition-colors
          ${error
            ? 'border-red-300 focus:ring-red-400'
            : 'border-slate-200 hover:border-slate-300'
          }
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
