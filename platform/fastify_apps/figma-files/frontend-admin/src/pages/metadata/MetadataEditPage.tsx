import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { useMetadataItem, useUpdateMetadata } from '@/hooks';
import { useMetadataForm } from '@/hooks/useMetadataForm';
import { FormField, Input, TagInput } from '@/components/forms';
import { DiffViewer } from '@/components/diff';
import { isApiError } from '@/types/errors';
import type { MetadataFormData } from '@/schemas/metadata';
import { useState } from 'react';
import { Eye } from 'lucide-react';

const fieldLabels: Record<string, string> = {
  name: 'Name',
  content_type: 'Content Type',
  source_url: 'Source URL',
  source_hash_id: 'Hash ID',
  labels: 'Labels'
};

export function MetadataEditPage() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  const {
    data: metadataResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useMetadataItem(id ? parseInt(id, 10) : 0, {
    enabled: !!id
  });

  const updateMetadata = useUpdateMetadata();

  const handleSubmit = async (data: MetadataFormData) => {
    if (!id) return;
    try {
      await updateMetadata.mutateAsync({
        id: parseInt(id, 10),
        data: {
          name: data.name,
          content_type: data.content_type || undefined,
          source_url: data.source_url || undefined,
          source_hash_id: data.source_hash_id || undefined,
          labels: data.labels.length > 0 ? data.labels : undefined
        }
      });
      navigate('/metadata');
    } catch {

      // Error handling
    }};

  const {
    form,
    handleSubmit: onSubmit,
    hasUnsavedChanges,
    originalValues
  } = useMetadataForm({
    initialData: metadataResponse?.metadata,
    onSubmit: handleSubmit
  });

  const {
    register,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = form;

  const labels = watch('labels');
  const currentValues = watch();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) =>
            <div key={i} className="h-10 bg-gray-100 rounded" />
            )}
          </div>
        </div>
      </div>);

  }

  if (isError || !metadataResponse) {
    const errorMessage = isApiError(error) ?
    error.getUserMessage() :
    'Failed to load metadata';

    return (
      <div className="max-w-2xl mx-auto">
        <Link
          to="/metadata"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">

          <ArrowLeft className="w-4 h-4" />
          Back to Metadata
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/metadata"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">

          <ArrowLeft className="w-4 h-4" />
          Back to Metadata
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Metadata</h1>
              <p className="text-gray-500 mt-1">
                Editing: {metadataResponse.metadata.name}
              </p>
            </div>
            {hasUnsavedChanges &&
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showPreview ?
              'bg-blue-100 text-blue-700' :
              'text-gray-600 hover:bg-gray-100'}`
              }>

                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide Changes' : 'Preview Changes'}
              </button>
            }
          </div>
        </div>

        {/* Changes Preview */}
        {showPreview && hasUnsavedChanges &&
        <div className="p-6 bg-gray-50 border-b border-gray-200">
            <DiffViewer
            original={originalValues}
            modified={currentValues}
            fields={Object.keys(fieldLabels) as (keyof MetadataFormData)[]}
            labels={fieldLabels} />

          </div>
        }

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <FormField
            label="Name"
            htmlFor="name"
            required
            error={errors.name?.message} data-test-id="formfield-8ec66571">

            <Input
              id="name"
              {...register('name')}
              error={!!errors.name}
              placeholder="e.g., README, API Documentation" />

          </FormField>

          <FormField
            label="Content Type"
            htmlFor="content_type"
            error={errors.content_type?.message} data-test-id="formfield-4fd696ab">

            <Input
              id="content_type"
              {...register('content_type')}
              error={!!errors.content_type}
              placeholder="e.g., text/markdown, application/json" />

          </FormField>

          <FormField
            label="Source URL"
            htmlFor="source_url"
            error={errors.source_url?.message} data-test-id="formfield-760791cc">

            <Input
              id="source_url"
              type="url"
              {...register('source_url')}
              error={!!errors.source_url}
              placeholder="https://..." />

          </FormField>

          <FormField
            label="Source Hash ID"
            htmlFor="source_hash_id"
            error={errors.source_hash_id?.message}
            hint="Used for caching and deduplication" data-test-id="formfield-5f7bca36">

            <Input
              id="source_hash_id"
              {...register('source_hash_id')}
              error={!!errors.source_hash_id} />

          </FormField>

          <FormField
            label="Labels"
            htmlFor="labels"
            hint="Press Enter or comma to add labels" data-test-id="formfield-398e3ee1">

            <TagInput
              value={labels}
              onChange={(newLabels) => setValue('labels', newLabels)}
              placeholder="Add labels..." />

          </FormField>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200" data-test-id="div-b9259a85">
            <Link
              to="/metadata"
              className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">

              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || updateMetadata.isPending || !hasUnsavedChanges}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

              <Save className="w-4 h-4" />
              {isSubmitting || updateMetadata.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}