/**
 * Checkpoint Zod Schemas
 *
 * Checkpoint entity validation
 *
 * @module schemas/checkpoint.schema
 */

import { z } from 'zod';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonNegativeIntSchema,
  MetadataSchema,
  PaginationInputSchema,
  PaginationMetaSchema,
} from './common.schema.mjs';

// ============================================================================
// BASE CHECKPOINT SCHEMA
// ============================================================================

export const CheckpointBaseSchema = z.object({
  id: UUIDSchema,
  checkpointData: z.record(z.unknown()),
  checkpointType: z.string().min(1).max(100),
  expiresAt: ISODateStringSchema.nullable(),
  restoredCount: NonNegativeIntSchema,
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  taskId: UUIDSchema,
});

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

export const SaveCheckpointInputSchema = z.object({
  taskId: UUIDSchema,
  checkpointData: z.record(z.unknown()),
  checkpointType: z.string().min(1).max(100).optional().default('task_state'),
  description: z.string().max(500).optional(),
  ttlSeconds: z.number().int().min(0).optional(),
});

export const RestoreCheckpointInputSchema = z.object({
  checkpointId: UUIDSchema,
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const GetCheckpointInputSchema = z.object({
  checkpointId: UUIDSchema,
});

export const ListCheckpointsInputSchema = PaginationInputSchema.extend({
  taskId: UUIDSchema.optional(),
  checkpointType: z.string().optional(),
  includeExpired: z.boolean().optional().default(false),
});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

export const CheckpointOutputSchema = CheckpointBaseSchema.extend({
  description: z.string().nullable().optional(),
});

export const ListCheckpointsOutputSchema = z.object({
  checkpoints: z.array(CheckpointOutputSchema),
  pagination: PaginationMetaSchema,
});

export const RestoreCheckpointOutputSchema = z.object({
  checkpointId: UUIDSchema,
  taskId: UUIDSchema,
  restoredAt: ISODateStringSchema,
  checkpointData: z.record(z.unknown()),
});
