export type EntityStatus = 'active' | 'inactive' | 'archived' | 'work-in-progress';

export interface EntityMetadata {
  tags?: string[];
  customFields?: Record<string, unknown>;
  version?: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: EntityStatus;
  metadata: EntityMetadata;
  workspaceCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type CreateOrganizationDTO = {
  name: string;
  description?: string;
  status?: EntityStatus;
  metadata?: EntityMetadata;
};

export type UpdateOrganizationDTO = Partial<{
  name: string;
  slug: string;
  description: string;
  status: EntityStatus;
  metadata: EntityMetadata;
}>;

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiDetailResponse<T> {
  success: boolean;
  data: T;
}

export type ApiListResponse<T> = PaginatedResponse<T>;
