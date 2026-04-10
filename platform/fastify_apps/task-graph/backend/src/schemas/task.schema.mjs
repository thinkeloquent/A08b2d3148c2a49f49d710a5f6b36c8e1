/**
 * Task Zod Schemas
 *
 * Task entity validation with idempotency key support
 *
 * @module schemas/task.schema
 */

import { z } from 'zod';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonNegativeIntSchema,
  PositiveIntSchema,
  MetadataSchema,
  TaskStatusSchema,
  RepeatIntervalSchema,
  PaginationInputSchema,
  PaginationMetaSchema,
  DateRangeFilterSchema,
  SortInputSchema,
} from './common.schema.mjs';

// ============================================================================
// BASE TASK SCHEMA
// ============================================================================

export const TaskBaseSchema = z.object({
  id: UUIDSchema,
  idempotencyKey: z.string().min(1).max(255).nullable(),
  title: z.string().min(1).max(255),
  description: z.string().max(10000).nullable(),
  status: TaskStatusSchema,
  dueDate: ISODateStringSchema.nullable(),
  repeatInterval: RepeatIntervalSchema,
  startedAt: ISODateStringSchema.nullable(),
  completedAt: ISODateStringSchema.nullable(),
  failedAt: ISODateStringSchema.nullable(),
  retryCount: NonNegativeIntSchema,
  maxRetries: PositiveIntSchema,
  skipReason: z.string().max(500).nullable(),
  metadata: MetadataSchema,
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  creatorId: UUIDSchema.nullable(),
  assignedToId: UUIDSchema.nullable(),
  templateId: UUIDSchema.nullable(),
});

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

export const CreateTaskInputSchema = z.object({
  idempotencyKey: z.string().min(1).max(255).optional(),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(10000).optional(),
  status: TaskStatusSchema.optional().default('PENDING'),
  dueDate: ISODateStringSchema.optional(),
  repeatInterval: RepeatIntervalSchema.optional().default('NONE'),
  maxRetries: z.number().int().min(0).max(10).optional().default(3),
  metadata: MetadataSchema,
  assignedToId: UUIDSchema.optional(),
  templateId: UUIDSchema.optional(),
});

export const UpdateTaskInputSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(10000).nullable().optional(),
  status: TaskStatusSchema.optional(),
  dueDate: ISODateStringSchema.nullable().optional(),
  repeatInterval: RepeatIntervalSchema.optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
  skipReason: z.string().max(500).nullable().optional(),
  metadata: MetadataSchema,
  assignedToId: UUIDSchema.nullable().optional(),
});

export const UpdateTaskStatusInputSchema = z.object({
  status: TaskStatusSchema,
  skipReason: z.string().min(1).max(500).optional(),
  metadata: MetadataSchema,
});

// Validate skip reason when status is SKIPPED
export const UpdateTaskStatusInputSchemaRefined = UpdateTaskStatusInputSchema.refine(
  (data) => {
    if (data.status === 'SKIPPED') {
      return !!data.skipReason;
    }
    return true;
  },
  {
    message: 'Skip reason is required when status is SKIPPED',
    path: ['skipReason'],
  }
);

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const GetTaskByIdInputSchema = z.object({
  taskId: UUIDSchema,
  includeSteps: z.boolean().optional().default(false),
  includeDependencies: z.boolean().optional().default(false),
  includeFiles: z.boolean().optional().default(false),
  includeNotes: z.boolean().optional().default(false),
});

export const GetTaskByIdempotencyKeyInputSchema = z.object({
  idempotencyKey: z.string().min(1).max(255),
});

export const ListTasksInputSchema = PaginationInputSchema.extend({
  status: TaskStatusSchema.or(z.array(TaskStatusSchema)).optional(),
  assignedToId: UUIDSchema.optional(),
  creatorId: UUIDSchema.optional(),
  dueDateRange: DateRangeFilterSchema.optional(),
  search: z.string().max(255).optional(),
  sort: SortInputSchema.optional(),
  includeSteps: z.boolean().optional().default(false),
});

export const DeleteTaskInputSchema = z.object({
  taskId: UUIDSchema,
});

// ============================================================================
// EXECUTION OPERATIONS
// ============================================================================

export const StartTaskExecutionInputSchema = z.object({
  taskId: UUIDSchema,
  executionId: z.string().min(1).optional(),
  metadata: MetadataSchema,
});

export const CompleteTaskInputSchema = z.object({
  taskId: UUIDSchema,
  metadata: MetadataSchema,
});

export const FailTaskInputSchema = z.object({
  taskId: UUIDSchema,
  error: z.string().min(1).max(5000),
  shouldRetry: z.boolean().optional().default(true),
  metadata: MetadataSchema,
});

export const SkipTaskInputSchema = z.object({
  taskId: UUIDSchema,
  reason: z.string().min(1, 'Skip reason is required').max(500),
  metadata: MetadataSchema,
});

export const RetryTaskInputSchema = z.object({
  taskId: UUIDSchema,
  resetRetryCount: z.boolean().optional().default(false),
  metadata: MetadataSchema,
});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

export const TaskOutputSchema = TaskBaseSchema.extend({
  stepsCount: NonNegativeIntSchema.optional(),
  completedStepsCount: NonNegativeIntSchema.optional(),
  prerequisitesCount: NonNegativeIntSchema.optional(),
  dependentsCount: NonNegativeIntSchema.optional(),
});

export const ListTasksOutputSchema = z.object({
  tasks: z.array(TaskOutputSchema),
  pagination: PaginationMetaSchema,
});

export const TaskExecutionStatusOutputSchema = z.object({
  taskId: UUIDSchema,
  status: TaskStatusSchema,
  isRunning: z.boolean(),
  currentExecutionId: z.string().nullable(),
  startedAt: ISODateStringSchema.nullable(),
  completedAt: ISODateStringSchema.nullable(),
  failedAt: ISODateStringSchema.nullable(),
  retryCount: NonNegativeIntSchema,
  maxRetries: PositiveIntSchema,
  canRetry: z.boolean(),
});

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export const BatchCreateTasksInputSchema = z.object({
  tasks: z.array(CreateTaskInputSchema).min(1).max(100),
});

export const BatchUpdateTasksInputSchema = z.object({
  updates: z
    .array(
      z.object({
        taskId: UUIDSchema,
        data: UpdateTaskInputSchema,
      })
    )
    .min(1)
    .max(100),
});

export const BatchDeleteTasksInputSchema = z.object({
  taskIds: z.array(UUIDSchema).min(1).max(100),
});
