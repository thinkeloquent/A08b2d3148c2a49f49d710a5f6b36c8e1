import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const confirmButtonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-400',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-400',
    default: 'bg-accent-600 hover:bg-accent-700 focus:ring-accent-400',
  };

  const iconStyles = {
    danger: 'bg-red-50 text-red-500',
    warning: 'bg-amber-50 text-amber-500',
    default: 'bg-accent-50 text-accent-500',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconStyles[variant]}`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3
                  id="dialog-title"
                  className="text-base font-semibold text-slate-900"
                >
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-slate-300 hover:text-slate-500 disabled:opacity-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50/80 rounded-b-2xl border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`btn text-white disabled:opacity-50 ${confirmButtonStyles[variant]}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
