import { forwardRef, InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={`
            w-4 h-4 rounded border-gray-300 text-blue-600
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {label && (
          <span className="text-sm text-gray-700">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
