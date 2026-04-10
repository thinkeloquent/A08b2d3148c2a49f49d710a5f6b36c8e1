import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreateRepository, useTags } from '@/hooks';
import { useRepositoryForm } from '@/hooks/useRepositoryForm';
import { FormField, Input, Select, TextArea, TagInput, Checkbox } from '@/components/forms';
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


export function RepositoryCreatePage() {
  const navigate = useNavigate();
  const createRepo = useCreateRepository();
  const { data: tagsResponse } = useTags();

  const availableTags = tagsResponse?.tags?.map((t) => t.name) || [];

  const handleSubmit = async (data: RepositoryFormData) => {
    try {
      const result = await createRepo.mutateAsync({
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
      });
      navigate(`/repositories/${result.repository.id}`);
    } catch {

      // Error handling
    }};

  const { form, handleSubmit: onSubmit } = useRepositoryForm({
    onSubmit: handleSubmit
  });

  const {
    register,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = form;

  const tagNames = watch('tag_names');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/repositories"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">

          <ArrowLeft className="w-4 h-4" />
          Back to Repositories
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Create Repository</h1>
          <p className="text-gray-500 mt-1">Add a new package to the registry</p>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4" data-test-id="div-fc88e4f4">
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
                  error={!!errors.name}
                  placeholder="e.g., react, lodash, tensorflow" />

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
                placeholder="A brief description of the package..."
                rows={3} />

            </FormField>
          </div>

          {/* URLs */}
          <div className="space-y-4" data-test-id="div-476766b6">
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
                  error={!!errors.github_url}
                  placeholder="https://github.com/..." />

              </FormField>

              <FormField
                label="Package URL"
                htmlFor="package_url"
                error={errors.package_url?.message}>

                <Input
                  id="package_url"
                  type="url"
                  {...register('package_url')}
                  error={!!errors.package_url}
                  placeholder="https://npmjs.com/package/..." />

              </FormField>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4" data-test-id="div-8434078e">
            <h2 className="text-lg font-semibold text-gray-900">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Version"
                htmlFor="version"
                error={errors.version?.message}>

                <Input
                  id="version"
                  {...register('version')}
                  error={!!errors.version}
                  placeholder="e.g., 1.0.0" />

              </FormField>

              <FormField
                label="Maintainer"
                htmlFor="maintainer"
                error={errors.maintainer?.message}>

                <Input
                  id="maintainer"
                  {...register('maintainer')}
                  error={!!errors.maintainer}
                  placeholder="e.g., John Doe" />

              </FormField>

              <FormField
                label="License"
                htmlFor="license"
                error={errors.license?.message}>

                <Input
                  id="license"
                  {...register('license')}
                  error={!!errors.license}
                  placeholder="e.g., MIT" />

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
                  error={!!errors.language}
                  placeholder="e.g., JavaScript" />

              </FormField>

              <FormField
                label="Size"
                htmlFor="size"
                error={errors.size?.message}>

                <Input
                  id="size"
                  {...register('size')}
                  error={!!errors.size}
                  placeholder="e.g., 2.5MB" />

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
          <div className="space-y-4" data-test-id="div-e6bf3bb2">
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
          <div className="space-y-4" data-test-id="div-ef33fe4a">
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
              <Checkbox
                {...register('trending')}
                label="Trending" />

              <Checkbox
                {...register('verified')}
                label="Verified" />

            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4" data-test-id="div-f8d7901f">
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
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200" data-test-id="div-a2948f0f">
            <Link
              to="/repositories"
              className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">

              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || createRepo.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

              <Save className="w-4 h-4" />
              {isSubmitting || createRepo.isPending ? 'Creating...' : 'Create Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}