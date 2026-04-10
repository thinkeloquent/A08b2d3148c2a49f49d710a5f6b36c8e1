/**
 * @module models/webhook
 * @description Webhook domain schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Scope of a webhook, identifying the entity it is bound to.
 */
export const WebhookScopeSchema = z.object({
  /** Identifier of the scoped entity. */
  id: z.string().default(''),
  /** Type of the scoped entity (e.g. "space", "global"). */
  type: z.string().default(''),
});

/**
 * Event descriptor for a webhook trigger.
 */
export const WebhookEventSchema = z.object({
  /** Unique identifier of the event type. */
  id: z.string().optional(),
  /** Internationalisation key for the event name. */
  i18nKey: z.string().optional(),
});

/**
 * Credentials used for authenticating webhook callbacks.
 */
export const WebhookCredentialsSchema = z.object({
  /** Username for HTTP Basic authentication on the callback URL. */
  username: z.string().optional(),
  /** Password for HTTP Basic authentication on the callback URL. */
  password: z.string().optional(),
});

/**
 * Full webhook resource as returned by the Confluence API.
 */
export const WebhookSchema = z.object({
  /** Human-readable name for the webhook. */
  name: z.string().default(''),
  /** Unique numeric identifier for the webhook. */
  id: z.number().optional(),
  /** Whether the webhook is currently active and receiving events. */
  active: z.boolean().default(true),
  /** Additional configuration data for the webhook. */
  configuration: z.record(z.unknown()).optional(),
  /** Callback URL that receives the webhook POST requests. */
  url: z.string().default(''),
  /** Scope restricting which entity triggers the webhook. */
  scope: WebhookScopeSchema.optional(),
  /** Credentials for authenticating with the callback URL. */
  credentials: WebhookCredentialsSchema.optional(),
  /** List of events this webhook subscribes to. */
  events: z.array(WebhookEventSchema).default([]),
  /** ISO-8601 date-time when the webhook was created. */
  createdDate: z.string().optional(),
  /** ISO-8601 date-time when the webhook was last updated. */
  updatedDate: z.string().optional(),
  /** Whether SSL certificate verification is required for the callback URL. */
  sslVerificationRequired: z.boolean().default(true),
});

/**
 * Payload for creating or updating a webhook via the REST API.
 */
export const RestWebhookSchema = z.object({
  /** Human-readable name for the webhook. */
  name: z.string(),
  /** Callback URL that receives the webhook POST requests. */
  url: z.string(),
  /** List of event type strings this webhook subscribes to. */
  events: z.array(z.string()).default([]),
  /** Type of scope for the webhook (e.g. "space", "global"). */
  scopeType: z.string().optional(),
  /** Whether the webhook should be active upon creation. */
  active: z.boolean().default(true),
  /** Whether SSL certificate verification is required for the callback URL. */
  sslVerificationRequired: z.boolean().default(true),
  /** Optional credentials for authenticating with the callback URL. */
  credentials: WebhookCredentialsSchema.optional(),
});

/**
 * Result details for a single webhook invocation.
 */
export const DetailedInvocationResultSchema = z.object({
  /** Description of the invocation result. */
  description: z.string().default(''),
  /** Outcome status (e.g. "SUCCESS", "FAILURE", "ERROR"). */
  outcome: z.string().default(''),
});

/**
 * Detailed record of a webhook invocation including timing and result.
 */
export const DetailedInvocationSchema = z.object({
  /** Unique identifier for the invocation record. */
  id: z.number().optional(),
  /** Result details of the invocation. */
  result: DetailedInvocationResultSchema.optional(),
  /** Scope of the entity that triggered the event. */
  eventScope: WebhookScopeSchema.optional(),
  /** Event that triggered the invocation. */
  event: WebhookEventSchema.optional(),
  /** Duration of the invocation in milliseconds. */
  duration: z.number().optional(),
  /** ISO-8601 date-time when the invocation started. */
  start: z.string().optional(),
  /** ISO-8601 date-time when the invocation finished. */
  finish: z.string().optional(),
});
