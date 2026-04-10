import type { Project, Prompt, PromptVersion, PaginatedResponse } from '../types';

const API_BASE = '/api/prompt-management-system';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

// Projects
export const projectsApi = {
  list: (params?: Record<string, string>) =>
    fetchApi<PaginatedResponse<Project>>(`/projects?${new URLSearchParams(params)}`),
  getById: (id: string) => fetchApi<Project>(`/projects/${id}`),
  create: (data: Partial<Project>) =>
    fetchApi<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Project>) =>
    fetchApi<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<void>(`/projects/${id}`, { method: 'DELETE' }),
};

// Prompts
export const promptsApi = {
  list: (params?: Record<string, string>) =>
    fetchApi<PaginatedResponse<Prompt>>(`/prompts?${new URLSearchParams(params)}`),
  getById: (id: string) => fetchApi<Prompt>(`/prompts/${id}`),
  create: (data: Partial<Prompt>) =>
    fetchApi<Prompt>('/prompts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Prompt>) =>
    fetchApi<Prompt>(`/prompts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<void>(`/prompts/${id}`, { method: 'DELETE' }),
};

// Versions
export const versionsApi = {
  list: (promptId: string, params?: Record<string, string>) =>
    fetchApi<PaginatedResponse<PromptVersion>>(`/prompts/${promptId}/versions?${new URLSearchParams(params)}`),
  getById: (promptId: string, versionId: string) =>
    fetchApi<PromptVersion>(`/prompts/${promptId}/versions/${versionId}`),
  create: (promptId: string, data: Record<string, unknown>) =>
    fetchApi<PromptVersion>(`/prompts/${promptId}/versions`, { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (promptId: string, versionId: string, status: string) =>
    fetchApi<PromptVersion>(`/prompts/${promptId}/versions/${versionId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// Deployments
export const deploymentsApi = {
  list: (promptId: string) =>
    fetchApi<{ data: unknown[] }>(`/prompts/${promptId}/deployments`),
  deploy: (promptId: string, data: { environment: string; version_id: string }) =>
    fetchApi<unknown>(`/prompts/${promptId}/deploy`, { method: 'POST', body: JSON.stringify(data) }),
  getBySlug: (slug: string, environment: string) =>
    fetchApi<unknown>(`/prompts/${slug}/${environment}`),
  render: (slug: string, data: { environment?: string; variables?: Record<string, string> }) =>
    fetchApi<{ rendered: string; config: Record<string, unknown> }>(`/prompts/${slug}/render`, { method: 'POST', body: JSON.stringify(data) }),
};
