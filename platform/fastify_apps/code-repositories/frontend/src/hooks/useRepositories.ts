/**
 * Repository Hooks
 * React Query hooks for repository CRUD operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { repositoryApi } from '../services/api';
import type {
  ListRepositoriesResponse,
  GetRepositoryResponse,
  CreateRepositoryRequest,
  UpdateRepositoryRequest,
  DeleteResponse,
  RepositoryListFilters,
  ApiRepository,
} from '../types/api';
import type { ApiError } from '../types/errors';

/**
 * Query key factory for type-safe cache keys
 */
export const repositoryKeys = {
  all: ['repositories'] as const,
  lists: () => [...repositoryKeys.all, 'list'] as const,
  list: (filters?: RepositoryListFilters) =>
    [...repositoryKeys.lists(), filters] as const,
  details: () => [...repositoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...repositoryKeys.details(), id] as const,
};

/**
 * Hook to fetch list of repositories with filters
 */
export function useRepositories(
  filters?: RepositoryListFilters,
  options?: Omit<
    UseQueryOptions<ListRepositoriesResponse, ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: repositoryKeys.list(filters),
    queryFn: () => repositoryApi.list(filters),
    ...options,
  });
}

/**
 * Hook to fetch a single repository by ID
 */
export function useRepository(
  id: string,
  options?: {
    include_tags?: boolean;
    include_metadata?: boolean;
  } & Omit<
    UseQueryOptions<GetRepositoryResponse, ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  const { include_tags, include_metadata, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: repositoryKeys.detail(id),
    queryFn: () =>
      repositoryApi.getById(id, { include_tags, include_metadata }),
    enabled: !!id,
    ...queryOptions,
  });
}

/**
 * Hook to create a new repository
 */
export function useCreateRepository(
  options?: Omit<
    UseMutationOptions<GetRepositoryResponse, ApiError, CreateRepositoryRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRepositoryRequest) => repositoryApi.create(data),
    onSuccess: () => {
      // Invalidate all repository lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: repositoryKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update an existing repository
 */
export function useUpdateRepository(
  options?: Omit<
    UseMutationOptions<
      GetRepositoryResponse,
      ApiError,
      { id: string; data: UpdateRepositoryRequest }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRepositoryRequest }) =>
      repositoryApi.update(id, data),
    onSuccess: (response, { id }) => {
      // Update the specific repository in cache
      queryClient.setQueryData(
        repositoryKeys.detail(id),
        response
      );
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: repositoryKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a repository
 */
export function useDeleteRepository(
  options?: Omit<
    UseMutationOptions<DeleteResponse, ApiError, string>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositoryApi.delete(id),
    onSuccess: (_, id) => {
      // Remove the deleted repository from cache
      queryClient.removeQueries({ queryKey: repositoryKeys.detail(id) });
      // Invalidate lists to reflect deletion
      queryClient.invalidateQueries({ queryKey: repositoryKeys.lists() });
    },
    ...options,
  });
}

/**
 * Helper type for repository data used in UI
 * Converts API repository to a format matching the mock data structure
 */
export interface Repository {
  id: string;
  name: string;
  description: string;
  type: 'npm' | 'docker' | 'python';
  githubUrl: string;
  packageUrl: string;
  stars: number;
  forks: number;
  version: string;
  maintainer: string;
  lastUpdated: string;
  trending?: boolean;
  verified?: boolean;
  language: string;
  license: string;
  size: string;
  dependencies?: number;
  healthScore: number;
  status: 'stable' | 'beta' | 'deprecated' | 'experimental';
  tags: string[];
  documentation: { name: string }[];
}

/**
 * Convert API repository to UI repository format
 */
export function apiToUiRepository(repo: ApiRepository): Repository {
  // Convert type enum to string
  const typeMap: Record<number, 'npm' | 'docker' | 'python'> = {
    1: 'npm',
    2: 'docker',
    3: 'python',
  };

  // Convert status enum to string
  const statusMap: Record<number, 'stable' | 'beta' | 'deprecated' | 'experimental'> = {
    1: 'stable',
    2: 'beta',
    3: 'deprecated',
    4: 'experimental',
  };

  return {
    id: repo.id,
    name: repo.name,
    description: repo.description || '',
    type: typeMap[repo.type as number] || 'npm',
    githubUrl: repo.githubUrl || '',
    packageUrl: repo.packageUrl || '',
    stars: repo.stars || 0,
    forks: repo.forks || 0,
    version: repo.version || '0.0.0',
    maintainer: repo.maintainer || 'Unknown',
    lastUpdated: repo.lastUpdated || 'Unknown',
    trending: repo.trending,
    verified: repo.verified,
    language: repo.language || 'Unknown',
    license: repo.license || 'Unknown',
    size: repo.size || 'Unknown',
    dependencies: repo.dependencies,
    healthScore: repo.healthScore || 0,
    status: statusMap[repo.status as number] || 'stable',
    tags: repo.tags?.map((t) => t.name) || [],
    documentation: repo.metadata?.map((m) => ({ name: m.name })) || [],
  };
}
