import type { LLMDefault, LLMDefaultCategory, Persona } from '../../types';

const API_BASE = '/api/ai-ask-v2';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = (await response.json().catch(() => ({ error: 'Unknown error' }))) as {
      error?: string;
    };
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const personasAPI = {
  list: async (): Promise<Persona[]> => {
    const response = await fetch(`${API_BASE}/personas`);
    return handleResponse<Persona[]>(response);
  },

  get: async (id: string): Promise<Persona> => {
    const response = await fetch(`${API_BASE}/personas/${id}`);
    return handleResponse<Persona>(response);
  },

  create: async (data: Omit<Persona, 'id' | 'last_updated'>): Promise<Persona> => {
    const response = await fetch(`${API_BASE}/personas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Persona>(response);
  },

  update: async (id: string, data: Partial<Persona>): Promise<Persona> => {
    const response = await fetch(`${API_BASE}/personas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Persona>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/personas/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = (await response.json().catch(() => ({ error: 'Unknown error' }))) as {
        error?: string;
      };
      throw new Error(error.error || `HTTP ${response.status}`);
    }
  },
};

export const llmDefaultsAPI = {
  list: async (): Promise<LLMDefault[]> => {
    const response = await fetch(`${API_BASE}/llm-defaults`);
    return handleResponse<LLMDefault[]>(response);
  },

  getByCategory: async (category: LLMDefaultCategory): Promise<LLMDefault[]> => {
    const response = await fetch(`${API_BASE}/llm-defaults/category/${category}`);
    return handleResponse<LLMDefault[]>(response);
  },

  get: async (id: string): Promise<LLMDefault> => {
    const response = await fetch(`${API_BASE}/llm-defaults/${id}`);
    return handleResponse<LLMDefault>(response);
  },

  create: async (
    data: Omit<LLMDefault, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<LLMDefault> => {
    const response = await fetch(`${API_BASE}/llm-defaults`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<LLMDefault>(response);
  },

  update: async (
    id: string,
    data: Partial<Omit<LLMDefault, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<LLMDefault> => {
    const response = await fetch(`${API_BASE}/llm-defaults/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<LLMDefault>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/llm-defaults/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = (await response.json().catch(() => ({ error: 'Unknown error' }))) as {
        error?: string;
      };
      throw new Error(error.error || `HTTP ${response.status}`);
    }
  },
};
