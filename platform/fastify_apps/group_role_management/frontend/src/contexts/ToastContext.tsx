/**
 * Toast Context & Provider
 * Global toast notification management
 * Based on REQ.v002.md Section 6.2 (Notifications)
 */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Toast, type ToastVariant } from '@/components/ui/Toast';

interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastData = { id, ...toast };

    setToasts(prev => {
      // Limit to 3 visible toasts at a time
      const updated = [...prev, newToast];
      return updated.slice(-3);
    });
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addToast({ variant: 'success', title, message, duration: 3000 });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ variant: 'error', title, message, duration: 0 }); // Manual dismiss for errors
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ variant: 'warning', title, message, duration: 5000 });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ variant: 'info', title, message, duration: 4000 });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-md pointer-events-none">
        <div className="pointer-events-auto space-y-2">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              id={toast.id}
              variant={toast.variant}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
