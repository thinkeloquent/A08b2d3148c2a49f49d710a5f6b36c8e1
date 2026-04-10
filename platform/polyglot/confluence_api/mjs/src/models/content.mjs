/**
 * @module models/content
 * @description Content domain schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Icon or image reference with dimensions.
 */
export const IconSchema = z.object({
  /** Relative or absolute path to the icon resource. */
  path: z.string(),
  /** Width of the icon in pixels. */
  width: z.number(),
  /** Height of the icon in pixels. */
  height: z.number(),
  /** Whether this is the default icon for the entity type. */
  isDefault: z.boolean(),
});

/**
 * Lightweight person representation used across the API for authors,
 * editors, and other user references.
 */
export const PersonSchema = z.object({
  /** Avatar or profile picture of the person. */
  profilePicture: IconSchema.optional(),
  /** Display name shown in the Confluence UI. */
  displayName: z.string(),
  /** Discriminator type (e.g. "known", "anonymous", "user"). */
  type: z.string(),
  /** Username used for authentication (may be absent for anonymous users). */
  username: z.string().optional(),
  /** Opaque user key assigned by the system. */
  userKey: z.string().optional(),
});

/**
 * Minimal version reference used within history navigation
 * (previous/next version pointers).
 */
export const ReferenceVersionSchema = z.object({
  /** The person who created this version. */
  by: PersonSchema.optional(),
  /** ISO-8601 date-time when this version was created. */
  when: z.string().optional(),
  /** Optional version comment or commit message. */
  message: z.string().optional(),
  /** Numeric version number (1-based). */
  number: z.number().optional(),
  /** Whether this version was a minor (non-notifying) edit. */
  minorEdit: z.boolean().optional(),
});

/**
 * History metadata for a piece of content, including creation and
 * version navigation information.
 */
export const HistorySchema = z.object({
  /** Whether this content is the latest (most recent) version. */
  latest: z.boolean(),
  /** The person who originally created the content. */
  createdBy: PersonSchema.optional(),
  /** ISO-8601 date-time when the content was originally created. */
  createdDate: z.string().optional(),
  /** Pointer to the version immediately before the current one. */
  previousVersion: ReferenceVersionSchema.optional(),
  /** Pointer to the version immediately after the current one. */
  nextVersion: ReferenceVersionSchema.optional(),
  /** Information about the most recent update to this content. */
  lastUpdated: ReferenceVersionSchema.optional(),
});

/**
 * Full version descriptor attached to content, including metadata
 * about the edit.
 */
export const VersionSchema = z.object({
  /** The person who authored this version. */
  by: PersonSchema.optional(),
  /** ISO-8601 date-time when this version was saved. */
  when: z.string().optional(),
  /** Version comment describing the change. */
  message: z.string().default(''),
  /** Numeric version number (1-based, monotonically increasing). */
  number: z.number().default(1),
  /** Whether this version is a minor edit. */
  minorEdit: z.boolean().default(false),
  /** Whether this version is hidden from version history. */
  hidden: z.boolean().default(false),
  /** Synchronisation revision used for conflict detection. */
  syncRev: z.string().optional(),
});

/**
 * Single content body in a specific representation format.
 */
export const ContentBodySchema = z.object({
  /** The markup or rendered content value. */
  value: z.string().default(''),
  /** The representation format (e.g. "storage", "view", "editor", "export_view"). */
  representation: z.string().default('storage'),
});

/**
 * Container holding multiple representation formats of a content body.
 */
export const ContentBodyContainerSchema = z.object({
  /** Storage format (XHTML-based Confluence storage format). */
  storage: ContentBodySchema.optional(),
  /** Rendered view format suitable for display. */
  view: ContentBodySchema.optional(),
  /** Editor format used by the Confluence editor. */
  editor: ContentBodySchema.optional(),
  /** Export view format used for PDF/Word export. */
  export_view: ContentBodySchema.optional(),
  /** Styled view format with full CSS applied. */
  styled_view: ContentBodySchema.optional(),
  /** Anonymous export view format (no user-specific data). */
  anonymous_export_view: ContentBodySchema.optional(),
});

/**
 * Full content resource representing a page, blog post, comment,
 * or other Confluence content entity.
 */
export const ContentSchema = z.object({
  /** Unique numeric identifier for the content (string representation). */
  id: z.string().optional(),
  /** Content type discriminator (e.g. "page", "blogpost", "comment"). */
  type: z.string().default('page'),
  /** Lifecycle status of the content (e.g. "current", "trashed", "draft"). */
  status: z.string().default('current'),
  /** Title of the content. */
  title: z.string().default(''),
  /** Space that contains this content. */
  space: z.record(z.unknown()).optional(),
  /** History metadata including creation and version navigation. */
  history: HistorySchema.optional(),
  /** Current version information. */
  version: VersionSchema.optional(),
  /** Ordered list of ancestor pages (from root to immediate parent). */
  ancestors: z.array(z.record(z.unknown())).default([]),
  /** Body content in various representation formats. */
  body: ContentBodyContainerSchema.optional(),
  /** Content metadata such as labels, properties, and restrictions. */
  metadata: z.record(z.unknown()).optional(),
  /** Extension data provided by apps or plugins. */
  extensions: z.record(z.unknown()).optional(),
  /** Hypermedia links for this content resource. */
  _links: z.record(z.unknown()).optional(),
  /** Expandable properties that were not included in this response. */
  _expandable: z.record(z.unknown()).optional(),
});

/**
 * Macro instance embedded within content markup.
 */
export const MacroInstanceSchema = z.object({
  /** Macro module key or name. */
  name: z.string(),
  /** Raw body content of the macro. */
  body: z.string().optional(),
  /** Key-value parameters passed to the macro. */
  parameters: z.record(z.unknown()).optional(),
});

/**
 * Payload for creating new content via POST /rest/api/content.
 */
export const ContentCreateSchema = z.object({
  /** Content type to create (e.g. "page", "blogpost"). */
  type: z.string(),
  /** Title for the new content. */
  title: z.string(),
  /** Space in which to create the content, identified by key. */
  space: z.object({
    /** Space key (e.g. "DEV", "HR"). */
    key: z.string(),
  }),
  /** Body content in one or more representation formats. */
  body: ContentBodyContainerSchema,
  /** Optional ancestor page(s) to nest this content under. */
  ancestors: z.array(z.record(z.unknown())).optional(),
  /** Initial status of the content. */
  status: z.string().default('current'),
});

/**
 * Payload for updating existing content via PUT /rest/api/content/{id}.
 */
export const ContentUpdateSchema = z.object({
  /** Version information; the number must be incremented from the current version. */
  version: VersionSchema,
  /** Updated title for the content. */
  title: z.string(),
  /** Content type (must match the existing content type). */
  type: z.string(),
  /** Target status after update. */
  status: z.string().default('current'),
  /** Updated body content (omit to leave body unchanged). */
  body: ContentBodyContainerSchema.optional(),
});
