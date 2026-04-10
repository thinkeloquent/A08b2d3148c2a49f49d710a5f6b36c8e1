/**
 * LabelForm Component
 * Create and edit labels with validation
 * Based on REQ.v002.md Section 4 (Label System)
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, AlertCircle, Check } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardContent, Badge } from '@/components/ui';
import type { Label, LabelColor } from '@/types';

// Validation schema based on REQ.v002.md
const labelFormSchema = z.object({
  name: z.
  string().
  min(2, 'Label name must be at least 2 characters').
  max(30, 'Label name must be at most 30 characters').
  regex(/^[a-zA-Z0-9\s-_]+$/, 'Label name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.
  string().
  max(100, 'Description must be at most 100 characters').
  optional(),
  color: z.string().min(1, 'Please select a color')
});

type LabelFormData = z.infer<typeof labelFormSchema>;

interface LabelFormProps {
  label?: Label; // If editing
  onSubmit: (data: LabelFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AVAILABLE_COLORS: Array<{value: LabelColor;label: string;}> = [
{ value: 'red', label: 'Red' },
{ value: 'orange', label: 'Orange' },
{ value: 'yellow', label: 'Yellow' },
{ value: 'green', label: 'Green' },
{ value: 'cyan', label: 'Cyan' },
{ value: 'blue', label: 'Blue' },
{ value: 'indigo', label: 'Indigo' },
{ value: 'purple', label: 'Purple' },
{ value: 'pink', label: 'Pink' },
{ value: 'gray', label: 'Gray' }];


export function LabelForm({ label, onSubmit, onCancel, isLoading = false }: LabelFormProps) {
  const isEditMode = !!label;
  const isPredefined = label && !label.customCreated;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Initialize form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid }
  } = useForm<LabelFormData>({
    resolver: zodResolver(labelFormSchema),
    mode: 'onChange', // Real-time validation
    defaultValues: {
      name: label?.name || '',
      description: label?.description || '',
      color: label?.color || 'gray'
    }
  });

  const selectedColor = watch('color');

  // Track unsaved changes
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

  const handleFormSubmit = async (data: LabelFormData) => {
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

      {/* Predefined Label Info */}
      {isPredefined &&
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Editing Predefined Label</p>
            <p className="text-sm text-blue-700 mt-1">
              You can change the color and description, but the name cannot be modified.
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
        <Card data-test-id="card-f01c01f2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Edit Label' : 'Create New Label'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Update label information' : 'Fill in the details to create a new label'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Label Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Label Name <span className="text-danger-600">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Critical, Important, Documentation"
                  {...register('name')}
                  error={errors.name?.message}
                  disabled={isPredefined} />

                <p className="text-xs text-gray-500 mt-1">
                  2-30 characters, letters, numbers, spaces, hyphens, and underscores only
                </p>
              </div>

              {/* Label Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="description"
                  placeholder="Describe when to use this label..."
                  {...register('description')}
                  rows={2}
                  className={`
                    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none
                    ${errors.description ? 'border-danger-500' : 'border-gray-300'}
                  `} />

                {errors.description &&
                <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                }
                <p className="text-xs text-gray-500 mt-1">
                  Up to 100 characters
                </p>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color <span className="text-danger-600">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_COLORS.map(({ value, label: colorLabel }) => {
                    const isSelected = selectedColor === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue('color', value, { shouldDirty: true, shouldValidate: true })}
                        className="relative">

                        <Badge
                          variant={value}
                          size="md"
                          className={`w-full justify-center transition-all ${
                          isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`
                          }>

                          {colorLabel}
                          {isSelected && <Check className="w-3 h-3 ml-1" />}
                        </Badge>
                      </button>);

                  })}
                </div>
                {errors.color &&
                <p className="mt-2 text-sm text-danger-600">{errors.color.message}</p>
                }
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Badge variant={selectedColor as LabelColor} size="lg">
                    {watch('name') || 'Label Preview'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200" data-test-id="div-8b54fb0c">
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
              {isEditMode ? 'Save Changes' : 'Create Label'}
            </Button>
          </div>
        </div>
      </form>
    </div>);

}