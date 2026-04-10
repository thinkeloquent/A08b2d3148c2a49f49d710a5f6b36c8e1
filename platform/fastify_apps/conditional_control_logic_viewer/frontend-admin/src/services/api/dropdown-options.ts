const BASE = '/api/conditional-control-logic-viewer/dropdown-options';

export interface DropdownOptionRecord {
  id: string;
  value: string;
  label: string;
  category: string | null;
  sort_order: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(err.message || `Request failed (${response.status})`);
  }
  return response.json();
}

export async function listDropdownOptions(params?: {
  search?: string;
  category?: string;
  status?: string;
}): Promise<DropdownOptionRecord[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);
  const qs = searchParams.toString();
  return handleResponse<DropdownOptionRecord[]>(await fetch(`${BASE}${qs ? `?${qs}` : ''}`));
}

export async function getDropdownOption(id: string): Promise<DropdownOptionRecord> {
  return handleResponse<DropdownOptionRecord>(await fetch(`${BASE}/${id}`));
}

export async function createDropdownOption(payload: {
  value: string;
  label: string;
  category?: string;
  sort_order?: number;
}): Promise<DropdownOptionRecord> {
  return handleResponse<DropdownOptionRecord>(
    await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateDropdownOption(
  id: string,
  payload: { value?: string; label?: string; category?: string; sort_order?: number },
): Promise<DropdownOptionRecord> {
  return handleResponse<DropdownOptionRecord>(
    await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteDropdownOption(id: string): Promise<void> {
  const response = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(err.message || `Delete failed (${response.status})`);
  }
}
