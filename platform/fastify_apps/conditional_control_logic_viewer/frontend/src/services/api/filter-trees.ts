import type { TreeItems } from 'dnd-kit-sortable-tree';
import type { TreeItemData } from '@/types';

const BASE = '/api/conditional-control-logic-viewer/filter-trees';

export interface FilterTreeRecord {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived';
  tree_data: {
    id: string;
    type: string;
    operator: string;
    children: TreeItems<TreeItemData>;
  };
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface FilterTreeListResponse {
  data: FilterTreeRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(err.message || `Request failed (${response.status})`);
  }
  return response.json();
}

export async function listFilterTrees(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<FilterTreeListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.search) searchParams.set('search', params.search);
  const qs = searchParams.toString();
  return handleResponse<FilterTreeListResponse>(await fetch(`${BASE}${qs ? `?${qs}` : ''}`));
}

export async function getFilterTree(id: string): Promise<FilterTreeRecord> {
  return handleResponse<FilterTreeRecord>(await fetch(`${BASE}/${id}`));
}

export async function createFilterTree(payload: {
  name: string;
  description?: string;
  tree_data: object;
}): Promise<FilterTreeRecord> {
  return handleResponse<FilterTreeRecord>(
    await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateFilterTree(
  id: string,
  payload: { name?: string; description?: string; tree_data?: object },
): Promise<FilterTreeRecord> {
  return handleResponse<FilterTreeRecord>(
    await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
}
