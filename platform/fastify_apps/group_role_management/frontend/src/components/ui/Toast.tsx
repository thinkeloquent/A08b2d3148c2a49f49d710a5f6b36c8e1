/**
 * Toast Component
 * Notification toast with different variants
 * Based on REQ.v002.md Section 6.2 (Notifications)
 */

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
    textColor: 'text-success-900',
    iconColor: 'text-success-600',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-danger-50',
    borderColor: 'border-danger-200',
    textColor: 'text-danger-900',
    iconColor: 'text-danger-600',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-200',
    textColor: 'text-warning-900',
    iconColor: 'text-warning-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
  },
};

export function Toast({ id, variant, title, message, duration = 3000, onClose }: ToastProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${config.bgColor} ${config.borderColor}
        animate-in slide-in-from-right fade-in duration-300
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${config.textColor}`}>{title}</p>
        {message && (
          <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>{message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className={`flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors ${config.textColor}`}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
