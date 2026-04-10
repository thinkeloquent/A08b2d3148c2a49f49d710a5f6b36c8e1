import { api } from './client';
import type { TagListResponse, Tag } from '@/types/api';

export const tagsApi = {
  list: () => api.get<TagListResponse>('/tags'),
  get: (id: string) => api.get<{ tag: Tag }>(`/tags/${id}`),
  create: (data: { name: string; color?: string }) => api.post<{ tag: Tag }>('/tags', data),
  update: (id: string, data: { name?: string; color?: string }) => api.put<{ tag: Tag }>(`/tags/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/tags/${id}`),
};
