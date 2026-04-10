/**
 * FQDP Management System - TypeScript Type Definitions
 * Version: 1.0
 * Based on: REQ.v002.jsx Section 3
 */

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Entity status enumeration
 * Must match backend enum in prisma/schema.prisma
 */
export type EntityStatus =
  | 'active'           // Normal operational state
  | 'inactive'         // Temporarily disabled
  | 'archived'         // Archived
  | 'work-in-progress'; // Work in progress / draft

/**
 * Metadata attached to all entities
 */
export interface EntityMetadata {
  tags?: string[];              // User-defined tags (max 20)
  customFields?: Record<string, unknown>; // Extensible metadata (max 50)
  version?: number;             // Optimistic concurrency version
}

/**
 * Base interface for all hierarchy entities
 */
export interface BaseEntity {
  id: string;                    // UUIDv7 or hash-based identifier
  name: string;                  // Display name (unique within parent)
  slug?: string;                 // URL-safe identifier (optional in base, required in concrete types)
  description?: string;          // Optional description
  status: EntityStatus;          // Current status
  metadata: EntityMetadata;      // Audit and tracking information
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  createdBy: string;            // User ID or email
  updatedBy: string;            // User ID or email
}

// ============================================================================
// Hierarchy Entity Interfaces
// ============================================================================

/**
 * Level 1: Organization
 * Root level of the hierarchy
 */
export interface Organization extends BaseEntity {
  slug: string;                 // URL-safe identifier (e.g., 'acme-corp')
  workspaceCount: number;       // Number of child workspaces
}

/**
 * Level 2: Workspace
 * Groups teams within an organization
 */
export interface Workspace extends BaseEntity {
  slug: string;                 // URL-safe identifier
  organizationId: string;       // Parent organization ID
  organizationName: string;     // Denormalized for display
  teamCount: number;            // Number of child teams
}

/**
 * Level 3: Team
 * Groups applications within a workspace
 */
export interface Team extends BaseEntity {
  slug: string;
  workspaceId: string;          // Parent workspace ID
  workspaceName: string;
  organizationId: string;       // Grandparent for breadcrumbs
  organizationName: string;
  applicationCount: number;     // Number of child applications
}

/**
 * Level 4: Application
 * Groups projects within a team
 */
export interface Application extends BaseEntity {
  slug: string;
  teamId: string;               // Parent team ID
  teamName: string;
  workspaceId: string;
  workspaceName: string;
  organizationId: string;
  organizationName: string;
  projectCount: number;         // Number of child projects
}

/**
 * Level 5: Project
 * Groups resources within an application
 */
export interface Project extends BaseEntity {
  slug: string;
  applicationId: string;        // Parent application ID
  applicationName: string;
  teamId: string;
  teamName: string;
  workspaceId: string;
  workspaceName: string;
  organizationId: string;
  organizationName: string;
  resourceCount: number;        // Number of child resources
}

/**
 * Resource type classification
 */
export type ResourceType =
  | 'figma'
  | 'sketch'
  | 'xd'
  | 'pdf'
  | 'image'
  | 'code'
  | 'document'
  | 'other';

/**
 * External system links
 */
export interface ExternalLink {
  system: 'figma' | 'github' | 'jira' | 'other';
  url: string;
  resourceId: string;           // External resource identifier
  resourceType?: string;        // e.g., 'file', 'component', 'issue'
}

/**
 * Level 6: Resource
 * Leaf node of the hierarchy
 */
export interface Resource extends BaseEntity {
  slug: string;
  resourceName: string;         // Original file name with extension
  resourceType: ResourceType;   // Resource type classification
  resourceUrl?: string;         // Optional external URL
  resourceSize?: number;        // File size in bytes
  projectId: string;            // Parent project ID
  projectName: string;
  applicationId: string;
  applicationName: string;
  teamId: string;
  teamName: string;
  workspaceId: string;
  workspaceName: string;
  organizationId: string;
  organizationName: string;
  fqdpId: string;              // Full FQDP path
  externalLinks?: ExternalLink[]; // Links to Figma, GitHub, Jira
}

/**
 * Reference
 * Cross-entity reference link
 */
export interface Reference {
  id: string;
  entityType: EntityType;
  entityId: string;
  name: string;
  link: string;
  type: string;
  externalUid: string;
  description?: string;
  metadata?: Record<string, unknown>;
  status: 'active' | 'inactive' | 'archived';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateReferenceDTO = Omit<Reference, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;
export type UpdateReferenceDTO = Partial<Omit<Reference, 'id' | 'createdAt' | 'createdBy'>>;

// ============================================================================
// FQDP Path Structure
// ============================================================================

/**
 * Fully Qualified Design Path representation
 */
export interface FQDPPath {
  organization: string;         // Organization slug
  workspace: string;            // Workspace slug
  team: string;                 // Team slug
  application: string;          // Application slug
  project: string;              // Project slug
  resource: string;             // Resource slug
  fqdpId: string;              // Canonical path: 'org/ws/team/app/proj/resource'
}

/**
 * FQDP resolution result
 */
export interface FQDPResolution {
  path: FQDPPath;
  entities: {
    organization: Organization;
    workspace: Workspace;
    team: Team;
    application: Application;
    project: Project;
    resource: Resource;
  };
  metadata: {
    resolvedAt: string;
    resolutionTimeMs: number;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Single entity response
 */
export interface EntityResponse<T> {
  data: T;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * API List Response (alias for PaginatedResponse for consistency)
 */
export type ApiListResponse<T> = PaginatedResponse<T>;

/**
 * API Detail Response (alias for EntityResponse for consistency)
 */
export type ApiDetailResponse<T> = EntityResponse<T>;

// ============================================================================
// Form Types (Create/Update DTOs)
// ============================================================================

/**
 * Base form fields (exclude auto-generated fields)
 */
export type CreateEntityDTO<T extends BaseEntity> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Update form fields (all optional except id)
 */
export type UpdateEntityDTO<T extends BaseEntity> = Partial<
  Omit<T, 'id' | 'createdAt' | 'createdBy'>
>;

/**
 * Organization create DTO
 */
export type CreateOrganizationDTO = Omit<
  Organization,
  'id' | 'slug' | 'workspaceCount' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Organization update DTO
 */
export type UpdateOrganizationDTO = Partial<
  Omit<Organization, 'id' | 'workspaceCount' | 'createdAt' | 'createdBy'>
>;

/**
 * Workspace create DTO
 */
export type CreateWorkspaceDTO = Omit<
  Workspace,
  'id' | 'slug' | 'teamCount' | 'organizationName' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Workspace update DTO
 */
export type UpdateWorkspaceDTO = Partial<
  Omit<Workspace, 'id' | 'organizationId' | 'organizationName' | 'teamCount' | 'createdAt' | 'createdBy'>
>;

/**
 * Team create DTO
 */
export type CreateTeamDTO = Omit<
  Team,
  'id' | 'slug' | 'applicationCount' | 'workspaceName' | 'organizationName' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Team update DTO
 */
export type UpdateTeamDTO = Partial<
  Omit<Team, 'id' | 'workspaceId' | 'workspaceName' | 'organizationId' | 'organizationName' | 'applicationCount' | 'createdAt' | 'createdBy'>
>;

/**
 * Application create DTO
 */
export type CreateApplicationDTO = Omit<
  Application,
  'id' | 'slug' | 'projectCount' | 'teamName' | 'workspaceName' | 'organizationName' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Application update DTO
 */
export type UpdateApplicationDTO = Partial<
  Omit<Application, 'id' | 'teamId' | 'teamName' | 'workspaceId' | 'workspaceName' | 'organizationId' | 'organizationName' | 'projectCount' | 'createdAt' | 'createdBy'>
>;

/**
 * Project create DTO
 */
export type CreateProjectDTO = Omit<
  Project,
  'id' | 'slug' | 'resourceCount' | 'applicationName' | 'teamName' | 'workspaceName' | 'organizationName' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Project update DTO
 */
export type UpdateProjectDTO = Partial<
  Omit<Project, 'id' | 'applicationId' | 'applicationName' | 'teamId' | 'teamName' | 'workspaceId' | 'workspaceName' | 'organizationId' | 'organizationName' | 'resourceCount' | 'createdAt' | 'createdBy'>
>;

/**
 * Resource create DTO
 */
export type CreateResourceDTO = Omit<
  Resource,
  'id' | 'slug' | 'fqdpId' | 'projectName' | 'applicationName' | 'teamName' | 'workspaceName' | 'organizationName' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Resource update DTO
 */
export type UpdateResourceDTO = Partial<
  Omit<Resource, 'id' | 'fqdpId' | 'projectId' | 'projectName' | 'applicationId' | 'applicationName' | 'teamId' | 'teamName' | 'workspaceId' | 'workspaceName' | 'organizationId' | 'organizationName' | 'createdAt' | 'createdBy'>
>;

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Common query parameters for list endpoints
 */
export interface ListQueryParams {
  page?: number;                // Page number (default: 1)
  limit?: number;               // Items per page (default: 50, max: 100)
  search?: string;              // Search term
  status?: EntityStatus | EntityStatus[]; // Status filter
  sortBy?: 'name' | 'createdAt' | 'updatedAt'; // Sort field
  sortOrder?: 'asc' | 'desc';   // Sort order
  organizationId?: string;      // Filter by parent organization (for workspaces)
  workspaceId?: string;         // Filter by parent workspace (for teams)
  teamId?: string;              // Filter by parent team (for applications)
  applicationId?: string;       // Filter by parent application (for projects)
  projectId?: string;           // Filter by parent project (for resources)
}

/**
 * Search query parameters
 */
export interface SearchQueryParams {
  q: string;                    // Search query (required)
  level?: 'organization' | 'workspace' | 'team' | 'application' | 'project' | 'resource';
  status?: EntityStatus[];
  limit?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Union type of all entity types
 */
export type AnyEntity =
  | Organization
  | Workspace
  | Team
  | Application
  | Project
  | Resource
  | Reference;

/**
 * Entity type names
 */
export type EntityType =
  | 'organization'
  | 'workspace'
  | 'team'
  | 'application'
  | 'project'
  | 'resource'
  | 'reference';

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  entityType?: EntityType;
}
