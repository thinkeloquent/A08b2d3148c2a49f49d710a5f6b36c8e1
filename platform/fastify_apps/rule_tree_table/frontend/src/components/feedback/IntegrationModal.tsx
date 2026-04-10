import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plug } from 'lucide-react';
import type { RuleItem } from '../../types/rule.types';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RuleItem | null;
}

export function IntegrationModal({ isOpen, onClose, item }: IntegrationModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="integration-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Plug className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h2 id="integration-dialog-title" className="text-base font-semibold text-slate-900">
                Integrations
              </h2>
              <p className="text-xs text-slate-400">{item.id.substring(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — placeholder */}
        <div className="px-6 py-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Plug className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500">No integrations configured</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
            Connect external services such as Jira, Datadog, or Slack to this rule item.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 bg-slate-50/80 rounded-b-2xl border-t border-slate-100">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
