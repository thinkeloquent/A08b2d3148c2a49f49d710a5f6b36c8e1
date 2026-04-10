/**
 * Button Component
 * Reusable button with multiple variants, sizes, and states
 * Based on: REQ.v002.jsx Section 7 (UX-003)
 */

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',

          // Variants
          {
            'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500':
              variant === 'primary',
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500':
              variant === 'secondary',
            'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500':
              variant === 'danger',
            'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500':
              variant === 'ghost',
          },

          // Sizes
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-base': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },

          className
        )}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
