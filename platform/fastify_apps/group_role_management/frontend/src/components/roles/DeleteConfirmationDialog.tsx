/**
 * DeleteConfirmationDialog Component
 * Confirmation modal for deleting roles
 * Based on REQ.v002.md Section 2.1 (Role Management)
 */

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Role } from '@/types';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  role: Role | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  role,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="relative w-full max-w-md bg-white rounded-lg shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-danger-100 p-3 rounded-full">
              <AlertTriangle className="w-8 h-8 text-danger-600" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Delete Role?
          </h3>

          {/* Description */}
          <div className="space-y-3 mb-6">
            <p className="text-sm text-gray-600 text-center">
              Are you sure you want to delete the role{' '}
              <span className="font-semibold text-gray-900">"{role.name}"</span>?
            </p>

            {/* Impact Warning */}
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
              <p className="text-sm text-danger-800 font-medium mb-1">
                This action will:
              </p>
              <ul className="text-sm text-danger-700 space-y-1 ml-4 list-disc">
                <li>Remove this role from all {role.groups.length} assigned group{role.groups.length !== 1 ? 's' : ''}</li>
                <li>Remove all associated labels and metadata</li>
                <li>Cannot be undone</li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 text-center">
              If you're not sure, you can archive the role instead of deleting it.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={onConfirm}
              loading={isLoading}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete Role
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
