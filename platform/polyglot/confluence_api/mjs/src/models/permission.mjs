/**
 * @module models/permission
 * @description Permission and restriction schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Subject (user or group) that a permission or restriction applies to.
 */
export const SubjectSchema = z.object({
  /** Display name of the subject (user display name or group name). */
  displayName: z.string().default(''),
  /** Type of subject ("user" or "group"). */
  type: z.string().default(''),
});

/**
 * Description of a single operation on a target entity type.
 */
export const OperationDescriptionSchema = z.object({
  /** Operation name (e.g. "read", "update", "delete", "administer"). */
  operation: z.string().default(''),
  /** Target entity type (e.g. "space", "page", "blogpost"). */
  targetType: z.string().default(''),
});

/**
 * Single space permission entry linking a subject to an operation.
 */
export const SpacePermissionSchema = z.object({
  /** The user or group the permission is granted to. */
  subject: SubjectSchema.optional(),
  /** The operation and target type being permitted. */
  operation: OperationDescriptionSchema.optional(),
});

/**
 * Aggregated permissions for a single subject within a space,
 * listing all operations the subject is permitted to perform.
 */
export const SpacePermissionsForSubjectSchema = z.object({
  /** The user or group the permissions apply to. */
  subject: SubjectSchema.optional(),
  /** List of permitted operations for this subject. */
  operations: z.array(OperationDescriptionSchema).default([]),
});

/**
 * Content-level restriction associating an operation with the set
 * of subjects allowed to perform it.
 */
export const ContentRestrictionSchema = z.object({
  /** The restricted operation (e.g. "read", "update"). */
  operation: z.string().default(''),
  /** Map of restriction details keyed by subject type. */
  restrictions: z.record(z.unknown()).optional(),
});
