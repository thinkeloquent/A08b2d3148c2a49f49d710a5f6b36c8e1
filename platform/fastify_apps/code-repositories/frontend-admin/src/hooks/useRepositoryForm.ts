import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useCallback } from 'react';
import {
  repositorySchema,
  repositoryDefaults,
  type RepositoryFormData,
} from '@/schemas/repository';
import { hasChanges, getFieldChanges, type FieldChange } from '@/lib/diff';
import type { ApiRepository } from '@/types/api';

interface UseRepositoryFormOptions {
  initialData?: ApiRepository;
  onSubmit: (data: RepositoryFormData) => void | Promise<void>;
}

interface UseRepositoryFormReturn {
  form: UseFormReturn<RepositoryFormData>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isEditing: boolean;
  isDirty: boolean;
  changes: FieldChange[];
  hasUnsavedChanges: boolean;
  originalValues: RepositoryFormData;
  reset: () => void;
}

const TRACKED_FIELDS: (keyof RepositoryFormData)[] = [
  'name',
  'type',
  'description',
  'github_url',
  'package_url',
  'version',
  'maintainer',
  'language',
  'license',
  'size',
  'stars',
  'forks',
  'dependencies',
  'health_score',
  'status',
  'source',
  'trending',
  'verified',
  'tag_names',
];

function apiToFormData(repo: ApiRepository): RepositoryFormData {
  const typeMap: Record<number, 'npm' | 'docker' | 'python'> = {
    1: 'npm',
    2: 'docker',
    3: 'python',
  };

  const statusMap: Record<number, 'stable' | 'beta' | 'deprecated' | 'experimental'> = {
    1: 'stable',
    2: 'beta',
    3: 'deprecated',
    4: 'experimental',
  };

  const sourceMap: Record<number, 'github' | 'npm' | 'dockerhub' | 'pypi' | 'manual'> = {
    1: 'github',
    2: 'npm',
    3: 'dockerhub',
    4: 'pypi',
    5: 'manual',
  };

  return {
    name: repo.name,
    type: typeMap[repo.type as number] || 'npm',
    description: repo.description || '',
    github_url: repo.githubUrl || '',
    package_url: repo.packageUrl || '',
    version: repo.version || '',
    maintainer: repo.maintainer || '',
    language: repo.language || '',
    license: repo.license || '',
    size: repo.size || '',
    stars: repo.stars || 0,
    forks: repo.forks || 0,
    dependencies: repo.dependencies,
    health_score: repo.healthScore,
    status: statusMap[repo.status as number] || 'stable',
    source: repo.source ? sourceMap[repo.source as number] : undefined,
    trending: repo.trending || false,
    verified: repo.verified || false,
    tag_names: repo.tags?.map((t) => t.name) || [],
  };
}

export function useRepositoryForm({
  initialData,
  onSubmit,
}: UseRepositoryFormOptions): UseRepositoryFormReturn {
  const isEditing = !!initialData;

  const originalValues = useMemo(
    () => (initialData ? apiToFormData(initialData) : repositoryDefaults),
    [initialData]
  );

  const form = useForm<RepositoryFormData>({
    resolver: zodResolver(repositorySchema),
    defaultValues: originalValues,
    mode: 'onChange',
  });

  const currentValues = form.watch();

  const changes = useMemo(
    () => getFieldChanges(originalValues, currentValues, TRACKED_FIELDS),
    [originalValues, currentValues]
  );

  const hasUnsavedChanges = useMemo(
    () => hasChanges(originalValues, currentValues, TRACKED_FIELDS),
    [originalValues, currentValues]
  );

  const handleSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      await form.handleSubmit(onSubmit)(e);
    },
    [form, onSubmit]
  );

  const reset = useCallback(() => {
    form.reset(originalValues);
  }, [form, originalValues]);

  return {
    form,
    handleSubmit,
    isEditing,
    isDirty: form.formState.isDirty,
    changes,
    hasUnsavedChanges,
    originalValues,
    reset,
  };
}
