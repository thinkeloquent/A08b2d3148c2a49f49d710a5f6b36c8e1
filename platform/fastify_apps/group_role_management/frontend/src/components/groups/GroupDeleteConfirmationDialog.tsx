/**
 * GroupDeleteConfirmationDialog Component
 * Confirmation modal for deleting groups
 * Based on REQ.v002.md Section 3 (Group Management)
 */

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Group } from '@/types';

interface GroupDeleteConfirmationDialogProps {
  isOpen: boolean;
  group: Group | null;
  roleCount: number; // Number of roles using this group
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GroupDeleteConfirmationDialog({
  isOpen,
  group,
  roleCount,
  onConfirm,
  onCancel,
  isLoading = false,
}: GroupDeleteConfirmationDialogProps) {
  if (!isOpen || !group) return null;

  const canDelete = roleCount === 0;

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
            <div className={`p-3 rounded-full ${canDelete ? 'bg-danger-100' : 'bg-warning-100'}`}>
              <AlertTriangle className={`w-8 h-8 ${canDelete ? 'text-danger-600' : 'text-warning-600'}`} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {canDelete ? 'Delete Group?' : 'Cannot Delete Group'}
          </h3>

          {/* Description */}
          <div className="space-y-3 mb-6">
            {canDelete ? (
              <>
                <p className="text-sm text-gray-600 text-center">
                  Are you sure you want to delete the group{' '}
                  <span className="font-semibold text-gray-900">"{group.name}"</span>?
                </p>

                {/* Impact Warning */}
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                  <p className="text-sm text-danger-800 font-medium mb-1">
                    This action will:
                  </p>
                  <ul className="text-sm text-danger-700 space-y-1 ml-4 list-disc">
                    <li>Permanently delete this group</li>
                    <li>Remove all associated metadata</li>
                    <li>Cannot be undone</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 text-center">
                  This group cannot be deleted because it is currently assigned to{' '}
                  <span className="font-semibold text-gray-900">{roleCount} role{roleCount !== 1 ? 's' : ''}</span>.
                </p>

                {/* Cannot Delete Warning */}
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <p className="text-sm text-warning-800 font-medium mb-1">
                    Before deleting:
                  </p>
                  <ul className="text-sm text-warning-700 space-y-1 ml-4 list-disc">
                    <li>Remove this group from all {roleCount} role{roleCount !== 1 ? 's' : ''}</li>
                    <li>Or reassign the roles to a different group</li>
                  </ul>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  You can edit roles in the Role Management section to remove this group assignment.
                </p>
              </>
            )}
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
              {canDelete ? 'Cancel' : 'Close'}
            </Button>
            {canDelete && (
              <Button
                variant="danger"
                size="md"
                onClick={onConfirm}
                loading={isLoading}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete Group
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
