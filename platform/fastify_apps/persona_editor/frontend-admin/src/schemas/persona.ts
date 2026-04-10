/**
 * Persona Validation Schemas
 */

import { z } from 'zod';

export const memorySchema = z.object({
  enabled: z.boolean(),
  scope: z.enum(['session', 'persistent']),
  storage_id: z.string().optional(),
});

export const personaSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255, 'Name must be at most 255 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  role: z.string().max(50).optional(),
  tone: z.string().max(50).optional(),
  version: z.string().optional(),
  llm_provider: z.string().min(1, 'LLM provider is required'),
  llm_temperature: z.number().min(0).max(1).optional(),
  llm_parameters: z.record(z.unknown()).optional(),
  goals: z.array(z.string()).max(10, 'Maximum 10 goals allowed').optional(),
  tools: z.array(z.string()).optional(),
  permitted_to: z.array(z.string()).optional(),
  prompt_system_template: z.array(z.string()).optional(),
  prompt_user_template: z.array(z.string()).optional(),
  prompt_context_template: z.array(z.string()).optional(),
  prompt_instruction: z.array(z.string()).optional(),
  agent_delegate: z.array(z.string()).optional(),
  agent_call: z.array(z.string()).optional(),
  memory: memorySchema.optional(),
  context_files: z.array(z.string()).optional(),
});

export type PersonaFormData = z.infer<typeof personaSchema>;

export const createPersonaSchema = personaSchema;

export const updatePersonaSchema = personaSchema.partial();

export type UpdatePersonaFormData = z.infer<typeof updatePersonaSchema>;
