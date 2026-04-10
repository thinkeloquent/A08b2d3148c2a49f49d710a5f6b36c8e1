/**
 * Dependency Zod Schemas
 *
 * Task dependency validation
 *
 * @module schemas/dependency.schema
 */

import { z } from 'zod';
import {
  UUIDSchema,
  ISODateStringSchema,
  TaskStatusSchema,
} from './common.schema.mjs';

// ============================================================================
// BASE DEPENDENCY SCHEMA
// ============================================================================

export const DependencyBaseSchema = z.object({
  prerequisiteId: UUIDSchema,
  dependentId: UUIDSchema,
  allowSkip: z.boolean(),
  createdAt: ISODateStringSchema,
});

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

export const CreateDependencyInputSchema = z.object({
  prerequisiteId: UUIDSchema,
  dependentId: UUIDSchema,
  allowSkip: z.boolean().optional().default(false),
});

export const DeleteDependencyInputSchema = z.object({
  prerequisiteId: UUIDSchema,
  dependentId: UUIDSchema,
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const GetDependenciesInputSchema = z.object({
  taskId: UUIDSchema,
});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

export const DependencyOutputSchema = DependencyBaseSchema;

export const TaskDependencyInfoSchema = z.object({
  taskId: UUIDSchema,
  title: z.string(),
  status: TaskStatusSchema,
  allowSkip: z.boolean().optional(),
});

export const DependencyGraphNodeSchema = z.object({
  id: UUIDSchema,
  title: z.string(),
  status: TaskStatusSchema,
  prerequisites: z.array(UUIDSchema),
  dependents: z.array(UUIDSchema),
});

export const DependencyGraphOutputSchema = z.object({
  nodes: z.array(DependencyGraphNodeSchema),
  edges: z.array(
    z.object({
      from: UUIDSchema,
      to: UUIDSchema,
      allowSkip: z.boolean(),
    })
  ),
});

export const ExecutionReadinessOutputSchema = z.object({
  taskId: UUIDSchema,
  isReady: z.boolean(),
  blockedBy: z.array(TaskDependencyInfoSchema),
  satisfiedPrerequisites: z.array(TaskDependencyInfoSchema),
});
