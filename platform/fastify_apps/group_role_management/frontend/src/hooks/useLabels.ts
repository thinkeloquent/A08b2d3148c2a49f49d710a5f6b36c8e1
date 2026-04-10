/**
 * Custom React Query hooks for Label operations
 * Based on REQ.v002.md Section 2.3 (Label System)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelAPI } from '@/services/api';
import type { Label } from '@/types';

// Query keys for caching
export const labelKeys = {
  all: ['labels'] as const,
  lists: () => [...labelKeys.all, 'list'] as const,
};

/**
 * Hook to fetch all labels with usage stats
 */
export function useLabels() {
  return useQuery({
    queryKey: labelKeys.lists(),
    queryFn: async () => {
      const response = await labelAPI.getLabels();
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (labels change less frequently)
  });
}

/**
 * Hook to create a new label
 */
export function useCreateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labelData: Label) => {
      const response = await labelAPI.createLabel(labelData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.lists() });
    },
  });
}

/**
 * Hook to update a label
 */
export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ labelName, labelData }: { labelName: string; labelData: Partial<Label> }) => {
      const response = await labelAPI.updateLabel(labelName, labelData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.lists() });
    },
  });
}

/**
 * Hook to delete a label
 */
export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labelName: string) => {
      const response = await labelAPI.deleteLabel(labelName);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.lists() });
    },
  });
}
