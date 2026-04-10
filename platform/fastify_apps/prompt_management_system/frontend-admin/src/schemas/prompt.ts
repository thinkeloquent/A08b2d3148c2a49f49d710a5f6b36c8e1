import { z } from 'zod';

export const promptSchema = z.object({
  project_id: z.string().uuid('Select a label'),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Must be lowercase kebab-case'),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

export type PromptFormData = z.infer<typeof promptSchema>;

export const versionSchema = z.object({
  template: z.string().min(1, 'Template is required'),
  config: z.string().optional(),
  commit_message: z.string().max(500).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export type VersionFormData = z.infer<typeof versionSchema>;

export const deploySchema = z.object({
  environment: z.string().min(1, 'Environment is required'),
  version_id: z.string().uuid('Select a version'),
});

export type DeployFormData = z.infer<typeof deploySchema>;
