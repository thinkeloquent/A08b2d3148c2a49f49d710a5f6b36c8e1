import { z } from 'zod';

export const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().optional().default(''),
});

export type TagInput = z.infer<typeof tagSchema>;
