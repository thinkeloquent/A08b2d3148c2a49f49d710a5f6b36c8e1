/**
 * GitHub Webhooks SDK client.
 * Provides methods for CRUD operations on repository webhooks.
 * @module sdk/webhooks/client
 */

import { createLogger } from '../client.mjs';
import { validateUsername, validateRepositoryName } from '../validation.mjs';
import { ValidationError } from '../errors.mjs';

/**
 * Client for GitHub Webhook API operations.
 */
export class WebhooksClient {
  /**
   * @param {import('../client.mjs').GitHubClient} client - The base GitHub HTTP client
   */
  constructor(client) {
    this.client = client;
    this.log = createLogger('webhooks');
  }

  /**
   * Validate a webhook configuration.
   * Ensures URL is HTTPS and content_type is valid.
   * @param {import('./types.mjs').WebhookConfig} config
   * @throws {ValidationError} If configuration is invalid
   */
  validateConfig(config) {
    if (!config || !config.url) {
      throw new ValidationError('Webhook config must include a URL');
    }

    try {
      const url = new URL(config.url);
      if (url.protocol !== 'https:') {
        throw new ValidationError(
          'Webhook URL must use HTTPS protocol',
        );
      }
    } catch (err) {
      if (err instanceof ValidationError) throw err;
      throw new ValidationError(`Invalid webhook URL: ${config.url}`);
    }

    if (
      config.content_type &&
      config.content_type !== 'json' &&
      config.content_type !== 'form'
    ) {
      throw new ValidationError(
        `Invalid content_type: ${config.content_type}. Must be "json" or "form".`,
      );
    }
  }

  /**
   * List webhooks for a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @returns {Promise<import('./types.mjs').Webhook[]>}
   */
  async list(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing webhooks', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/hooks`, {
      params: options,
    });
  }

  /**
   * Get a specific webhook.
   * @param {string} owner
   * @param {string} repo
   * @param {number} hookId - Webhook ID
   * @returns {Promise<import('./types.mjs').Webhook>}
   */
  async get(owner, repo, hookId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting webhook', { owner, repo, hookId });
    return this.client.get(`/repos/${owner}/${repo}/hooks/${hookId}`);
  }

  /**
   * Create a webhook.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} config
   * @param {string} config.url - Payload URL
   * @param {string} [config.content_type='json']
   * @param {string} [config.secret] - Webhook secret
   * @param {string[]} [config.events=['push']] - Events to subscribe to
   * @param {boolean} [config.active=true]
   * @returns {Promise<import('./types.mjs').Webhook>}
   */
  async create(owner, repo, config) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.validateConfig(config.config || config);

    const payload = {
      name: 'web',
      active: config.active !== undefined ? config.active : true,
      events: config.events || ['push'],
      config: config.config || {
        url: config.url,
        content_type: config.content_type || 'json',
        secret: config.secret,
        insecure_ssl: config.insecure_ssl || '0',
      },
    };

    this.log.info('Creating webhook', { owner, repo });
    return this.client.post(`/repos/${owner}/${repo}/hooks`, payload);
  }

  /**
   * Update a webhook.
   * @param {string} owner
   * @param {string} repo
   * @param {number} hookId
   * @param {Object} config - Updated configuration
   * @returns {Promise<import('./types.mjs').Webhook>}
   */
  async update(owner, repo, hookId, config) {
    validateUsername(owner);
    validateRepositoryName(repo);

    if (config.config) {
      this.validateConfig(config.config);
    }

    this.log.info('Updating webhook', { owner, repo, hookId });
    return this.client.patch(`/repos/${owner}/${repo}/hooks/${hookId}`, config);
  }

  /**
   * Delete a webhook.
   * @param {string} owner
   * @param {string} repo
   * @param {number} hookId
   * @returns {Promise<Object>}
   */
  async delete(owner, repo, hookId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.warn('Deleting webhook', { owner, repo, hookId });
    return this.client.delete(`/repos/${owner}/${repo}/hooks/${hookId}`);
  }

  /**
   * Test a webhook by triggering the latest push event.
   * @param {string} owner
   * @param {string} repo
   * @param {number} hookId
   * @returns {Promise<Object>}
   */
  async test(owner, repo, hookId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Testing webhook', { owner, repo, hookId });
    return this.client.post(
      `/repos/${owner}/${repo}/hooks/${hookId}/tests`,
    );
  }

  /**
   * Ping a webhook.
   * @param {string} owner
   * @param {string} repo
   * @param {number} hookId
   * @returns {Promise<Object>}
   */
  async ping(owner, repo, hookId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Pinging webhook', { owner, repo, hookId });
    return this.client.post(
      `/repos/${owner}/${repo}/hooks/${hookId}/pings`,
    );
  }
}
