/**
 * TeamForm Component
 * Form for creating and editing teams with workspace selector and validation
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Team, CreateTeamDTO } from '@/types';
import { CreateTeamSchema, generateSlug } from '@/utils/validators';
import { useCreateTeam, useUpdateTeam } from '@/hooks/useTeams';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Modal, ModalFooter, Input, Textarea, Button } from '@/components/ui';
import { z } from 'zod';

type FormData = z.infer<typeof CreateTeamSchema>;

export interface TeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  team?: Team;
  onSuccess?: () => void;
  defaultWorkspaceId?: string; // Pre-select workspace when creating
}

export function TeamForm({
  isOpen,
  onClose,
  team,
  onSuccess,
  defaultWorkspaceId
}: TeamFormProps) {
  const isEditing = !!team;

  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const { data: workspacesData } = useWorkspaces();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(CreateTeamSchema),
    defaultValues: team ?
    {
      name: team.name,
      slug: team.slug,
      description: team.description || '',
      status: team.status,
      workspaceId: team.workspaceId,
      organizationId: team.organizationId,
      metadata: team.metadata || {}
    } :
    {
      status: 'work-in-progress',
      workspaceId: defaultWorkspaceId || '',
      organizationId: '',
      metadata: {}
    }
  });

  // Reset form when modal closes or team changes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Auto-fill organizationId when workspace is selected
  const selectedWorkspaceId = watch('workspaceId');
  useEffect(() => {
    if (selectedWorkspaceId && workspacesData?.data) {
      const workspace = workspacesData.data.find((w) => w.id === selectedWorkspaceId);
      if (workspace) {
        setValue('organizationId', workspace.organizationId);
      }
    }
  }, [selectedWorkspaceId, workspacesData, setValue]);

  // Auto-generate slug from name (only for new teams)
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
          id: team.id,
          updates: data
        });
      } else {
        await createMutation.mutateAsync(data as CreateTeamDTO);
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
      title={isEditing ? 'Edit Team' : 'Create Team'}
      size="md">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Workspace selector (disabled when editing) */}
        <div data-test-id="div-ebda391b">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Parent Workspace
            <span className="ml-1 text-red-500">*</span>
          </label>
          <select
            {...register('workspaceId')}
            disabled={isSubmitting || isEditing}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50">

            <option value="">Select a workspace</option>
            {workspacesData?.data.map((ws) =>
            <option key={ws.id} value={ws.id}>
                {ws.name} ({ws.organizationName})
              </option>
            )}
          </select>
          {errors.workspaceId &&
          <p className="mt-1 text-sm text-red-600">{errors.workspaceId.message}</p>
          }
          {isEditing &&
          <p className="mt-1 text-xs text-gray-500">
              Workspace cannot be changed after creation
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
          placeholder="Enter team name"
          disabled={isSubmitting} data-test-id="input-06d8e092" />


        {/* Slug */}
        <Input
          label="Slug"
          required
          {...register('slug')}
          error={errors.slug?.message}
          helperText="URL-safe identifier (lowercase, hyphens only)"
          placeholder="team-slug"
          disabled={isSubmitting} data-test-id="input-39dd1077" />


        {/* Description */}
        <Textarea
          label="Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Describe this team..."
          maxLength={500}
          showCharCount
          maxCharCount={500}
          disabled={isSubmitting} data-test-id="textarea-5305fcb2" />


        {/* Status */}
        <div data-test-id="div-a1903469">
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
        <ModalFooter data-test-id="modalfooter-c9a3d6f4">
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