/**
 * @module models/common
 * @description Common shared schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Result of a validation check, typically returned when an operation
 * requires authorisation or input validation.
 */
export const ValidationResultSchema = z.object({
  /** Whether the requesting user is authorised for the operation. */
  authorized: z.boolean().default(false),
  /** Whether the submitted data passed validation. */
  valid: z.boolean().default(false),
  /** Map of field-level validation error messages, keyed by field name. */
  errors: z.record(z.unknown()).optional(),
  /** Whether the overall operation was successful. */
  successful: z.boolean().default(false),
  /** Whether this operation is permitted when the instance is in read-only mode. */
  allowedInReadOnlyMode: z.boolean().default(false),
});

/**
 * Standard REST error envelope returned by the Confluence API on failure.
 */
export const RestErrorSchema = z.object({
  /** HTTP status code of the error response. */
  statusCode: z.number(),
  /** Optional structured validation data accompanying the error. */
  data: ValidationResultSchema.optional(),
  /** Human-readable error message. */
  message: z.string().default(''),
  /** Machine-readable reason code. */
  reason: z.string().default(''),
});

/**
 * Hypermedia links returned alongside paginated and non-paginated responses.
 */
export const PaginationLinksSchema = z.object({
  /** Base URL of the Confluence instance. */
  base: z.string().optional(),
  /** Canonical URL of the current resource. */
  self: z.string().optional(),
  /** Context path of the Confluence instance. */
  context: z.string().optional(),
  /** URL to the next page of results. */
  next: z.string().optional(),
  /** URL to the previous page of results. */
  prev: z.string().optional(),
});

/**
 * Generic paginated response wrapper used by list endpoints.
 */
export const PaginatedResponseSchema = z.object({
  /** Array of result objects for the current page. */
  results: z.array(z.record(z.unknown())).default([]),
  /** Zero-based index of the first result on this page. */
  start: z.number().default(0),
  /** Maximum number of results per page. */
  limit: z.number().default(25),
  /** Actual number of results returned on this page. */
  size: z.number().default(0),
  /** Hypermedia navigation links. */
  _links: PaginationLinksSchema.optional(),
});

/**
 * Result of checking whether an operation is permitted on a target type.
 */
export const OperationCheckResultSchema = z.object({
  /** The operation that was checked (e.g. "read", "update", "delete"). */
  operation: z.string().default(''),
  /** The target entity type the operation applies to (e.g. "page", "blogpost"). */
  targetType: z.string().default(''),
});
