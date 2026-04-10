/**
 * OrganizationForm Component
 * Form for creating and editing organizations with validation
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Organization, CreateOrganizationDTO } from '@/types';
import { CreateOrganizationSchema, generateSlug } from '@/utils/validators';
import { useCreateOrganization, useUpdateOrganization } from '@/hooks/useOrganizations';
import { Modal, ModalFooter, Input, Textarea, Button } from '@/components/ui';
import { z } from 'zod';

type FormData = z.infer<typeof CreateOrganizationSchema>;

export interface OrganizationFormProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: Organization;
  onSuccess?: () => void;
}

export function OrganizationForm({
  isOpen,
  onClose,
  organization,
  onSuccess
}: OrganizationFormProps) {
  const isEditing = !!organization;

  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues: organization ?
    {
      name: organization.name,
      slug: organization.slug,
      description: organization.description || '',
      status: organization.status,
      metadata: organization.metadata || {}
    } :
    {
      status: 'work-in-progress',
      metadata: {}
    }
  });

  // Reset form when modal closes or organization changes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Auto-generate slug from name (only for new organizations)
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
          id: organization.id,
          updates: data
        });
      } else {
        await createMutation.mutateAsync(data as CreateOrganizationDTO);
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
      title={isEditing ? 'Edit Organization' : 'Create Organization'}
      size="md">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <Input
          label="Name"
          required
          {...register('name')}
          onBlur={handleNameBlur}
          error={errors.name?.message}
          placeholder="Enter organization name"
          disabled={isSubmitting} data-test-id="input-cf13f51c" />


        {/* Slug */}
        <Input
          label="Slug"
          required
          {...register('slug')}
          error={errors.slug?.message}
          helperText="URL-safe identifier (lowercase, hyphens only)"
          placeholder="organization-slug"
          disabled={isSubmitting} data-test-id="input-2bb7ecf5" />


        {/* Description */}
        <Textarea
          label="Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Describe this organization..."
          maxLength={500}
          showCharCount
          maxCharCount={500}
          disabled={isSubmitting} data-test-id="textarea-2e028555" />


        {/* Status */}
        <div data-test-id="div-7b291f22">
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
        <ModalFooter data-test-id="modalfooter-0a0bba08">
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