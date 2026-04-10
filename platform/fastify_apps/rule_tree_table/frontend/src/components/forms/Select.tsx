import { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          w-full px-3 py-2.5 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent
          disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400
          transition-colors
          ${error
            ? 'border-red-300 focus:ring-red-400'
            : 'border-slate-200 hover:border-slate-300'
          }
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
