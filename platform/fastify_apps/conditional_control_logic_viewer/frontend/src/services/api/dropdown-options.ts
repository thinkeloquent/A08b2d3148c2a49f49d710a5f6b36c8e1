const BASE = '/api/conditional-control-logic-viewer/dropdown-options';

export interface DropdownOptionRecord {
  id: string;
  value: string;
  label: string;
  category: string | null;
  sort_order: number;
  status: 'active' | 'archived';
}

export async function listDropdownOptions(): Promise<DropdownOptionRecord[]> {
  const response = await fetch(BASE);
  if (!response.ok) {
    throw new Error(`Failed to load dropdown options (${response.status})`);
  }
  return response.json();
}
