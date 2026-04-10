/**
 * DeleteConfirmationDialog Component
 * Confirmation dialog for deleting entities with child count warnings
 */

import type { Organization } from '@/types';
import { Modal, ModalFooter, Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import { useDeleteOrganization } from '@/hooks/useOrganizations';

export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  onSuccess?: () => void;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  organization,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const deleteMutation = useDeleteOrganization();

  if (!organization) return null;

  const hasChildren = organization.workspaceCount > 0;

  const handleDelete = async () => {
    if (hasChildren) return; // Prevent deletion if has children

    try {
      await deleteMutation.mutateAsync(organization.id);
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
          Delete {organization.name}?
        </h3>

        <p className="mb-4 text-sm text-gray-600">
          This action cannot be undone.
        </p>

        {hasChildren && (
          <div className="mb-4 rounded-md bg-yellow-50 p-3 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              This organization has{' '}
              <span className="font-semibold">{organization.workspaceCount}</span>{' '}
              {organization.workspaceCount === 1 ? 'workspace' : 'workspaces'}.
              Please delete or move {organization.workspaceCount === 1 ? 'it' : 'them'} first.
            </p>
          </div>
        )}

        {deleteMutation.isError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-800">
              {deleteMutation.error?.message || 'Failed to delete organization'}
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
