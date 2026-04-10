import { z } from 'zod';

export const metadataSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  content_type: z
    .string()
    .max(100, 'Content type must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  source_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  source_hash_id: z
    .string()
    .max(255, 'Hash ID must be 255 characters or less')
    .optional()
    .or(z.literal('')),
  labels: z.array(z.string()).default([]),
});

export type MetadataFormData = z.infer<typeof metadataSchema>;

export const metadataDefaults: MetadataFormData = {
  name: '',
  content_type: '',
  source_url: '',
  source_hash_id: '',
  labels: [],
};
