/**
 * @module models/user
 * @description User domain schemas for the Confluence API.
 */
import { z } from 'zod';
import { IconSchema } from './content.mjs';

/**
 * Full user resource returned by user-related API endpoints.
 * Extends the PersonSchema pattern with the same core fields.
 */
export const UserSchema = z.object({
  /** Display name shown in the Confluence UI. */
  displayName: z.string(),
  /** Discriminator type (e.g. "known", "anonymous", "user"). */
  type: z.string(),
  /** Avatar or profile picture of the user. */
  profilePicture: IconSchema.optional(),
  /** Username used for authentication. */
  username: z.string().optional(),
  /** Opaque user key assigned by the system. */
  userKey: z.string().optional(),
});

/**
 * Payload for creating a new user via the admin API.
 */
export const UserDetailsForCreationSchema = z.object({
  /** Username for the new user account. */
  username: z.string(),
  /** Full display name of the new user. */
  fullName: z.string(),
  /** Email address of the new user. */
  email: z.string(),
  /** Initial password for the new user account. */
  password: z.string(),
  /** Whether to send an email notification to the new user. */
  notifyViaEmail: z.boolean().default(true),
});

/**
 * Simple credentials container holding a password.
 */
export const CredentialsSchema = z.object({
  /** The password value. */
  password: z.string(),
});

/**
 * Payload for changing a user's password.
 */
export const PasswordChangeDetailsSchema = z.object({
  /** The user's current password for verification. */
  oldPassword: z.string(),
  /** The desired new password. */
  newPassword: z.string(),
});

/**
 * Container for a user key reference.
 */
export const UserKeySchema = z.object({
  /** Opaque user key assigned by the system. */
  userKey: z.string(),
});
