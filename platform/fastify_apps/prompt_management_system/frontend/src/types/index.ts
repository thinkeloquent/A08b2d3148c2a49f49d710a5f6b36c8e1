export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived';
  created_by: string | null;
  updated_by: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  prompts?: Prompt[];
  promptCount?: number;
}

export interface Prompt {
  id: string;
  project_id: string;
  slug: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived';
  created_by: string | null;
  updated_by: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
  versions?: PromptVersion[];
  deployments?: Deployment[];
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_number: number;
  template: string;
  config: Record<string, unknown>;
  input_schema: Record<string, unknown>;
  commit_message: string | null;
  status: 'draft' | 'published' | 'archived';
  created_by: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  variables?: Variable[];
  prompt?: { id: string; slug: string; name: string };
}

export interface Deployment {
  id: string;
  prompt_id: string;
  environment: string;
  version_id: string;
  deployed_by: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  version?: PromptVersion;
}

export interface Variable {
  id: string;
  version_id: string;
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string | null;
  default_value: string | null;
  required: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
