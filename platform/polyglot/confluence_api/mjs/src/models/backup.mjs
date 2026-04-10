/**
 * @module models/backup
 * @description Backup and restore domain schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Details of a backup or restore job submitted to the system.
 */
export const JobDetailsSchema = z.object({
  /** Unique identifier of the job. */
  jobId: z.string().optional(),
  /** Operation type (e.g. "BACKUP", "RESTORE"). */
  jobOperation: z.string().optional(),
  /** Scope of the job (e.g. "SITE", "SPACE"). */
  jobScope: z.string().optional(),
  /** Current state of the job (e.g. "QUEUED", "RUNNING", "COMPLETE"). */
  jobState: z.string().optional(),
  /** Username of the user who initiated the job. */
  owner: z.string().optional(),
  /** Space key when the job is scoped to a single space. */
  spaceKey: z.string().optional(),
});

/**
 * Settings for initiating a full site backup.
 */
export const SiteBackupSettingsSchema = z.object({
  /** Whether to include attachments in the backup. */
  cbAttachments: z.boolean().default(true),
  /** File system path where the backup file should be written. */
  backupLocation: z.string().optional(),
});

/**
 * Settings for initiating a single-space backup.
 */
export const SpaceBackupSettingsSchema = z.object({
  /** Key of the space to back up. */
  spaceKey: z.string(),
  /** Whether to include attachments in the backup. */
  cbAttachments: z.boolean().default(true),
});

/**
 * Settings for restoring a full site from a backup file.
 */
export const SiteRestoreSettingsSchema = z.object({
  /** Name of the backup file to restore from. */
  fileName: z.string(),
});

/**
 * Settings for restoring a single space from a backup file.
 */
export const SpaceRestoreSettingsSchema = z.object({
  /** Name of the backup file to restore from. */
  fileName: z.string(),
  /** Optional space key to restore into (overrides the key in the backup). */
  spaceKey: z.string().optional(),
});
