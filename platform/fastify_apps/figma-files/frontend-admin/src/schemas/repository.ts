import { z } from 'zod';

export const figmaFileTypeSchema = z.enum([
  'design_system',
  'component_library',
  'prototype',
  'illustration',
  'icon_set',
]);
export const figmaFileStatusSchema = z.enum(['stable', 'beta', 'deprecated', 'experimental']);
export const figmaFileSourceSchema = z.enum(['figma', 'figma_community', 'manual']);

export const figmaFileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  type: figmaFileTypeSchema,
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional()
    .or(z.literal('')),
  figma_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  figma_file_key: z
    .string()
    .max(255, 'Figma file key must be 255 characters or less')
    .optional()
    .or(z.literal('')),
  thumbnail_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  page_count: z
    .number()
    .min(0, 'Page count must be 0 or greater')
    .optional(),
  component_count: z
    .number()
    .min(0, 'Component count must be 0 or greater')
    .optional(),
  style_count: z
    .number()
    .min(0, 'Style count must be 0 or greater')
    .optional(),
  last_modified_by: z
    .string()
    .max(255, 'Last modified by must be 255 characters or less')
    .optional()
    .or(z.literal('')),
  editor_type: z
    .string()
    .max(50, 'Editor type must be 50 characters or less')
    .optional()
    .or(z.literal('')),
  status: figmaFileStatusSchema.default('stable'),
  source: figmaFileSourceSchema.optional(),
  trending: z.boolean().default(false),
  verified: z.boolean().default(false),
  tag_names: z.array(z.string()).default([]),
});

export type FigmaFileFormData = z.infer<typeof figmaFileSchema>;

// Default values for creating a new figma file
export const figmaFileDefaults: FigmaFileFormData = {
  name: '',
  type: 'design_system',
  description: '',
  figma_url: '',
  figma_file_key: '',
  thumbnail_url: '',
  page_count: undefined,
  component_count: undefined,
  style_count: undefined,
  last_modified_by: '',
  editor_type: '',
  status: 'stable',
  source: undefined,
  trending: false,
  verified: false,
  tag_names: [],
};

// Legacy aliases for backward compatibility within this module
export const repositorySchema = figmaFileSchema;
export const repositoryTypeSchema = figmaFileTypeSchema;
export const repositoryStatusSchema = figmaFileStatusSchema;
export const repositorySourceSchema = figmaFileSourceSchema;
export const repositoryDefaults = figmaFileDefaults;
export type RepositoryFormData = FigmaFileFormData;
