import { z } from 'zod';

export const personaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  role: z.enum(['assistant', 'architect', 'developer', 'analyst']),
  tone: z.enum(['neutral', 'analytical', 'friendly', 'professional', 'casual']),
  llm_provider: z.string().min(1, 'Provider is required'),
  llm_temperature: z.number().min(0).max(2),
  goals: z.array(z.string()).default([]),
  tools: z.array(z.enum(['web-search', 'code-gen', 'analysis-engine', 'debugger', 'test-runner'])).default([]),
  permitted_to: z.array(z.enum(['read_repo', 'write_code', 'run_test', 'generate_report', 'access_docs'])).default([]),
});

export type PersonaFormData = z.infer<typeof personaSchema>;

export const llmDefaultSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  value: z.string().optional(),
  is_default: z.boolean().default(false),
});

export type LLMDefaultFormData = z.infer<typeof llmDefaultSchema>;
