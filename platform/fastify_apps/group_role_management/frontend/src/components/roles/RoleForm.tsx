/**
 * RoleForm Component
 * Create and edit roles with full validation
 * Based on REQ.v002.md Section 2.1 (Role Management)
 * Implements FR-RM-001 (Real-time validation) and FR-RM-002 (Unsaved changes warning)
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardContent } from '@/components/ui';
import { GroupAssignment } from './GroupAssignment';
import { LabelManager } from './LabelManager';
import { RoleIconPicker } from './RoleIconPicker';
import { ActionAssignment } from '@/components/shared/ActionAssignment';
import { RestrictionAssignment } from '@/components/shared/RestrictionAssignment';
import type { Role, RoleIconType } from '@/types';

// Validation schema based on REQ.v002.md Section 4.1
const roleFormSchema = z.object({
  name: z.
  string().
  min(3, 'Role name must be at least 3 characters').
  max(50, 'Role name must be at most 50 characters').
  regex(/^[a-zA-Z0-9\s-_]+$/, 'Role name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.
  string().
  min(10, 'Description must be at least 10 characters').
  max(200, 'Description must be at most 200 characters'),
  icon: z.string().min(1, 'Please select an icon'),
  labels: z.array(z.string()).max(10, 'Maximum 10 labels allowed'),
  groups: z.array(z.string()).min(1, 'At least one group must be assigned'),
  actions: z.array(z.string()),
  restrictions: z.array(z.string())
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  role?: Role; // If editing
  onSubmit: (data: RoleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RoleForm({ role, onSubmit, onCancel, isLoading = false }: RoleFormProps) {
  const isEditMode = !!role;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Initialize form with react-hook-form + zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid }
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    mode: 'onChange', // Real-time validation (FR-RM-001)
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      icon: role?.icon || 'shield',
      labels: role?.labels || [],
      groups: role?.groups || [],
      actions: role?.actions || [],
      restrictions: role?.restrictions || []
    }
  });

  // Watch all fields to detect changes
  const watchedFields = watch();

  // Track unsaved changes (FR-RM-002)
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleFormSubmit = async (data: RoleFormData) => {
    try {
      await onSubmit(data);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      onCancel();
    }
  };

  const confirmCancel = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedWarning(false);
    onCancel();
  };

  return (
    <div className="space-y-6">
      {/* Unsaved Changes Warning Banner */}
      {hasUnsavedChanges &&
      <div className="bg-warning-50 border border-warning-300 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning-900">You have unsaved changes</p>
            <p className="text-sm text-warning-700 mt-1">
              Your changes will be lost if you navigate away without saving.
            </p>
          </div>
        </div>
      }

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedWarning &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Discard unsaved changes?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You have unsaved changes. Are you sure you want to discard them?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowUnsavedWarning(false)}>
                Continue Editing
              </Button>
              <Button variant="danger" size="sm" onClick={confirmCancel}>
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      }

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <Card data-test-id="card-ab713d6f">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Edit Role' : 'Create New Role'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Update role information' : 'Fill in the details to create a new role'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Role Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name <span className="text-danger-600">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Admin, Editor, Viewer"
                  {...register('name')}
                  error={errors.name?.message} />

                <p className="text-xs text-gray-500 mt-1">
                  3-50 characters, letters, numbers, spaces, hyphens, and underscores only
                </p>
              </div>

              {/* Role Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-danger-600">*</span>
                </label>
                <textarea
                  id="description"
                  placeholder="Describe the purpose and responsibilities of this role..."
                  {...register('description')}
                  rows={3}
                  className={`
                    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none
                    ${errors.description ? 'border-danger-500' : 'border-gray-300'}
                  `} />

                {errors.description &&
                <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                }
                <p className="text-xs text-gray-500 mt-1">
                  10-200 characters, be clear and concise
                </p>
              </div>

              {/* Role Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon <span className="text-danger-600">*</span>
                </label>
                <RoleIconPicker
                  selectedIcon={watchedFields.icon as RoleIconType}
                  onChange={(icon) => setValue('icon', icon, { shouldDirty: true, shouldValidate: true })} />

                {errors.icon &&
                <p className="mt-1 text-sm text-danger-600">{errors.icon.message}</p>
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Assignment Card */}
        <Card data-test-id="card-e82b87b8">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Assign Groups <span className="text-danger-600" data-test-id="span-0f6880c7">*</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Select which groups this role should be assigned to
            </p>
          </CardHeader>
          <CardContent>
            <GroupAssignment
              selectedGroups={watchedFields.groups}
              onChange={(groups) => setValue('groups', groups, { shouldDirty: true, shouldValidate: true })} />

            {errors.groups &&
            <p className="mt-2 text-sm text-danger-600">{errors.groups.message}</p>
            }
          </CardContent>
        </Card>

        {/* Label Management Card */}
        <Card data-test-id="card-64874797">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Labels</h3>
            <p className="text-sm text-gray-500 mt-1">
              Add labels to categorize and organize this role (optional)
            </p>
          </CardHeader>
          <CardContent>
            <LabelManager
              selectedLabels={watchedFields.labels}
              onChange={(labels) => setValue('labels', labels, { shouldDirty: true, shouldValidate: true })}
              maxLabels={10} />

            {errors.labels &&
            <p className="mt-2 text-sm text-danger-600">{errors.labels.message}</p>
            }
          </CardContent>
        </Card>

        {/* Action Assignment Card */}
        <Card data-test-id="card-c3cddae3">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            <p className="text-sm text-gray-500 mt-1">
              Assign actions to define what this role can do (optional)
            </p>
          </CardHeader>
          <CardContent>
            <ActionAssignment
              selectedActions={watchedFields.actions}
              onChange={(actions) => setValue('actions', actions, { shouldDirty: true, shouldValidate: true })} />

          </CardContent>
        </Card>

        {/* Restriction Assignment Card */}
        <Card data-test-id="card-ed38e985">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Restrictions</h3>
            <p className="text-sm text-gray-500 mt-1">
              Assign restrictions to define limits for this role (optional)
            </p>
          </CardHeader>
          <CardContent>
            <RestrictionAssignment
              selectedRestrictions={watchedFields.restrictions}
              onChange={(restrictions) => setValue('restrictions', restrictions, { shouldDirty: true, shouldValidate: true })} />

          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200" data-test-id="div-51a10a91">
          <div className="text-sm text-gray-500">
            {!isValid && Object.keys(errors).length > 0 &&
            <span className="text-danger-600">
                Please fix {Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 's' : ''} before saving
              </span>
            }
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="md" onClick={handleCancel} disabled={isLoading}>
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={isLoading} disabled={!isValid}>
              <Save className="w-4 h-4" />
              {isEditMode ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </div>
      </form>
    </div>);

}