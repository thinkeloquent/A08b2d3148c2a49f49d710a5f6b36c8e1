/**
 * Select Component
 * Styled select dropdown with React Hook Form support
 */

import { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  hasError?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, hasError, placeholder, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';
