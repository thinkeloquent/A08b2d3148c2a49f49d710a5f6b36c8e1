import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { CreateNoteInput } from '../types';

export const NOTE_KEYS = {
  all: ['notes'] as const,
  byTask: (taskId: string) => [...NOTE_KEYS.all, 'task', taskId] as const,
};

export function useNotesByTask(taskId: string) {
  return useQuery({
    queryKey: NOTE_KEYS.byTask(taskId),
    queryFn: () => apiClient.getNotesByTask(taskId),
    enabled: !!taskId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => apiClient.createNote(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: NOTE_KEYS.byTask(variables.taskId) });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string; taskId: string }) =>
      apiClient.updateNote(noteId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: NOTE_KEYS.byTask(variables.taskId) });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId }: { noteId: string; taskId: string }) =>
      apiClient.deleteNote(noteId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: NOTE_KEYS.byTask(variables.taskId) });
    },
  });
}
