/**
 * LLM Default Validation Schemas
 */

import { z } from 'zod';

export const llmDefaultSchema = z.object({
  category: z.enum(['tools', 'permissions', 'goals', 'prompts', 'tones', 'roles', 'providers']),
  name: z.string().min(3, 'Name must be at least 3 characters').max(255, 'Name must be at most 255 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  value: z.unknown(),
  context: z.string().optional().default(''),
  is_default: z.boolean().optional(),
});

export type LLMDefaultFormData = z.infer<typeof llmDefaultSchema>;

export const createLLMDefaultSchema = llmDefaultSchema;

export const updateLLMDefaultSchema = llmDefaultSchema.omit({ category: true }).partial();

export type UpdateLLMDefaultFormData = z.infer<typeof updateLLMDefaultSchema>;
