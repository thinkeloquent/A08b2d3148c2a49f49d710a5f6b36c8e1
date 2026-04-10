/**
 * EntityForm - Generic create/edit form component
 * Works for any entity type with configuration
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { BaseEntity } from '@/types';
import type { EntityConfig } from '@/config/entityConfigs';
import { Modal, ModalFooter, Input, Textarea, Button } from '@/components/ui';
import type { ZodSchema } from 'zod';

export interface EntityFormProps<T extends BaseEntity> {
  entity?: T; // If editing
  config: EntityConfig<any>;
  schema: ZodSchema<any>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  isSubmitting?: boolean;
  error?: Error | null;
  parentEntities?: BaseEntity[]; // For parent selector
  defaultParentId?: string; // Pre-selected parent
}

export function EntityForm<T extends BaseEntity>({
  entity,
  config,
  schema,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
  parentEntities,
  defaultParentId
}: EntityFormProps<T>) {
  const isEditing = !!entity;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: entity ?
    entity as any :
    {
      status: 'active',
      ...(config.parent && { [config.parent.idKey as string]: defaultParentId || '' }),
      metadata: {}
    }
  });

  // Reset form when modal opens/closes or entity changes
  useEffect(() => {
    if (isOpen) {
      // Modal is opening - populate with entity data or defaults
      if (entity) {
        // Edit mode - populate with entity values
        reset({
          name: entity.name,
          description: entity.description || '',
          status: entity.status,
          ...(config.parent && { [config.parent.idKey as string]: (entity as any)[config.parent.idKey] }),
          metadata: entity.metadata || {}
        });
      } else {
        // Create mode - use defaults
        reset({
          status: 'active',
          ...(config.parent && { [config.parent.idKey as string]: defaultParentId || '' }),
          metadata: {}
        });
      }
    } else {
      // Modal is closing - clear form
      reset();
    }
  }, [isOpen, entity, reset, config.parent, defaultParentId]);

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  const onFormSubmit = async (data: any) => {
    console.log("onFormSubmit");
    try {
      console.log(`[EntityForm] Submitting ${isEditing ? 'update' : 'create'} for ${config.label.singular}:`, data);
      await onSubmit(data);
      console.log(`[EntityForm] Successfully submitted ${config.label.singular}`);
    } catch (error) {
      console.error(`[EntityForm] Error submitting ${config.label.singular}:`, error);
      // Error is handled by parent component through mutation.error
      // Don't swallow it - let it propagate
      throw error;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? `Edit ${config.label.singular}` : `Create ${config.label.singular}`}
      size="md"
      data-testid="entity-form-modal">

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" data-testid="entity-form">
        {/* Parent selector (if not root entity) */}
        {config.parent && parentEntities &&
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Parent {config.parent.label.singular}
              <span className="ml-1 text-red-500">*</span>
            </label>
            <select
            {...register(config.parent.idKey as any)}
            disabled={isSubmitting || isEditing}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50">

              <option value="">Select a {config.parent.label.singular}</option>
              {parentEntities.map((parent) =>
            <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
            )}
            </select>
            {(errors as any)[config.parent.idKey] &&
          <p className="mt-1 text-sm text-red-600">
                {(errors as any)[config.parent.idKey]?.message}
              </p>
          }
            {isEditing &&
          <p className="mt-1 text-xs text-gray-500">
                Parent cannot be changed after creation
              </p>
          }
          </div>
        }

        {/* Name */}
        <Input
          label="Name"
          required
          {...register('name' as any)}
          error={(errors as any).name?.message}
          placeholder={`Enter ${config.label.singular.toLowerCase()} name`}
          disabled={isSubmitting}
          data-testid="name-input" data-test-id="input-fa5fa9d6" />


        {/* Description */}
        <Textarea
          label="Description"
          {...register('description' as any)}
          error={(errors as any).description?.message}
          placeholder={`Describe this ${config.label.singular.toLowerCase()}...`}
          maxLength={500}
          showCharCount
          maxCharCount={500}
          disabled={isSubmitting}
          data-testid="description-input" data-test-id="textarea-45067075" />


        {/* Status */}
        <div data-test-id="div-719c39ad">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Status
            <span className="ml-1 text-red-500">*</span>
          </label>
          <select
            {...register('status' as any)}
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50"
            data-testid="status-select">

            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
          {(errors as any).status &&
          <p className="mt-1 text-sm text-red-600">{(errors as any).status.message}</p>
          }
        </div>

        {/* Error message */}
        {error &&
        <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-800">
              {error.message || 'An error occurred. Please try again.'}
            </p>
          </div>
        }

        {/* Actions */}
        <ModalFooter data-test-id="modalfooter-67285953">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting} data-testid="cancel-button">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} data-testid="submit-button">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>);

}