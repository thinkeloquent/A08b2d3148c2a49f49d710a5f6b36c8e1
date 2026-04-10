/**
 * EntityDeleteDialog - Generic delete confirmation dialog
 * Works for any entity type with configuration
 */

import type { BaseEntity } from '@/types';
import type { EntityConfig } from '@/config/entityConfigs';
import { Modal, ModalFooter, Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';

export interface EntityDeleteDialogProps<T extends BaseEntity> {
  entity: T | null;
  config: EntityConfig<any>;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
  error?: Error | null;
}

export function EntityDeleteDialog<T extends BaseEntity>({
  entity,
  config,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  error = null,
}: EntityDeleteDialogProps<T>) {
  if (!entity) return null;

  const childCount = config.child ? ((entity as any)[config.child.countKey] as number) : 0;
  const hasChildren = childCount > 0;

  const handleDelete = async () => {
    if (hasChildren) return; // Prevent deletion if has children
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Delete {entity.name}?
        </h3>

        <p className="mb-4 text-sm text-gray-600">
          This action cannot be undone.
        </p>

        {hasChildren && config.child && (
          <div className="mb-4 rounded-md bg-yellow-50 p-3 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              This {config.label.singular.toLowerCase()} has{' '}
              <span className="font-semibold">{childCount}</span>{' '}
              {childCount === 1 ? config.child.label.singular : config.child.label.plural}.
              Please delete or move {childCount === 1 ? 'it' : 'them'} first.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-800">
              {error.message || `Failed to delete ${config.label.singular.toLowerCase()}`}
            </p>
          </div>
        )}

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={hasChildren}
            loading={isDeleting}
          >
            Delete
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
