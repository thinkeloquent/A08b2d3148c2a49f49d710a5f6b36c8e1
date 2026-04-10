/**
 * Input Component
 * Styled input field with React Hook Form support
 */

import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
