const API_BASE = '/api/prompt-oneshot-template';

export interface TemplateSummary {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  templateName: string;
  version: string;
  template: string;
  mockData: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export async function fetchTemplates(category?: string): Promise<{ templates: TemplateSummary[]; total: number }> {
  const url = category ? `${API_BASE}/templates?category=${encodeURIComponent(category)}` : `${API_BASE}/templates`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch templates: ${res.statusText}`);
  return res.json();
}

export async function fetchTemplate(id: string): Promise<DocumentTemplate> {
  const res = await fetch(`${API_BASE}/templates/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`);
  return res.json();
}

export async function fetchCategories(): Promise<{ categories: Category[] }> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
  return res.json();
}
