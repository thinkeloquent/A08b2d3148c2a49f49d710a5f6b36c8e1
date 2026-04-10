/**
 * @module models/space
 * @description Space domain schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Full space resource representing a Confluence space (global or personal).
 */
export const SpaceSchema = z.object({
  /** Numeric identifier for the space. */
  id: z.number().optional(),
  /** Unique short key for the space (e.g. "DEV", "~username"). */
  key: z.string().default(''),
  /** Human-readable name of the space. */
  name: z.string().default(''),
  /** Lifecycle status of the space (e.g. "current", "archived"). */
  status: z.string().default('current'),
  /** Type of space ("global" or "personal"). */
  type: z.string().default('global'),
  /** Space description in various representation formats. */
  description: z.record(z.unknown()).optional(),
  /** Homepage content reference for the space. */
  homepage: z.record(z.unknown()).optional(),
  /** Space icon/logo. */
  icon: z.record(z.unknown()).optional(),
  /** Space metadata including labels and themes. */
  metadata: z.record(z.unknown()).optional(),
  /** Hypermedia links for this space resource. */
  _links: z.record(z.unknown()).optional(),
  /** Expandable properties that were not included in this response. */
  _expandable: z.record(z.unknown()).optional(),
});

/**
 * Payload for creating a new space via POST /rest/api/space.
 */
export const SpaceCreateSchema = z.object({
  /** Unique short key for the new space. */
  key: z.string(),
  /** Human-readable name for the new space. */
  name: z.string(),
  /** Optional description for the new space. */
  description: z.record(z.unknown()).optional(),
  /** Type of space to create. */
  type: z.string().default('global'),
});

/**
 * Payload for updating an existing space via PUT /rest/api/space/{spaceKey}.
 */
export const SpaceUpdateSchema = z.object({
  /** Updated name for the space. */
  name: z.string().optional(),
  /** Updated description for the space. */
  description: z.record(z.unknown()).optional(),
  /** Updated homepage reference for the space. */
  homepage: z.record(z.unknown()).optional(),
});

/**
 * Response returned when a long-running task (such as space deletion)
 * is submitted asynchronously.
 */
export const LongTaskSubmissionSchema = z.object({
  /** Identifier of the submitted long-running task. */
  id: z.string().default(''),
  /** Hypermedia links for polling the task status. */
  _links: z.record(z.unknown()).optional(),
});
