import { z } from 'zod';

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(100, 'Tag name must be 100 characters or less')
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
      'Tag must be lowercase alphanumeric with optional hyphens (no leading/trailing hyphens)'
    ),
});

export type TagFormData = z.infer<typeof tagSchema>;

export const tagDefaults: TagFormData = {
  name: '',
};
