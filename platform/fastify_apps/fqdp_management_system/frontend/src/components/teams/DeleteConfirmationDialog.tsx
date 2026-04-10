/**
 * DeleteConfirmationDialog Component for Teams
 * Confirmation dialog for deleting teams with application count warnings
 */

import type { Team } from '@/types';
import { Modal, ModalFooter, Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import { useDeleteTeam } from '@/hooks/useTeams';

export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onSuccess?: () => void;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  team,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const deleteMutation = useDeleteTeam();

  if (!team) return null;

  const hasChildren = team.applicationCount > 0;

  const handleDelete = async () => {
    if (hasChildren) return; // Prevent deletion if has children

    try {
      await deleteMutation.mutateAsync(team.id);
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
          Delete {team.name}?
        </h3>

        <p className="mb-4 text-sm text-gray-600">
          This action cannot be undone.
        </p>

        {hasChildren && (
          <div className="mb-4 rounded-md bg-yellow-50 p-3 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              This team has{' '}
              <span className="font-semibold">{team.applicationCount}</span>{' '}
              {team.applicationCount === 1 ? 'application' : 'applications'}.
              Please delete or move {team.applicationCount === 1 ? 'it' : 'them'} first.
            </p>
          </div>
        )}

        {deleteMutation.isError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-800">
              {deleteMutation.error?.message || 'Failed to delete team'}
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
