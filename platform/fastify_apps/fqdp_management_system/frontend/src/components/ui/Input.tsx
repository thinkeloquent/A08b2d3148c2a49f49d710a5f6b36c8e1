/**
 * Input Component
 * Reusable text input with label, validation, and error states
 * Based on: REQ.v002.jsx Section 7 (UX-004)
 */

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, required, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={cn(
            'w-full rounded-md border border-gray-300 px-3 py-2 text-base',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
            'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50',
            'placeholder:text-gray-400',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />

        {error && (
          <div
            id={`${props.id}-error`}
            className="mt-1 flex items-center text-sm text-red-600"
          >
            <AlertCircle className="mr-1 h-4 w-4" />
            {error}
          </div>
        )}

        {helperText && !error && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
