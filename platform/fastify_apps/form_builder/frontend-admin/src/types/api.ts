export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  schema_data: Record<string, unknown> | null;
  metadata_data: Record<string, unknown> | null;
  created_by: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface FormDefinitionSummary {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  tags: Tag[];
  pageCount: number;
  elementCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormVersion {
  id: string;
  formDefinitionId: string;
  version: string;
  schemaData: Record<string, unknown> | null;
  metadataData: Record<string, unknown> | null;
  changeSummary: string;
  createdAt: string;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListFormsResponse {
  formDefinitions: FormDefinitionSummary[];
  pagination: PaginationResponse;
}

export interface FormResponse {
  formDefinition: FormDefinition;
}

export interface TagListResponse {
  tags: Tag[];
}

export interface VersionListResponse {
  versions: FormVersion[];
}
