/**
 * Input Component
 * Based on REQ.v002.md Section 6.3 (Component States)
 */

import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2 border rounded-lg text-sm
              ${icon ? 'pl-10' : ''}
              ${
                error
                  ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
              }
              focus:outline-none focus:ring-2
              disabled:bg-gray-100 disabled:cursor-not-allowed
              transition-colors duration-200
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-danger-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
