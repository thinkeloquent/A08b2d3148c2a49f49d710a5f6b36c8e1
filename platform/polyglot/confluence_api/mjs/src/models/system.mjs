/**
 * @module models/system
 * @description System and server information schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Server information returned by the /rest/api/settings/serverInformation endpoint.
 */
export const ServerInformationSchema = z.object({
  /** Base URL of the Confluence instance. */
  baseUrl: z.string().default(''),
  /** Version string of the Confluence installation (e.g. "9.2.3"). */
  version: z.string().default(''),
  /** Internal build number. */
  buildNumber: z.number().optional(),
  /** Marketplace plugin system build number. */
  marketplaceBuildNumber: z.number().optional(),
  /** ISO-8601 date-time when this build was produced. */
  buildDate: z.string().optional(),
});

/**
 * High-level instance metrics (counts of key entities).
 */
export const InstanceMetricsSchema = z.object({
  /** Total number of pages in the instance. */
  pages: z.number().default(0),
  /** Total number of spaces in the instance. */
  spaces: z.number().default(0),
  /** Total number of users in the instance. */
  users: z.number().default(0),
});

/**
 * Internationalised message associated with a long-running task,
 * supporting parameterised translations.
 */
export const LongTaskMessageSchema = z.object({
  /** Message key used for internationalisation lookup. */
  key: z.string().default(''),
  /** Ordered arguments to interpolate into the translated message. */
  args: z.array(z.unknown()).default([]),
  /** Pre-rendered translation of the message in the server locale. */
  translation: z.string().default(''),
});

/**
 * Status of a long-running task such as space export, site backup,
 * or content migration.
 */
export const LongTaskStatusSchema = z.object({
  /** Unique identifier for the long-running task. */
  id: z.string().default(''),
  /** Internationalised name/description of the task. */
  name: LongTaskMessageSchema.optional(),
  /** Elapsed wall-clock time in milliseconds since the task started. */
  elapsedTime: z.number().default(0),
  /** Completion percentage (0-100). */
  percentageComplete: z.number().default(0),
  /** Whether the task completed successfully. */
  successful: z.boolean().default(false),
  /** Log messages produced during task execution. */
  messages: z.array(LongTaskMessageSchema).default([]),
});
