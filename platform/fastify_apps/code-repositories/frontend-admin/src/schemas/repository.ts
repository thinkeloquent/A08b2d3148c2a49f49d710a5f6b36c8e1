import { z } from 'zod';

export const repositoryTypeSchema = z.enum(['npm', 'docker', 'python']);
export const repositoryStatusSchema = z.enum(['stable', 'beta', 'deprecated', 'experimental']);
export const repositorySourceSchema = z.enum(['github', 'npm', 'dockerhub', 'pypi', 'manual']);

export const repositorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  type: repositoryTypeSchema,
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional()
    .or(z.literal('')),
  github_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  package_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  version: z
    .string()
    .max(50, 'Version must be 50 characters or less')
    .optional()
    .or(z.literal('')),
  maintainer: z
    .string()
    .max(255, 'Maintainer must be 255 characters or less')
    .optional()
    .or(z.literal('')),
  language: z
    .string()
    .max(50, 'Language must be 50 characters or less')
    .optional()
    .or(z.literal('')),
  license: z
    .string()
    .max(100, 'License must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  size: z
    .string()
    .max(50, 'Size must be 50 characters or less')
    .optional()
    .or(z.literal('')),
  stars: z
    .number()
    .min(0, 'Stars must be 0 or greater')
    .default(0),
  forks: z
    .number()
    .min(0, 'Forks must be 0 or greater')
    .default(0),
  dependencies: z
    .number()
    .min(0, 'Dependencies must be 0 or greater')
    .optional(),
  health_score: z
    .number()
    .min(0, 'Health score must be between 0 and 100')
    .max(100, 'Health score must be between 0 and 100')
    .optional(),
  status: repositoryStatusSchema.default('stable'),
  source: repositorySourceSchema.optional(),
  trending: z.boolean().default(false),
  verified: z.boolean().default(false),
  tag_names: z.array(z.string()).default([]),
});

export type RepositoryFormData = z.infer<typeof repositorySchema>;

// Default values for creating a new repository
export const repositoryDefaults: RepositoryFormData = {
  name: '',
  type: 'npm',
  description: '',
  github_url: '',
  package_url: '',
  version: '',
  maintainer: '',
  language: '',
  license: '',
  size: '',
  stars: 0,
  forks: 0,
  dependencies: undefined,
  health_score: undefined,
  status: 'stable',
  source: undefined,
  trending: false,
  verified: false,
  tag_names: [],
};
