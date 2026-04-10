/**
 * @module models/search
 * @description Search domain schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Summary of a container (space or parent page) returned in search results.
 */
export const ContainerSummarySchema = z.object({
  /** Title of the container. */
  title: z.string().default(''),
  /** Relative URL for displaying the container in the Confluence UI. */
  displayUrl: z.string().default(''),
});

/**
 * Individual search result returned by the CQL search endpoint.
 */
export const SearchResultSchema = z.object({
  /** Title of the matched entity. */
  title: z.string().default(''),
  /** Text excerpt with highlighted search terms. */
  excerpt: z.string().default(''),
  /** Relative URL to the matched entity. */
  url: z.string().default(''),
  /** Immediate parent container of the matched entity. */
  resultParentContainer: ContainerSummarySchema.optional(),
  /** Top-level (global) container (typically the space). */
  resultGlobalContainer: ContainerSummarySchema.optional(),
  /** CSS class name for the result icon. */
  iconCssClass: z.string().optional(),
  /** ISO-8601 date-time of the last modification. */
  lastModified: z.string().optional(),
  /** Human-friendly relative time string (e.g. "2 hours ago"). */
  friendlyLastModified: z.string().optional(),
  /** Type of entity returned (e.g. "content", "space", "user"). */
  entityType: z.string().optional(),
});
