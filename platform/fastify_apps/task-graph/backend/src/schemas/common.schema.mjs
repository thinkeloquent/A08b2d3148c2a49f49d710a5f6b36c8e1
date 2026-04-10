/**
 * Common Zod Schemas
 *
 * Shared validation schemas used across task-graph
 *
 * @module schemas/common.schema
 */

import { z } from 'zod';

// ============================================================================
// PRIMITIVE SCHEMAS
// ============================================================================

export const UUIDSchema = z.string().min(1).max(255);

export const ISODateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid ISO date string' }
);

export const NonNegativeIntSchema = z.number().int().min(0);
export const PositiveIntSchema = z.number().int().min(1);

export const MetadataSchema = z.record(z.unknown()).optional();

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const TaskStatusSchema = z.enum([
  'PENDING',
  'TODO',
  'IN_PROGRESS',
  'DONE',
  'BLOCKED',
  'SKIPPED',
  'RETRYING',
  'FAILED',
]);

export const StepStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'SKIPPED',
  'BLOCKED',
]);

export const WorkflowStatusSchema = z.enum([
  'PENDING',
  'RUNNING',
  'PAUSED',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export const RepeatIntervalSchema = z.enum([
  'NONE',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
]);

export const ExecutionEventTypeSchema = z.enum([
  'TASK_CREATED',
  'TASK_STARTED',
  'TASK_COMPLETED',
  'TASK_FAILED',
  'TASK_SKIPPED',
  'TASK_RETRIED',
  'TASK_BLOCKED',
  'TASK_UNBLOCKED',
  'STEP_CREATED',
  'STEP_STARTED',
  'STEP_COMPLETED',
  'STEP_FAILED',
  'STEP_SKIPPED',
  'STEP_RETRIED',
  'STEP_BLOCKED',
  'STEP_UNBLOCKED',
  'DEPENDENCY_ADDED',
  'DEPENDENCY_REMOVED',
  'DEPENDENCY_CYCLE_DETECTED',
  'CHECKPOINT_CREATED',
  'CHECKPOINT_RESTORED',
  'EXECUTION_STARTED',
  'EXECUTION_COMPLETED',
  'EXECUTION_FAILED',
  'WORKFLOW_STARTED',
  'WORKFLOW_PAUSED',
  'WORKFLOW_RESUMED',
  'WORKFLOW_COMPLETED',
  'WORKFLOW_FAILED',
  'WORKFLOW_CANCELLED',
]);

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

export const PaginationInputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(10),
  offset: z.number().int().min(0).optional().default(0),
});

export const PaginationMetaSchema = z.object({
  total: NonNegativeIntSchema,
  limit: PositiveIntSchema,
  offset: NonNegativeIntSchema,
  hasMore: z.boolean(),
});

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

export const StatusFilterSchema = z.union([
  TaskStatusSchema,
  z.array(TaskStatusSchema),
]);

export const DateRangeFilterSchema = z.object({
  from: ISODateStringSchema.optional(),
  to: ISODateStringSchema.optional(),
});

export const SortInputSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});
