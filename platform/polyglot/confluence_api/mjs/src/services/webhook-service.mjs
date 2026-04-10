/**
 * @module services/webhook-service
 * @description Service for Confluence Webhook REST API operations.
 *
 * Manages webhooks (also called "listeners") for receiving event notifications
 * from Confluence. Supports CRUD, testing, and invocation/statistics retrieval.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence webhook operations.
 */
export class WebhookService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  /**
   * Get all registered webhooks.
   *
   * @returns {Promise<Object>} List of webhooks.
   */
  async getWebhooks() {
    log.debug('getWebhooks called');
    try {
      const result = await this._client.get('webhook');
      log.info('getWebhooks succeeded', { count: result.results?.length ?? result.length });
      return result;
    } catch (error) {
      log.error('getWebhooks failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Create a new webhook.
   *
   * @param {Object} data - Webhook creation payload.
   * @param {string} data.url - The callback URL.
   * @param {string[]} data.events - Event types to listen for.
   * @param {string} [data.name] - Webhook name.
   * @param {boolean} [data.active] - Whether the webhook is active.
   * @returns {Promise<Object>} The created webhook object.
   */
  async createWebhook(data) {
    log.debug('createWebhook called', { url: data?.url, events: data?.events });
    try {
      const result = await this._client.post('webhook', data);
      log.info('createWebhook succeeded', { id: result.id, url: result.url });
      return result;
    } catch (error) {
      log.error('createWebhook failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get a single webhook by ID.
   *
   * @param {string} webhookId - The webhook ID.
   * @returns {Promise<Object>} The webhook object.
   */
  async getWebhook(webhookId) {
    log.debug('getWebhook called', { webhookId });
    try {
      const result = await this._client.get(`webhook/${webhookId}`);
      log.info('getWebhook succeeded', { webhookId, url: result.url });
      return result;
    } catch (error) {
      log.error('getWebhook failed', { webhookId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Update an existing webhook.
   *
   * @param {string} webhookId - The webhook ID.
   * @param {Object} data - Webhook update payload.
   * @returns {Promise<Object>} The updated webhook object.
   */
  async updateWebhook(webhookId, data) {
    log.debug('updateWebhook called', { webhookId });
    try {
      const result = await this._client.put(`webhook/${webhookId}`, data);
      log.info('updateWebhook succeeded', { webhookId });
      return result;
    } catch (error) {
      log.error('updateWebhook failed', { webhookId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete a webhook.
   *
   * @param {string} webhookId - The webhook ID.
   * @returns {Promise<void>}
   */
  async deleteWebhook(webhookId) {
    log.debug('deleteWebhook called', { webhookId });
    try {
      const result = await this._client.delete(`webhook/${webhookId}`);
      log.info('deleteWebhook succeeded', { webhookId });
      return result;
    } catch (error) {
      log.error('deleteWebhook failed', { webhookId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Send a test event to a webhook endpoint.
   *
   * @param {Object} data - Test payload containing the webhook URL and event type.
   * @returns {Promise<Object>} Test result.
   */
  async testWebhook(data) {
    log.debug('testWebhook called', { url: data?.url });
    try {
      const result = await this._client.post('webhook/test', data);
      log.info('testWebhook succeeded');
      return result;
    } catch (error) {
      log.error('testWebhook failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get the latest invocations (delivery history) for a webhook.
   *
   * @param {string} webhookId - The webhook ID.
   * @returns {Promise<Object>} Latest invocation records.
   */
  async getLatestInvocations(webhookId) {
    log.debug('getLatestInvocations called', { webhookId });
    try {
      const result = await this._client.get(`webhook/${webhookId}/latest`);
      log.info('getLatestInvocations succeeded', { webhookId });
      return result;
    } catch (error) {
      log.error('getLatestInvocations failed', { webhookId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get statistics for a specific webhook.
   *
   * @param {string} webhookId - The webhook ID.
   * @returns {Promise<Object>} Webhook statistics.
   */
  async getWebhookStatistics(webhookId) {
    log.debug('getWebhookStatistics called', { webhookId });
    try {
      const result = await this._client.get(`webhook/${webhookId}/statistics`);
      log.info('getWebhookStatistics succeeded', { webhookId });
      return result;
    } catch (error) {
      log.error('getWebhookStatistics failed', { webhookId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get a summary of statistics for a webhook.
   *
   * @param {string} webhookId - The webhook ID.
   * @returns {Promise<Object>} Webhook statistics summary.
   */
  async getWebhookStatisticsSummary(webhookId) {
    log.debug('getWebhookStatisticsSummary called', { webhookId });
    try {
      const result = await this._client.get(`webhook/${webhookId}/statistics/summary`);
      log.info('getWebhookStatisticsSummary succeeded', { webhookId });
      return result;
    } catch (error) {
      log.error('getWebhookStatisticsSummary failed', { webhookId, message: error.message, status: error.status });
      throw error;
    }
  }
}
