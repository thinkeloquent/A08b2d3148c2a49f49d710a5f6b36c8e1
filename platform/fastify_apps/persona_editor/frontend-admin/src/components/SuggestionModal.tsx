/**
 * SuggestionModal
 * Displays an AI-generated suggestion with Apply/Cancel actions
 */

import { Loader2 } from 'lucide-react';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
  suggestion: string;
  isLoading: boolean;
  title: string;
  fieldLabel: string;
}

export function SuggestionModal({
  isOpen,
  onClose,
  onApply,
  suggestion,
  isLoading,
  title,
  fieldLabel,
}: SuggestionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Generating {fieldLabel.toLowerCase()}...</span>
          </div>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suggested {fieldLabel}
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {suggestion}
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading || !suggestion}
            onClick={() => onApply(suggestion)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
