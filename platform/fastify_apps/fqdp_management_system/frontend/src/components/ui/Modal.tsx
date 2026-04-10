/**
 * Modal Component
 * Dialog modal with backdrop, ESC key support, and multiple sizes
 * Based on: REQ.v002.jsx Section 7 (UX-007)
 */

import { useEffect } from 'react';
import type { HTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  className,
  children,
  ...props
}: ModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-40 bg-black/50 transition-opacity"
        onClick={() => closeOnBackdrop && onClose()}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative z-50 w-full rounded-lg bg-white shadow-lg',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          {
            'max-w-sm': size === 'sm',
            'max-w-2xl': size === 'md',
            'max-w-4xl': size === 'lg',
            'max-w-6xl': size === 'xl',
          },
          'mx-4 max-h-[90vh] overflow-auto',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        {...props}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h2 id="modal-title" className="text-xl font-semibold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={cn('p-6', title && 'pt-4')}>{children}</div>
      </div>
    </div>
  );
}

export type ModalHeaderProps = HTMLAttributes<HTMLDivElement>;

export function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export type ModalFooterProps = HTMLAttributes<HTMLDivElement>;

export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn('mt-6 flex items-center justify-end space-x-3', className)}
      {...props}
    />
  );
}
