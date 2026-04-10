/**
 * RestrictionForm Component
 * Create and edit restrictions with validation
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardContent } from '@/components/ui';
import type { Restriction } from '@/types';

const restrictionFormSchema = z.object({
  name: z.
  string().
  min(2, 'Restriction name must be at least 2 characters').
  max(50, 'Restriction name must be at most 50 characters').
  regex(/^[a-zA-Z0-9\s-_]+$/, 'Restriction name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.
  string().
  max(200, 'Description must be at most 200 characters').
  optional()
});

type RestrictionFormData = z.infer<typeof restrictionFormSchema>;

interface RestrictionFormProps {
  restriction?: Restriction;
  onSubmit: (data: RestrictionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RestrictionForm({ restriction, onSubmit, onCancel, isLoading = false }: RestrictionFormProps) {
  const isEditMode = !!restriction;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid }
  } = useForm<RestrictionFormData>({
    resolver: zodResolver(restrictionFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: restriction?.name || '',
      description: restriction?.description || ''
    }
  });

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

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

  const handleFormSubmit = async (data: RestrictionFormData) => {
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
        <Card data-test-id="card-250beba4">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Edit Restriction' : 'Create New Restriction'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Update restriction information' : 'Fill in the details to create a new restriction'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Restriction Name <span className="text-danger-600">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., No Delete, Read Only, IP Restricted"
                  {...register('name')}
                  error={errors.name?.message} />

                <p className="text-xs text-gray-500 mt-1">
                  2-50 characters, letters, numbers, spaces, hyphens, and underscores only
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="description"
                  placeholder="Describe what this restriction prevents or limits..."
                  {...register('description')}
                  rows={3}
                  className={`
                    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none
                    ${errors.description ? 'border-danger-500' : 'border-gray-300'}
                  `} />

                {errors.description &&
                <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                }
                <p className="text-xs text-gray-500 mt-1">Up to 200 characters</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200" data-test-id="div-5bcec512">
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
              {isEditMode ? 'Save Changes' : 'Create Restriction'}
            </Button>
          </div>
        </div>
      </form>
    </div>);

}