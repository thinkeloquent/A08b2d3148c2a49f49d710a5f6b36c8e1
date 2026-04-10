/**
 * WorkspaceForm Component
 * Form for creating and editing workspaces with organization selector and validation
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Workspace, CreateWorkspaceDTO } from '@/types';
import { CreateWorkspaceSchema, generateSlug } from '@/utils/validators';
import { useCreateWorkspace, useUpdateWorkspace } from '@/hooks/useWorkspaces';
import { useOrganizations } from '@/hooks/useOrganizations';
import { Modal, ModalFooter, Input, Textarea, Button } from '@/components/ui';
import { z } from 'zod';

type FormData = z.infer<typeof CreateWorkspaceSchema>;

export interface WorkspaceFormProps {
  isOpen: boolean;
  onClose: () => void;
  workspace?: Workspace;
  onSuccess?: () => void;
  defaultOrganizationId?: string; // Pre-select organization when creating
}

export function WorkspaceForm({
  isOpen,
  onClose,
  workspace,
  onSuccess,
  defaultOrganizationId
}: WorkspaceFormProps) {
  const isEditing = !!workspace;

  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace();
  const { data: orgsData } = useOrganizations();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(CreateWorkspaceSchema),
    defaultValues: workspace ?
    {
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description || '',
      status: workspace.status,
      organizationId: workspace.organizationId,
      metadata: workspace.metadata || {}
    } :
    {
      status: 'work-in-progress',
      organizationId: defaultOrganizationId || '',
      metadata: {}
    }
  });

  // Reset form when modal closes or workspace changes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Auto-generate slug from name (only for new workspaces)
  const name = watch('name');
  const handleNameBlur = () => {
    if (!isEditing && name && !watch('slug')) {
      setValue('slug', generateSlug(name), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: workspace.id,
          updates: data
        });
      } else {
        await createMutation.mutateAsync(data as CreateWorkspaceDTO);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Workspace' : 'Create Workspace'}
      size="md">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Organization selector (disabled when editing) */}
        <div data-test-id="div-ab09b762">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Parent Organization
            <span className="ml-1 text-red-500">*</span>
          </label>
          <select
            {...register('organizationId')}
            disabled={isSubmitting || isEditing}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50">

            <option value="">Select an organization</option>
            {orgsData?.data.map((org) =>
            <option key={org.id} value={org.id}>
                {org.name}
              </option>
            )}
          </select>
          {errors.organizationId &&
          <p className="mt-1 text-sm text-red-600">{errors.organizationId.message}</p>
          }
          {isEditing &&
          <p className="mt-1 text-xs text-gray-500">
              Organization cannot be changed after creation
            </p>
          }
        </div>

        {/* Name */}
        <Input
          label="Name"
          required
          {...register('name')}
          onBlur={handleNameBlur}
          error={errors.name?.message}
          placeholder="Enter workspace name"
          disabled={isSubmitting} data-test-id="input-cf10d489" />


        {/* Slug */}
        <Input
          label="Slug"
          required
          {...register('slug')}
          error={errors.slug?.message}
          helperText="URL-safe identifier (lowercase, hyphens only)"
          placeholder="workspace-slug"
          disabled={isSubmitting} data-test-id="input-8b24e7ec" />


        {/* Description */}
        <Textarea
          label="Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Describe this workspace..."
          maxLength={500}
          showCharCount
          maxCharCount={500}
          disabled={isSubmitting} data-test-id="textarea-940afd6f" />


        {/* Status */}
        <div data-test-id="div-198b17aa">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Status
            <span className="ml-1 text-red-500">*</span>
          </label>
          <select
            {...register('status')}
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50">

            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="work-in-progress">Work in Progress</option>
            <option value="archive">Archive</option>
            <option value="locked">Locked</option>
            <option value="frozen">Frozen</option>
          </select>
          {errors.status &&
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          }
        </div>

        {/* Error message */}
        {(createMutation.isError || updateMutation.isError) &&
        <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-800">
              {createMutation.error?.message ||
            updateMutation.error?.message ||
            'An error occurred. Please try again.'}
            </p>
          </div>
        }

        {/* Actions */}
        <ModalFooter data-test-id="modalfooter-f163820c">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>);

}