/**
 * FQDP Management System - Zod Validation Schemas
 * Version: 1.0
 * Based on: REQ.v002.jsx Section 6 (Business Rules)
 */

import { z } from 'zod';

// ============================================================================
// Base Entity Schemas
// ============================================================================

/**
 * Entity status schema
 * Must match backend enum in prisma/schema.prisma
 */
export const EntityStatusSchema = z.enum([
  'active',
  'inactive',
  'archived',
  'work-in-progress',
]);

/**
 * Entity metadata schema
 */
export const EntityMetadataSchema = z.object({
  tags: z
    .array(z.string().min(2).max(50))
    .max(20)
    .optional()
    .transform((tags) => tags?.map((tag) => tag.toLowerCase())), // Normalize to lowercase
  customFields: z.record(z.string(), z.unknown()).optional(),
  version: z.number().optional(),
});

/**
 * Base entity schema
 */
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_()]+$/,
      'Name can only contain alphanumeric characters, spaces, hyphens, underscores, and parentheses'
    )
    .transform((val) => val.trim()), // Auto-trim whitespace
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .transform((val) => val?.trim()),
  status: EntityStatusSchema,
  metadata: EntityMetadataSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

/**
 * Slug validation schema
 * Pattern: lowercase alphanumeric + hyphens, no leading/trailing hyphens
 */
export const SlugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100, 'Slug must be at most 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format: must be lowercase alphanumeric with hyphens');

// ============================================================================
// Hierarchy Entity Schemas
// ============================================================================

/**
 * Organization schema
 */
export const OrganizationSchema = BaseEntitySchema.extend({
  slug: SlugSchema,
  workspaceCount: z.number().int().min(0),
});

/**
 * Workspace schema
 */
export const WorkspaceSchema = BaseEntitySchema.extend({
  slug: SlugSchema,
  organizationId: z.string().uuid(),
  organizationName: z.string(),
  teamCount: z.number().int().min(0),
});

/**
 * Team schema
 */
export const TeamSchema = BaseEntitySchema.extend({
  slug: SlugSchema,
  workspaceId: z.string().uuid(),
  workspaceName: z.string(),
  organizationId: z.string().uuid(),
  organizationName: z.string(),
  applicationCount: z.number().int().min(0),
});

/**
 * Application schema
 */
export const ApplicationSchema = BaseEntitySchema.extend({
  slug: SlugSchema,
  teamId: z.string().uuid(),
  teamName: z.string(),
  workspaceId: z.string().uuid(),
  workspaceName: z.string(),
  organizationId: z.string().uuid(),
  organizationName: z.string(),
  projectCount: z.number().int().min(0),
});

/**
 * Project schema
 */
export const ProjectSchema = BaseEntitySchema.extend({
  slug: SlugSchema,
  applicationId: z.string().uuid(),
  applicationName: z.string(),
  teamId: z.string().uuid(),
  teamName: z.string(),
  workspaceId: z.string().uuid(),
  workspaceName: z.string(),
  organizationId: z.string().uuid(),
  organizationName: z.string(),
  resourceCount: z.number().int().min(0),
});

/**
 * Resource type schema
 */
export const ResourceTypeSchema = z.enum([
  'figma',
  'sketch',
  'xd',
  'pdf',
  'image',
  'code',
  'document',
  'other',
]);

/**
 * External link schema
 */
export const ExternalLinkSchema = z.object({
  system: z.enum(['figma', 'github', 'jira', 'other']),
  url: z.string().url('Invalid URL format'),
  resourceId: z.string(),
  resourceType: z.string().optional(),
});

/**
 * Figma link validator
 */
export const FigmaLinkSchema = z.object({
  system: z.literal('figma'),
  url: z.string().regex(/^https:\/\/(?:www\.)?figma\.com\/file\/[a-zA-Z0-9]+\/.+$/, 'Invalid Figma URL format'),
  resourceId: z.string(),
  resourceType: z.string().optional(),
});

/**
 * GitHub link validator
 */
export const GitHubLinkSchema = z.object({
  system: z.literal('github'),
  url: z.string().regex(/^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+.*$/, 'Invalid GitHub URL format'),
  resourceId: z.string(),
  resourceType: z.string().optional(),
});

/**
 * Jira link validator
 */
export const JiraLinkSchema = z.object({
  system: z.literal('jira'),
  url: z.string().regex(/^https:\/\/.+\.atlassian\.net\/browse\/[A-Z]+-[0-9]+$/, 'Invalid Jira URL format'),
  resourceId: z.string().regex(/^[A-Z]+-[0-9]+$/, 'Invalid Jira issue key format'),
  resourceType: z.string().optional(),
});

/**
 * Resource schema
 */
export const ResourceSchema = BaseEntitySchema.extend({
  slug: SlugSchema,
  resourceName: z.string().min(1, 'Resource name is required'),
  resourceType: ResourceTypeSchema,
  resourceUrl: z.string().url('Invalid URL format').optional(),
  resourceSize: z.number().int().min(0).max(10 * 1024 * 1024, 'File size must be less than 10MB').optional(),
  projectId: z.string().uuid(),
  projectName: z.string(),
  applicationId: z.string().uuid(),
  applicationName: z.string(),
  teamId: z.string().uuid(),
  teamName: z.string(),
  workspaceId: z.string().uuid(),
  workspaceName: z.string(),
  organizationId: z.string().uuid(),
  organizationName: z.string(),
  fqdpId: z.string(),
  externalLinks: z.array(ExternalLinkSchema).optional(),
});

// ============================================================================
// Form Validation Schemas (Create/Update)
// ============================================================================

/**
 * Organization create form schema
 */
export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .transform((val) => val?.trim()),
  status: EntityStatusSchema.default('active'),
  metadata: EntityMetadataSchema.default({}),
});

/**
 * Organization update form schema
 */
export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

/**
 * Workspace create form schema
 */
export const CreateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .transform((val) => val.trim()),
  organizationId: z.string().uuid('Invalid organization ID'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .transform((val) => val?.trim()),
  status: EntityStatusSchema.default('active'),
  metadata: EntityMetadataSchema.default({}),
});

/**
 * Workspace update form schema
 */
export const UpdateWorkspaceSchema = CreateWorkspaceSchema.partial().omit({ organizationId: true });

/**
 * Team create form schema
 */
export const CreateTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .transform((val) => val.trim()),
  workspaceId: z.string().uuid('Invalid workspace ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .transform((val) => val?.trim()),
  status: EntityStatusSchema.default('active'),
  metadata: EntityMetadataSchema.default({}),
});

/**
 * Team update form schema
 */
export const UpdateTeamSchema = CreateTeamSchema.partial().omit({ workspaceId: true, organizationId: true });

/**
 * Application create form schema
 */
export const CreateApplicationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .transform((val) => val.trim()),
  teamId: z.string().uuid('Invalid team ID'),
  workspaceId: z.string().uuid('Invalid workspace ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .transform((val) => val?.trim()),
  status: EntityStatusSchema.default('active'),
  metadata: EntityMetadataSchema.default({}),
});

/**
 * Application update form schema
 */
export const UpdateApplicationSchema = CreateApplicationSchema.partial().omit({ teamId: true, workspaceId: true, organizationId: true });

/**
 * Project create form schema
 */
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .transform((val) => val.trim()),
  applicationId: z.string().uuid('Invalid application ID'),
  teamId: z.string().uuid('Invalid team ID'),
  workspaceId: z.string().uuid('Invalid workspace ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .transform((val) => val?.trim()),
  status: EntityStatusSchema.default('active'),
  metadata: EntityMetadataSchema.default({}),
});

/**
 * Project update form schema
 */
export const UpdateProjectSchema = CreateProjectSchema.partial().omit({ applicationId: true, teamId: true, workspaceId: true, organizationId: true });

/**
 * Resource create form schema
 */
export const CreateResourceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .transform((val) => val.trim()),
  resourceName: z.string().min(1, 'Resource name is required'),
  resourceType: ResourceTypeSchema,
  resourceUrl: z.string().url('Invalid URL format').optional(),
  resourceSize: z.number().int().min(0).max(10 * 1024 * 1024, 'File size must be less than 10MB').optional(),
  projectId: z.string().uuid('Invalid project ID'),
  applicationId: z.string().uuid('Invalid application ID'),
  teamId: z.string().uuid('Invalid team ID'),
  workspaceId: z.string().uuid('Invalid workspace ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .transform((val) => val?.trim()),
  status: EntityStatusSchema.default('active'),
  metadata: EntityMetadataSchema.default({}),
  externalLinks: z.array(ExternalLinkSchema).optional(),
});

/**
 * Resource update form schema
 */
export const UpdateResourceSchema = CreateResourceSchema.partial().omit({
  projectId: true,
  applicationId: true,
  teamId: true,
  workspaceId: true,
  organizationId: true
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generates a URL-safe slug from a name
 * @param name - The name to convert to a slug
 * @returns URL-safe slug
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')  // Remove invalid characters
    .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
}

/**
 * Validates an entity using the appropriate schema
 * @param entity - The entity to validate
 * @param schema - The Zod schema to use
 * @returns Validation result
 */
export function validateEntity<T>(
  entity: unknown,
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const data = schema.parse(entity);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}
