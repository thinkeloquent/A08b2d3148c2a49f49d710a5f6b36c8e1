import { z } from 'zod';

export const EntityStatusSchema = z.enum([
  'active',
  'inactive',
  'archived',
  'work-in-progress',
]);

export const EntityMetadataSchema = z.object({
  tags: z
    .array(z.string().min(2).max(50))
    .max(20)
    .optional()
    .transform((tags) => tags?.map((tag) => tag.toLowerCase())),
  customFields: z.record(z.string(), z.unknown()).optional(),
  version: z.number().optional(),
});

export const SlugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100, 'Slug must be at most 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format: must be lowercase alphanumeric with hyphens');

export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .transform((val) => val.trim()),
  slug: SlugSchema.optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .transform((val) => val?.trim()),
  status: EntityStatusSchema.default('active'),
  metadata: EntityMetadataSchema.default({}),
});

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
