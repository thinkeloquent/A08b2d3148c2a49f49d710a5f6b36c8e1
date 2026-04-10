/**
 * @module models/watch
 * @description Watch, content property, and space property schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Content watch record linking a watcher to a specific piece of content.
 */
export const ContentWatchSchema = z.object({
  /** The user watching the content. */
  watcher: z.record(z.unknown()).optional(),
  /** Identifier of the content being watched. */
  contentId: z.string().optional(),
  /** Reference to the content entity being watched. */
  content: z.record(z.unknown()).optional(),
});

/**
 * Space watch record linking a watcher to a space, optionally
 * filtered by content types.
 */
export const SpaceWatchSchema = z.object({
  /** The user watching the space. */
  watcher: z.record(z.unknown()).optional(),
  /** Reference to the space being watched. */
  space: z.record(z.unknown()).optional(),
  /** Content types the watcher is subscribed to (e.g. ["page", "blogpost"]). */
  contentTypes: z.array(z.string()).default([]),
});

/**
 * JSON content property attached to a piece of content,
 * supporting arbitrary key-value storage with versioning.
 */
export const JsonContentPropertySchema = z.object({
  /** Property key (unique per content entity). */
  key: z.string().default(''),
  /** Arbitrary JSON value stored under the key. */
  value: z.unknown().optional(),
  /** Version information for the property (for optimistic locking). */
  version: z.record(z.unknown()).optional(),
  /** Reference to the content entity this property belongs to. */
  content: z.record(z.unknown()).optional(),
});

/**
 * JSON space property attached to a space, supporting arbitrary
 * key-value storage with versioning.
 */
export const JsonSpacePropertySchema = z.object({
  /** Property key (unique per space). */
  key: z.string().default(''),
  /** Arbitrary JSON value stored under the key. */
  value: z.unknown().optional(),
  /** Version information for the property (for optimistic locking). */
  version: z.record(z.unknown()).optional(),
  /** Reference to the space this property belongs to. */
  space: z.record(z.unknown()).optional(),
});
