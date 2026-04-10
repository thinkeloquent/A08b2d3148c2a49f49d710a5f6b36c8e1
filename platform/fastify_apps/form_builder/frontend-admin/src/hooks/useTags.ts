import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/services/api/tags';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.list(),
  });
}

export function useTag(id: string) {
  return useQuery({
    queryKey: ['tag', id],
    queryFn: () => tagsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color?: string }) => tagsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; color?: string } }) => tagsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}
