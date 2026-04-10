/**
 * Figma File Hooks
 * React Query hooks for figma file CRUD operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { figmaFileApi } from '../services/api';
import type {
  ListFigmaFilesResponse,
  GetFigmaFileResponse,
  CreateFigmaFileRequest,
  UpdateFigmaFileRequest,
  DeleteResponse,
  FigmaFileListFilters,
  ApiFigmaFile,
} from '../types/api';
import type { ApiError } from '../types/errors';

/**
 * Query key factory for type-safe cache keys
 */
export const figmaFileKeys = {
  all: ['figmaFiles'] as const,
  lists: () => [...figmaFileKeys.all, 'list'] as const,
  list: (filters?: FigmaFileListFilters) =>
    [...figmaFileKeys.lists(), filters] as const,
  details: () => [...figmaFileKeys.all, 'detail'] as const,
  detail: (id: string) => [...figmaFileKeys.details(), id] as const,
};

/**
 * Hook to fetch list of figma files with filters
 */
export function useFigmaFiles(
  filters?: FigmaFileListFilters,
  options?: Omit<
    UseQueryOptions<ListFigmaFilesResponse, ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: figmaFileKeys.list(filters),
    queryFn: () => figmaFileApi.list(filters),
    ...options,
  });
}

/**
 * Hook to fetch a single figma file by ID
 */
export function useFigmaFile(
  id: string,
  options?: {
    include_tags?: boolean;
    include_metadata?: boolean;
  } & Omit<
    UseQueryOptions<GetFigmaFileResponse, ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  const { include_tags, include_metadata, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: figmaFileKeys.detail(id),
    queryFn: () =>
      figmaFileApi.getById(id, { include_tags, include_metadata }),
    enabled: !!id,
    ...queryOptions,
  });
}

/**
 * Hook to create a new figma file
 */
export function useCreateFigmaFile(
  options?: Omit<
    UseMutationOptions<GetFigmaFileResponse, ApiError, CreateFigmaFileRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFigmaFileRequest) => figmaFileApi.create(data),
    onSuccess: () => {
      // Invalidate all figma file lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: figmaFileKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update an existing figma file
 */
export function useUpdateFigmaFile(
  options?: Omit<
    UseMutationOptions<
      GetFigmaFileResponse,
      ApiError,
      { id: string; data: UpdateFigmaFileRequest }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFigmaFileRequest }) =>
      figmaFileApi.update(id, data),
    onSuccess: (response, { id }) => {
      // Update the specific figma file in cache
      queryClient.setQueryData(
        figmaFileKeys.detail(id),
        response
      );
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: figmaFileKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a figma file
 */
export function useDeleteFigmaFile(
  options?: Omit<
    UseMutationOptions<DeleteResponse, ApiError, string>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => figmaFileApi.delete(id),
    onSuccess: (_, id) => {
      // Remove the deleted figma file from cache
      queryClient.removeQueries({ queryKey: figmaFileKeys.detail(id) });
      // Invalidate lists to reflect deletion
      queryClient.invalidateQueries({ queryKey: figmaFileKeys.lists() });
    },
    ...options,
  });
}

/**
 * Helper type for figma file data used in UI
 */
export interface FigmaFile {
  id: string;
  name: string;
  description: string;
  type: 'design_system' | 'component_library' | 'prototype' | 'illustration' | 'icon_set';
  figmaUrl: string;
  figmaFileKey: string;
  thumbnailUrl: string;
  pageCount: number;
  componentCount: number;
  styleCount: number;
  lastModifiedBy: string;
  editorType: string;
  trending?: boolean;
  verified?: boolean;
  status: 'stable' | 'beta' | 'deprecated' | 'experimental';
  tags: string[];
  documentation: { name: string }[];
}

/**
 * Convert API figma file to UI figma file format
 */
export function apiToUiFigmaFile(file: ApiFigmaFile): FigmaFile {
  // Convert type enum to string
  const typeMap: Record<number, FigmaFile['type']> = {
    1: 'design_system',
    2: 'component_library',
    3: 'prototype',
    4: 'illustration',
    5: 'icon_set',
  };

  // Convert status enum to string
  const statusMap: Record<number, FigmaFile['status']> = {
    1: 'stable',
    2: 'beta',
    3: 'deprecated',
    4: 'experimental',
  };

  return {
    id: file.id,
    name: file.name,
    description: file.description || '',
    type: typeMap[file.type as number] || 'design_system',
    figmaUrl: file.figmaUrl || '',
    figmaFileKey: file.figmaFileKey || '',
    thumbnailUrl: file.thumbnailUrl || '',
    pageCount: file.pageCount || 0,
    componentCount: file.componentCount || 0,
    styleCount: file.styleCount || 0,
    lastModifiedBy: file.lastModifiedBy || 'Unknown',
    editorType: file.editorType || 'figma',
    trending: file.trending,
    verified: file.verified,
    status: statusMap[file.status as number] || 'stable',
    tags: file.tags?.map((t) => t.name) || [],
    documentation: file.metadata?.map((m) => ({ name: m.name })) || [],
  };
}
