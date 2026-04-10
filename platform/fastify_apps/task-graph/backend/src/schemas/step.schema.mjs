/**
 * Step Zod Schemas
 *
 * Step entity validation
 *
 * @module schemas/step.schema
 */

import { z } from 'zod';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonNegativeIntSchema,
  MetadataSchema,
  StepStatusSchema,
} from './common.schema.mjs';

// ============================================================================
// BASE STEP SCHEMA
// ============================================================================

export const StepBaseSchema = z.object({
  id: UUIDSchema,
  token: z.string().min(1).max(255),
  content: z.string().min(1).max(10000),
  order: z.number().int().nullable(),
  status: StepStatusSchema,
  startedAt: ISODateStringSchema.nullable(),
  completedAt: ISODateStringSchema.nullable(),
  skipReason: z.string().max(500).nullable(),
  blockedReason: z.string().max(500).nullable(),
  metadata: MetadataSchema,
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  taskId: UUIDSchema,
});

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

export const CreateStepInputSchema = z.object({
  token: z.string().min(1).max(255),
  content: z.string().min(1, 'Content is required').max(10000),
  order: z.number().int().optional(),
  metadata: MetadataSchema,
  taskId: UUIDSchema,
});

export const UpdateStepInputSchema = z.object({
  token: z.string().min(1).max(255).optional(),
  content: z.string().min(1).max(10000).optional(),
  order: z.number().int().nullable().optional(),
  metadata: MetadataSchema,
});

export const BatchCreateStepsInputSchema = z.object({
  taskId: UUIDSchema,
  steps: z
    .array(
      z.object({
        token: z.string().min(1).max(255),
        content: z.string().min(1).max(10000),
        order: z.number().int().optional(),
        metadata: MetadataSchema,
      })
    )
    .min(1)
    .max(100),
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const GetStepByIdInputSchema = z.object({
  stepId: UUIDSchema,
});

export const ListStepsByTaskInputSchema = z.object({
  taskId: UUIDSchema,
  status: StepStatusSchema.optional(),
});

// ============================================================================
// OPERATION SCHEMAS
// ============================================================================

export const StartStepInputSchema = z.object({
  stepId: UUIDSchema,
  metadata: MetadataSchema,
});

export const CompleteStepInputSchema = z.object({
  stepId: UUIDSchema,
  metadata: MetadataSchema,
});

export const SkipStepInputSchema = z.object({
  stepId: UUIDSchema,
  reason: z.string().min(1, 'Skip reason is required').max(500),
  metadata: MetadataSchema,
});

export const BlockStepInputSchema = z.object({
  stepId: UUIDSchema,
  reason: z.string().min(1, 'Block reason is required').max(500),
  metadata: MetadataSchema,
});

export const UnblockStepInputSchema = z.object({
  stepId: UUIDSchema,
  metadata: MetadataSchema,
});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

export const StepOutputSchema = StepBaseSchema;

export const StepProgressOutputSchema = z.object({
  taskId: UUIDSchema,
  total: NonNegativeIntSchema,
  completed: NonNegativeIntSchema,
  inProgress: NonNegativeIntSchema,
  pending: NonNegativeIntSchema,
  skipped: NonNegativeIntSchema,
  blocked: NonNegativeIntSchema,
  percentComplete: z.number().min(0).max(100),
});
