/**
 * JSDoc type definitions for webhook operations.
 * @module sdk/webhooks/types
 */

/**
 * @typedef {Object} Webhook
 * @property {number} id
 * @property {string} name
 * @property {boolean} active
 * @property {string[]} events
 * @property {WebhookConfig} config
 * @property {string} updated_at
 * @property {string} created_at
 * @property {string} url
 * @property {string} test_url
 * @property {string} ping_url
 * @property {string} type
 */

/**
 * @typedef {Object} WebhookConfig
 * @property {string} url - Webhook payload URL (must be HTTPS)
 * @property {string} [content_type='json'] - 'json' or 'form'
 * @property {string} [secret] - Webhook secret for signature verification
 * @property {string} [insecure_ssl='0'] - '0' for verification, '1' to skip
 */

/**
 * @typedef {Object} WebhookResponse
 * @property {number} id
 * @property {string} url
 * @property {number} status_code
 * @property {string} message
 */

/**
 * @typedef {Object} WebhookEvent
 * @property {string} name - Event name (e.g., 'push', 'pull_request')
 * @property {string} description - Human-readable description
 */

export default {};
