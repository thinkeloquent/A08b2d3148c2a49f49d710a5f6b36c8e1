/**
 * API Types - Matching backend response schemas for UI Component Metadata
 */

// Taxonomy levels matching the backend enum
export type TaxonomyLevel = 'Atom' | 'Molecule' | 'Organism' | 'Template' | 'Page';

// Component status
export type ComponentStatus = 'draft' | 'published' | 'archived';

// Tag from API
export interface ApiTag {
  id: string;
  name: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Component from API
export interface ApiComponent {
  id: string;
  name: string;
  description?: string;
  taxonomyLevel?: TaxonomyLevel;
  status?: ComponentStatus;
  aliases?: string[];
  directives?: string;
  fewShotExamples?: object[];
  inputSchema?: object;
  outputSchema?: object | null;
  lifecycleConfig?: object;
  interactions?: object[];
  serviceDependencies?: object[];
  compositionRules?: object;
  createdBy?: string;
  tags?: ApiTag[];
  createdAt?: string;
  updatedAt?: string;
}

// Pagination
export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Component list filters
export interface ComponentListFilters {
  page?: number;
  limit?: number;
  status?: ComponentStatus;
  taxonomy_level?: TaxonomyLevel;
  search?: string;
  tags?: string;
  include_tags?: boolean;
}

// List components response
export interface ListComponentsResponse {
  components: ApiComponent[];
  pagination: PaginationResponse;
}

// Single component response
export interface GetComponentResponse {
  component: ApiComponent;
}

// Create component request
export interface CreateComponentRequest {
  name: string;
  description?: string;
  taxonomy_level?: TaxonomyLevel;
  status?: ComponentStatus;
  aliases?: string[];
  directives?: string;
  few_shot_examples?: object[];
  input_schema?: object;
  output_schema?: object | null;
  lifecycle_config?: object;
  interactions?: object[];
  service_dependencies?: object[];
  composition_rules?: object;
  created_by?: string;
  tag_names?: string[];
}

// Update component request (all fields optional)
export interface UpdateComponentRequest {
  name?: string;
  description?: string;
  taxonomy_level?: TaxonomyLevel;
  status?: ComponentStatus;
  aliases?: string[];
  directives?: string;
  few_shot_examples?: object[];
  input_schema?: object;
  output_schema?: object | null;
  lifecycle_config?: object;
  interactions?: object[];
  service_dependencies?: object[];
  composition_rules?: object;
  tag_names?: string[];
}

// List tags response
export interface ListTagsResponse {
  tags: ApiTag[];
}

// Single tag response
export interface GetTagResponse {
  tag: ApiTag;
}

// Create/Update tag request
export interface TagRequest {
  name: string;
  color?: string;
}

// Delete response
export interface DeleteResponse {
  success: boolean;
}

// API error response format
export interface ApiErrorResponse {
  code: number;
  message: string;
}
