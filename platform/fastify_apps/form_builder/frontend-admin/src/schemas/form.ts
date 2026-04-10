import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  version: z.string().optional().default('1.0.0'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  created_by: z.string().optional().default(''),
  tag_names: z.array(z.string()).optional().default([]),
});

export type FormInput = z.infer<typeof formSchema>;
