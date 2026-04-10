import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxCharCount?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, showCharCount = false, maxCharCount, className, required, value, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          className={cn(
            'w-full rounded-md border border-gray-300 px-3 py-2 text-base',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
            'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50',
            'placeholder:text-gray-400',
            'min-h-[100px] resize-y',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        <div className="mt-1 flex items-center justify-between">
          <div className="flex-1">
            {error && (
              <div className="flex items-center text-sm text-red-600">
                <AlertCircle className="mr-1 h-4 w-4" />
                {error}
              </div>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
          {showCharCount && (
            <span className="ml-2 text-sm text-gray-500">
              {currentLength}{maxCharCount && `/${maxCharCount}`}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
