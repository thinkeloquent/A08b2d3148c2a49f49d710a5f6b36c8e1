/**
 * Workflow Zod Schemas
 *
 * Workflow execution validation
 *
 * @module schemas/workflow.schema
 */

import { z } from 'zod';
import {
  UUIDSchema,
  ISODateStringSchema,
  MetadataSchema,
  WorkflowStatusSchema,
  PaginationInputSchema,
  PaginationMetaSchema,
} from './common.schema.mjs';

// ============================================================================
// BASE WORKFLOW EXECUTION SCHEMA
// ============================================================================

export const WorkflowExecutionBaseSchema = z.object({
  id: UUIDSchema,
  workflowId: z.string(),
  executionId: z.string(),
  workflowType: z.string(),
  status: WorkflowStatusSchema,
  graphDefinition: z.record(z.unknown()).nullable(),
  currentNode: z.string().nullable(),
  startedAt: ISODateStringSchema,
  completedAt: ISODateStringSchema.nullable(),
  pausedAt: ISODateStringSchema.nullable(),
  checkpointId: z.string().nullable(),
  errorMessage: z.string().nullable(),
  metadata: MetadataSchema,
  correlationId: z.string(),
  completedTasks: z.array(z.string()),
  failedTasks: z.array(z.string()),
  skippedTasks: z.array(z.string()),
  taskId: UUIDSchema,
  userId: UUIDSchema.nullable(),
});

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

export const StartWorkflowInputSchema = z.object({
  taskId: UUIDSchema,
  workflowType: z.string().optional().default('task_execution'),
  graphDefinition: z.record(z.unknown()).optional(),
  metadata: MetadataSchema,
});

export const PauseWorkflowInputSchema = z.object({
  workflowId: z.string(),
  reason: z.string().optional(),
});

export const ResumeWorkflowInputSchema = z.object({
  workflowId: z.string(),
  metadata: MetadataSchema,
});

export const CancelWorkflowInputSchema = z.object({
  workflowId: z.string(),
  reason: z.string().optional(),
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const GetWorkflowStatusInputSchema = z.object({
  workflowId: z.string(),
});

export const ListWorkflowsInputSchema = PaginationInputSchema.extend({
  taskId: UUIDSchema.optional(),
  status: WorkflowStatusSchema.optional(),
  workflowType: z.string().optional(),
});

export const GetWorkflowGraphInputSchema = z.object({
  workflowId: z.string(),
});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

export const WorkflowExecutionOutputSchema = WorkflowExecutionBaseSchema;

export const ListWorkflowsOutputSchema = z.object({
  workflows: z.array(WorkflowExecutionOutputSchema),
  pagination: PaginationMetaSchema,
});

export const WorkflowStatusOutputSchema = z.object({
  workflowId: z.string(),
  executionId: z.string(),
  status: WorkflowStatusSchema,
  currentNode: z.string().nullable(),
  progress: z.object({
    completedTasks: z.number(),
    failedTasks: z.number(),
    skippedTasks: z.number(),
    totalTasks: z.number(),
    percentComplete: z.number(),
  }),
  startedAt: ISODateStringSchema,
  completedAt: ISODateStringSchema.nullable(),
  pausedAt: ISODateStringSchema.nullable(),
  errorMessage: z.string().nullable(),
});

export const WorkflowGraphOutputSchema = z.object({
  workflowId: z.string(),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      data: z.record(z.unknown()),
      status: z.string(),
    })
  ),
  edges: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      condition: z.string().optional(),
    })
  ),
});
