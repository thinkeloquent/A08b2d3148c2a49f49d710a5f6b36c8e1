import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { useTag, useCreateTag, useUpdateTag } from '@/hooks';
import { useTagForm } from '@/hooks/useTagForm';
import { FormField, Input } from '@/components/forms';
import { isApiError } from '@/types/errors';
import type { TagFormData } from '@/schemas/tag';

export function TagEditPage() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const {
    data: tagResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useTag(id ? parseInt(id, 10) : 0, {
    enabled: isEditing
  });

  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  const handleSubmit = async (data: TagFormData) => {
    try {
      if (isEditing && id) {
        await updateTag.mutateAsync({
          id: parseInt(id, 10),
          data: { name: data.name }
        });
        navigate('/tags');
      } else {
        await createTag.mutateAsync({ name: data.name });
        navigate('/tags');
      }
    } catch {

      // Error handling
    }};

  const { form, handleSubmit: onSubmit, hasUnsavedChanges } = useTagForm({
    initialData: tagResponse?.tag,
    onSubmit: handleSubmit
  });

  const {
    register,
    formState: { errors, isSubmitting }
  } = form;

  if (isEditing && isLoading) {
    return (
      <div className="max-w-lg mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      </div>);

  }

  if (isEditing && isError) {
    const errorMessage = isApiError(error) ?
    error.getUserMessage() :
    'Failed to load tag';

    return (
      <div className="max-w-lg mx-auto">
        <Link
          to="/tags"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">

          <ArrowLeft className="w-4 h-4" />
          Back to Tags
        </Link>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">

              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>);

  }

  const isPending = createTag.isPending || updateTag.isPending;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link
          to="/tags"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">

          <ArrowLeft className="w-4 h-4" />
          Back to Tags
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Tag' : 'Create Tag'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ?
            `Editing: ${tagResponse?.tag?.name}` :
            'Add a new categorization tag'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <FormField
            label="Tag Name"
            htmlFor="name"
            required
            error={errors.name?.message}
            hint="Lowercase alphanumeric with optional hyphens" data-test-id="formfield-7a8bdd81">

            <Input
              id="name"
              {...register('name')}
              error={!!errors.name}
              placeholder="e.g., machine-learning, web-framework" />

          </FormField>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200" data-test-id="div-2d39e289">
            <Link
              to="/tags"
              className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">

              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isPending || isEditing && !hasUnsavedChanges}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

              <Save className="w-4 h-4" />
              {isSubmitting || isPending ?
              isEditing ?
              'Saving...' :
              'Creating...' :
              isEditing ?
              'Save Changes' :
              'Create Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}