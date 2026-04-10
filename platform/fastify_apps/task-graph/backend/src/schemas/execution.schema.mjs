/**
 * Execution Log Zod Schemas
 *
 * Execution log validation
 *
 * @module schemas/execution.schema
 */

import { z } from 'zod';
import {
  UUIDSchema,
  ISODateStringSchema,
  ExecutionEventTypeSchema,
  PaginationInputSchema,
  PaginationMetaSchema,
} from './common.schema.mjs';

// ============================================================================
// BASE EXECUTION LOG SCHEMA
// ============================================================================

export const ExecutionLogBaseSchema = z.object({
  id: UUIDSchema,
  eventType: ExecutionEventTypeSchema,
  eventData: z.record(z.unknown()),
  correlationId: z.string(),
  executionId: z.string().nullable(),
  parentEventId: z.string().nullable(),
  timestamp: ISODateStringSchema,
  taskId: UUIDSchema.nullable(),
  stepId: UUIDSchema.nullable(),
  userId: UUIDSchema.nullable(),
});

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

export const CreateExecutionLogInputSchema = z.object({
  eventType: ExecutionEventTypeSchema,
  eventData: z.record(z.unknown()),
  correlationId: z.string().min(1),
  executionId: z.string().optional(),
  parentEventId: z.string().optional(),
  taskId: UUIDSchema.optional(),
  stepId: UUIDSchema.optional(),
  userId: UUIDSchema.optional(),
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const ListExecutionLogsInputSchema = PaginationInputSchema.extend({
  taskId: UUIDSchema.optional(),
  stepId: UUIDSchema.optional(),
  eventType: ExecutionEventTypeSchema.optional(),
  correlationId: z.string().optional(),
  executionId: z.string().optional(),
  fromTimestamp: ISODateStringSchema.optional(),
  toTimestamp: ISODateStringSchema.optional(),
});

export const GetExecutionTimelineInputSchema = z.object({
  taskId: UUIDSchema,
  executionId: z.string().optional(),
});

export const GetExecutionStatusInputSchema = z.object({
  taskId: UUIDSchema,
});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

export const ExecutionLogOutputSchema = ExecutionLogBaseSchema;

export const ListExecutionLogsOutputSchema = z.object({
  logs: z.array(ExecutionLogOutputSchema),
  pagination: PaginationMetaSchema,
});

export const ExecutionTimelineOutputSchema = z.object({
  taskId: UUIDSchema,
  executionId: z.string().nullable(),
  events: z.array(
    z.object({
      id: UUIDSchema,
      eventType: ExecutionEventTypeSchema,
      timestamp: ISODateStringSchema,
      duration: z.number().nullable(),
      data: z.record(z.unknown()),
    })
  ),
  startedAt: ISODateStringSchema.nullable(),
  completedAt: ISODateStringSchema.nullable(),
  totalDuration: z.number().nullable(),
});

// ============================================================================
// EVENT DATA SCHEMAS
// ============================================================================

export const TaskCreatedEventDataSchema = z.object({
  taskId: UUIDSchema,
  title: z.string(),
  status: z.string(),
  createdBy: z.string().optional(),
});

export const TaskStartedEventDataSchema = z.object({
  taskId: UUIDSchema,
  executionId: z.string(),
  startedAt: ISODateStringSchema,
});

export const TaskCompletedEventDataSchema = z.object({
  taskId: UUIDSchema,
  executionId: z.string(),
  completedAt: ISODateStringSchema,
  duration: z.number(),
  completedStepsCount: z.number(),
  skippedStepsCount: z.number(),
});

export const TaskFailedEventDataSchema = z.object({
  taskId: UUIDSchema,
  executionId: z.string(),
  failedAt: ISODateStringSchema,
  error: z.string(),
  retryCount: z.number(),
  willRetry: z.boolean(),
});

export const TaskSkippedEventDataSchema = z.object({
  taskId: UUIDSchema,
  reason: z.string(),
  skippedAt: ISODateStringSchema,
});

export const StepCreatedEventDataSchema = z.object({
  stepId: UUIDSchema,
  taskId: UUIDSchema,
  content: z.string(),
  order: z.number().nullable(),
});

export const StepCompletedEventDataSchema = z.object({
  stepId: UUIDSchema,
  taskId: UUIDSchema,
  completedAt: ISODateStringSchema,
});

export const StepSkippedEventDataSchema = z.object({
  stepId: UUIDSchema,
  taskId: UUIDSchema,
  reason: z.string(),
  skippedAt: ISODateStringSchema,
});

export const CheckpointCreatedEventDataSchema = z.object({
  checkpointId: UUIDSchema,
  taskId: UUIDSchema,
  checkpointType: z.string(),
  ttl: z.number(),
});

export const CheckpointRestoredEventDataSchema = z.object({
  checkpointId: UUIDSchema,
  taskId: UUIDSchema,
  restoredAt: ISODateStringSchema,
});

export const DependencyAddedEventDataSchema = z.object({
  prerequisiteId: UUIDSchema,
  dependentId: UUIDSchema,
  allowSkip: z.boolean(),
});

export const DependencyCycleDetectedEventDataSchema = z.object({
  cyclePath: z.array(z.string()),
  attemptedDependency: z.object({
    prerequisiteId: UUIDSchema,
    dependentId: UUIDSchema,
  }),
});
