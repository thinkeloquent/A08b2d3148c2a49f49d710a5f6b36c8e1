import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { useState } from 'react';
import { useRepository, useUpdateRepository, useTags } from '@/hooks';
import { useRepositoryForm } from '@/hooks/useRepositoryForm';
import { FormField, Input, Select, TextArea, TagInput, Checkbox } from '@/components/forms';
import { DiffViewer } from '@/components/diff';
import { isApiError } from '@/types/errors';
import type { RepositoryFormData } from '@/schemas/repository';

const typeOptions = [
{ value: 'npm', label: 'NPM' },
{ value: 'docker', label: 'Docker' },
{ value: 'python', label: 'Python' }];


const statusOptions = [
{ value: 'stable', label: 'Stable' },
{ value: 'beta', label: 'Beta' },
{ value: 'deprecated', label: 'Deprecated' },
{ value: 'experimental', label: 'Experimental' }];


const sourceOptions = [
{ value: '', label: 'Select source...' },
{ value: 'github', label: 'GitHub' },
{ value: 'npm', label: 'NPM' },
{ value: 'dockerhub', label: 'Docker Hub' },
{ value: 'pypi', label: 'PyPI' },
{ value: 'manual', label: 'Manual' }];


const fieldLabels: Record<string, string> = {
  name: 'Name',
  type: 'Type',
  description: 'Description',
  github_url: 'GitHub URL',
  package_url: 'Package URL',
  version: 'Version',
  maintainer: 'Maintainer',
  language: 'Language',
  license: 'License',
  size: 'Size',
  stars: 'Stars',
  forks: 'Forks',
  dependencies: 'Dependencies',
  health_score: 'Health Score',
  status: 'Status',
  source: 'Source',
  trending: 'Trending',
  verified: 'Verified',
  tag_names: 'Tags'
};

export function RepositoryEditPage() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  const {
    data: repoResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useRepository(id!, {
    include_tags: true,
    include_metadata: true,
    enabled: !!id
  });

  const updateRepo = useUpdateRepository();
  const { data: tagsResponse } = useTags();

  const availableTags = tagsResponse?.tags?.map((t) => t.name) || [];

  const handleSubmit = async (data: RepositoryFormData) => {
    if (!id) return;
    try {
      await updateRepo.mutateAsync({
        id,
        data: {
          name: data.name,
          type: data.type,
          description: data.description || undefined,
          github_url: data.github_url || undefined,
          package_url: data.package_url || undefined,
          version: data.version || undefined,
          maintainer: data.maintainer || undefined,
          language: data.language || undefined,
          license: data.license || undefined,
          size: data.size || undefined,
          stars: data.stars,
          forks: data.forks,
          dependencies: data.dependencies,
          health_score: data.health_score,
          status: data.status,
          source: data.source || undefined,
          trending: data.trending,
          verified: data.verified,
          tag_names: data.tag_names
        }
      });
      navigate(`/repositories/${id}`);
    } catch {

      // Error handling
    }};

  const {
    form,
    handleSubmit: onSubmit,
    hasUnsavedChanges,
    originalValues,
    reset
  } = useRepositoryForm({
    initialData: repoResponse?.repository,
    onSubmit: handleSubmit
  });

  const {
    register,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = form;

  const tagNames = watch('tag_names');
  const currentValues = watch();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-4">
            {[...Array(8)].map((_, i) =>
            <div key={i} className="h-10 bg-gray-100 rounded" />
            )}
          </div>
        </div>
      </div>);

  }

  if (isError || !repoResponse) {
    const errorMessage = isApiError(error) ?
    error.getUserMessage() :
    'Failed to load repository';

    return (
      <div className="max-w-4xl mx-auto">
        <Link
          to="/repositories"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">

          <ArrowLeft className="w-4 h-4" />
          Back to Repositories
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/repositories/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">

          <ArrowLeft className="w-4 h-4" />
          Back to Repository
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Repository</h1>
              <p className="text-gray-500 mt-1">
                Editing: {repoResponse.repository.name}
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
            fields={Object.keys(fieldLabels) as (keyof RepositoryFormData)[]}
            labels={fieldLabels} />

          </div>
        }

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4" data-test-id="div-cb1cdbe8">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Name"
                htmlFor="name"
                required
                error={errors.name?.message}>

                <Input
                  id="name"
                  {...register('name')}
                  error={!!errors.name} />

              </FormField>

              <FormField
                label="Type"
                htmlFor="type"
                required
                error={errors.type?.message}>

                <Select
                  id="type"
                  {...register('type')}
                  options={typeOptions}
                  error={!!errors.type} />

              </FormField>
            </div>

            <FormField
              label="Description"
              htmlFor="description"
              error={errors.description?.message}>

              <TextArea
                id="description"
                {...register('description')}
                error={!!errors.description}
                rows={3} />

            </FormField>
          </div>

          {/* URLs */}
          <div className="space-y-4" data-test-id="div-ba41738e">
            <h2 className="text-lg font-semibold text-gray-900">URLs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="GitHub URL"
                htmlFor="github_url"
                error={errors.github_url?.message}>

                <Input
                  id="github_url"
                  type="url"
                  {...register('github_url')}
                  error={!!errors.github_url} />

              </FormField>

              <FormField
                label="Package URL"
                htmlFor="package_url"
                error={errors.package_url?.message}>

                <Input
                  id="package_url"
                  type="url"
                  {...register('package_url')}
                  error={!!errors.package_url} />

              </FormField>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4" data-test-id="div-3bf34344">
            <h2 className="text-lg font-semibold text-gray-900">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Version"
                htmlFor="version"
                error={errors.version?.message}>

                <Input
                  id="version"
                  {...register('version')}
                  error={!!errors.version} />

              </FormField>

              <FormField
                label="Maintainer"
                htmlFor="maintainer"
                error={errors.maintainer?.message}>

                <Input
                  id="maintainer"
                  {...register('maintainer')}
                  error={!!errors.maintainer} />

              </FormField>

              <FormField
                label="License"
                htmlFor="license"
                error={errors.license?.message}>

                <Input
                  id="license"
                  {...register('license')}
                  error={!!errors.license} />

              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Language"
                htmlFor="language"
                error={errors.language?.message}>

                <Input
                  id="language"
                  {...register('language')}
                  error={!!errors.language} />

              </FormField>

              <FormField
                label="Size"
                htmlFor="size"
                error={errors.size?.message}>

                <Input
                  id="size"
                  {...register('size')}
                  error={!!errors.size} />

              </FormField>

              <FormField
                label="Source"
                htmlFor="source"
                error={errors.source?.message}>

                <Select
                  id="source"
                  {...register('source')}
                  options={sourceOptions}
                  error={!!errors.source} />

              </FormField>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4" data-test-id="div-8231fa78">
            <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                label="Stars"
                htmlFor="stars"
                error={errors.stars?.message}>

                <Input
                  id="stars"
                  type="number"
                  min={0}
                  {...register('stars', { valueAsNumber: true })}
                  error={!!errors.stars} />

              </FormField>

              <FormField
                label="Forks"
                htmlFor="forks"
                error={errors.forks?.message}>

                <Input
                  id="forks"
                  type="number"
                  min={0}
                  {...register('forks', { valueAsNumber: true })}
                  error={!!errors.forks} />

              </FormField>

              <FormField
                label="Dependencies"
                htmlFor="dependencies"
                error={errors.dependencies?.message}>

                <Input
                  id="dependencies"
                  type="number"
                  min={0}
                  {...register('dependencies', { valueAsNumber: true })}
                  error={!!errors.dependencies} />

              </FormField>

              <FormField
                label="Health Score"
                htmlFor="health_score"
                error={errors.health_score?.message}
                hint="0-100">

                <Input
                  id="health_score"
                  type="number"
                  min={0}
                  max={100}
                  {...register('health_score', { valueAsNumber: true })}
                  error={!!errors.health_score} />

              </FormField>
            </div>
          </div>

          {/* Status & Flags */}
          <div className="space-y-4" data-test-id="div-e5f5a9da">
            <h2 className="text-lg font-semibold text-gray-900">Status & Flags</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Status"
                htmlFor="status"
                error={errors.status?.message}>

                <Select
                  id="status"
                  {...register('status')}
                  options={statusOptions}
                  error={!!errors.status} />

              </FormField>
            </div>

            <div className="flex gap-6">
              <Checkbox {...register('trending')} label="Trending" />
              <Checkbox {...register('verified')} label="Verified" />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4" data-test-id="div-f75233c6">
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
            <FormField
              label="Tags"
              htmlFor="tag_names"
              hint="Press Enter or comma to add tags">

              <TagInput
                value={tagNames}
                onChange={(tags) => setValue('tag_names', tags)}
                suggestions={availableTags}
                placeholder="Add tags..." />

            </FormField>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200" data-test-id="div-8ea3cc2f">
            <button
              type="button"
              onClick={reset}
              disabled={!hasUnsavedChanges}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

              <RotateCcw className="w-4 h-4" />
              Reset Changes
            </button>

            <div className="flex items-center gap-4">
              <Link
                to={`/repositories/${id}`}
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">

                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || updateRepo.isPending || !hasUnsavedChanges}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

                <Save className="w-4 h-4" />
                {isSubmitting || updateRepo.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>);

}