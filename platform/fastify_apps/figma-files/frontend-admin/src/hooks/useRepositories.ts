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
  BulkCreateResponse,
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

// Legacy alias for modules that import repositoryKeys
export const repositoryKeys = figmaFileKeys;

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

// Legacy alias
export const useRepositories = useFigmaFiles;

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

// Legacy alias
export const useRepository = useFigmaFile;

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
      queryClient.invalidateQueries({ queryKey: figmaFileKeys.lists() });
    },
    ...options,
  });
}

// Legacy alias
export const useCreateRepository = useCreateFigmaFile;

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
      queryClient.setQueryData(figmaFileKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: figmaFileKeys.lists() });
    },
    ...options,
  });
}

// Legacy alias
export const useUpdateRepository = useUpdateFigmaFile;

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
      queryClient.removeQueries({ queryKey: figmaFileKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: figmaFileKeys.lists() });
    },
    ...options,
  });
}

// Legacy alias
export const useDeleteRepository = useDeleteFigmaFile;

/**
 * Hook to bulk create figma files
 */
export function useBulkCreateFigmaFiles(
  options?: Omit<
    UseMutationOptions<BulkCreateResponse, ApiError, CreateFigmaFileRequest[]>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFigmaFileRequest[]) => figmaFileApi.bulkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: figmaFileKeys.lists() });
    },
    ...options,
  });
}

// Legacy alias
export const useBulkCreateRepositories = useBulkCreateFigmaFiles;

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

// Legacy alias
export type Repository = FigmaFile;

/**
 * Convert API figma file to UI figma file format
 */
export function apiToUiFigmaFile(figmaFile: ApiFigmaFile): FigmaFile {
  const typeMap: Record<number, FigmaFile['type']> = {
    1: 'design_system',
    2: 'component_library',
    3: 'prototype',
    4: 'illustration',
    5: 'icon_set',
  };

  const statusMap: Record<number, FigmaFile['status']> = {
    1: 'stable',
    2: 'beta',
    3: 'deprecated',
    4: 'experimental',
  };

  return {
    id: figmaFile.id,
    name: figmaFile.name,
    description: figmaFile.description || '',
    type: typeMap[figmaFile.type as number] || 'design_system',
    figmaUrl: figmaFile.figmaUrl || '',
    figmaFileKey: figmaFile.figmaFileKey || '',
    thumbnailUrl: figmaFile.thumbnailUrl || '',
    pageCount: figmaFile.pageCount || 0,
    componentCount: figmaFile.componentCount || 0,
    styleCount: figmaFile.styleCount || 0,
    lastModifiedBy: figmaFile.lastModifiedBy || '',
    editorType: figmaFile.editorType || '',
    trending: figmaFile.trending,
    verified: figmaFile.verified,
    status: statusMap[figmaFile.status as number] || 'stable',
    tags: figmaFile.tags?.map((t) => t.name) || [],
    documentation: figmaFile.metadata?.map((m) => ({ name: m.name })) || [],
  };
}

// Legacy alias
export const apiToUiRepository = apiToUiFigmaFile;
