import type {
  Component,
  ComponentStatus,
  DashboardStats,
  PaginatedResponse,
  RegisterFormData,
  ApiCategory,
} from '@/types';

const API_BASE = '/api/component-registry';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function transformComponent(raw: any): Component {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    version: raw.version,
    branch: raw.branch || '',
    release: raw.release || '',
    repoLink: raw.repoLink || raw.repo_link || '',
    shaCommit: raw.shaCommit || raw.sha_commit || '',
    author: raw.author,
    downloads: raw.downloads || 0,
    stars: raw.stars || 0,
    status: raw.status,
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((t: any) => (typeof t === 'string' ? { id: t, name: t } : t))
      : [],
    description: raw.description || '',
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
  };
}

export interface ListComponentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ComponentStatus;
  category?: string;
  author?: string;
  sort?: string;
  order?: string;
}

export const componentAPI = {
  async getComponents(params?: ListComponentsParams): Promise<PaginatedResponse<Component>> {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          qs.set(key, String(val));
        }
      });
    }
    const queryString = qs.toString();
    const endpoint = `/components${queryString ? `?${queryString}` : ''}`;
    const raw = await fetchAPI<any>(endpoint);
    return {
      data: (raw.data || []).map(transformComponent),
      pagination: raw.pagination,
    };
  },

  async getComponent(id: string): Promise<Component> {
    const raw = await fetchAPI<any>(`/components/${id}`);
    return transformComponent(raw);
  },

  async createComponent(data: RegisterFormData): Promise<Component> {
    const branch = data.branch?.trim();
    const release = data.release?.trim();
    const repoLink = data.repoLink?.trim();
    const shaCommit = data.shaCommit?.trim();

    const body: any = {
      name: data.name,
      category: data.category,
      version: data.version || '1.0.0',
      author: 'Current User',
      status: 'alpha',
      description: data.description,
      tags: [],
      ...(branch ? { branch } : {}),
      ...(release ? { release } : {}),
      ...(repoLink ? { repoLink } : {}),
      ...(shaCommit ? { shaCommit } : {}),
    };
    const raw = await fetchAPI<any>('/components', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return transformComponent(raw);
  },

  async deleteComponent(id: string): Promise<void> {
    await fetchAPI(`/components/${id}`, { method: 'DELETE' });
  },

  async getStats(): Promise<DashboardStats> {
    return fetchAPI<DashboardStats>('/components/stats');
  },

  async getAuthors(): Promise<string[]> {
    return fetchAPI<string[]>('/components/authors');
  },
};

export const categoryAPI = {
  async getCategories(): Promise<ApiCategory[]> {
    return fetchAPI<ApiCategory[]>('/categories');
  },

  async createCategory(data: Partial<ApiCategory>): Promise<ApiCategory> {
    return fetchAPI<ApiCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: Partial<ApiCategory>): Promise<ApiCategory> {
    return fetchAPI<ApiCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await fetchAPI(`/categories/${id}`, { method: 'DELETE' });
  },
};

export const tagAPI = {
  async getTags(): Promise<any[]> {
    return fetchAPI<any[]>('/tags');
  },

  async searchTags(q: string, limit = 10): Promise<any[]> {
    return fetchAPI<any[]>(`/tags/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  },
};
