/**
 * DeleteConfirmationDialog Component for Workspaces
 * Confirmation dialog for deleting workspaces with team count warnings
 */

import type { Workspace } from '@/types';
import { Modal, ModalFooter, Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import { useDeleteWorkspace } from '@/hooks/useWorkspaces';

export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace | null;
  onSuccess?: () => void;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  workspace,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const deleteMutation = useDeleteWorkspace();

  if (!workspace) return null;

  const hasChildren = workspace.teamCount > 0;

  const handleDelete = async () => {
    if (hasChildren) return; // Prevent deletion if has children

    try {
      await deleteMutation.mutateAsync(workspace.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Delete {workspace.name}?
        </h3>

        <p className="mb-4 text-sm text-gray-600">
          This action cannot be undone.
        </p>

        {hasChildren && (
          <div className="mb-4 rounded-md bg-yellow-50 p-3 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              This workspace has{' '}
              <span className="font-semibold">{workspace.teamCount}</span>{' '}
              {workspace.teamCount === 1 ? 'team' : 'teams'}.
              Please delete or move {workspace.teamCount === 1 ? 'it' : 'them'} first.
            </p>
          </div>
        )}

        {deleteMutation.isError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-800">
              {deleteMutation.error?.message || 'Failed to delete workspace'}
            </p>
          </div>
        )}

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={hasChildren}
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
