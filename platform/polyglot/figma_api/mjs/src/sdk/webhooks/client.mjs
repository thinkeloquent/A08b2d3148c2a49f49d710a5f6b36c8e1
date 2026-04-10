/**
 * Webhooks Client — Figma API SDK
 *
 * Domain client for Figma webhooks (v2 API): CRUD and request history.
 * Wraps FigmaClient HTTP methods with structured logging.
 */

import { create } from '../../logger.mjs';

const log = create('figma-api', import.meta.url);

export class WebhooksClient {
  /**
   * @param {import('../client.mjs').FigmaClient} client
   * @param {object} [options]
   * @param {object} [options.logger] - Custom logger instance
   */
  constructor(client, options = {}) {
    this._client = client;
    this._logger = options.logger || log;
  }

  /**
   * Get a webhook by ID.
   *
   * @param {string} webhookId - The webhook ID
   * @returns {Promise<object>} Webhook details
   * @see https://www.figma.com/developers/api#get-webhook-endpoint
   */
  async getWebhook(webhookId) {
    this._logger.info('getWebhook', { webhookId });

    const data = await this._client.get(`/v2/webhooks/${webhookId}`);

    this._logger.info('getWebhook success', {
      webhookId,
      eventType: data.event_type,
      status: data.status,
    });

    return data;
  }

  /**
   * List all webhooks for a team.
   *
   * @param {string} teamId - The team ID
   * @returns {Promise<object>} Team webhooks response
   * @see https://www.figma.com/developers/api#get-team-webhooks-endpoint
   */
  async listTeamWebhooks(teamId) {
    this._logger.info('listTeamWebhooks', { teamId });

    const data = await this._client.get(`/v2/teams/${teamId}/webhooks`);

    this._logger.info('listTeamWebhooks success', {
      teamId,
      webhookCount: data.webhooks?.length ?? 0,
    });

    return data;
  }

  /**
   * Create a webhook for a team.
   *
   * @param {string} teamId - The team ID
   * @param {object} [options]
   * @param {string} options.eventType - Event type to subscribe to
   * @param {string} options.endpoint - URL to receive webhook payloads
   * @param {string} [options.passcode] - Webhook verification passcode
   * @param {string} [options.status] - Webhook status (ACTIVE or PAUSED)
   * @param {string} [options.description] - Webhook description
   * @returns {Promise<object>} Created webhook response
   * @see https://www.figma.com/developers/api#post-webhook-endpoint
   */
  async createWebhook(teamId, { eventType, endpoint, passcode, status, description } = {}) {
    this._logger.info('createWebhook', { teamId, eventType, endpoint });

    const body = {
      event_type: eventType,
      team_id: teamId,
      endpoint,
    };
    if (passcode !== undefined) body.passcode = passcode;
    if (status !== undefined) body.status = status;
    if (description !== undefined) body.description = description;

    const data = await this._client.post('/v2/webhooks', body);

    this._logger.info('createWebhook success', {
      teamId,
      webhookId: data.id,
      eventType: data.event_type,
    });

    return data;
  }

  /**
   * Update a webhook.
   *
   * @param {string} webhookId - The webhook ID
   * @param {object} payload - Fields to update
   * @param {string} [payload.eventType] - Event type to subscribe to
   * @param {string} [payload.endpoint] - URL to receive webhook payloads
   * @param {string} [payload.passcode] - Webhook verification passcode
   * @param {string} [payload.status] - Webhook status (ACTIVE or PAUSED)
   * @param {string} [payload.description] - Webhook description
   * @returns {Promise<object>} Updated webhook response
   * @see https://www.figma.com/developers/api#put-webhook-endpoint
   */
  async updateWebhook(webhookId, payload) {
    this._logger.info('updateWebhook', { webhookId });

    const body = {};
    if (payload.eventType !== undefined) body.event_type = payload.eventType;
    if (payload.endpoint !== undefined) body.endpoint = payload.endpoint;
    if (payload.passcode !== undefined) body.passcode = payload.passcode;
    if (payload.status !== undefined) body.status = payload.status;
    if (payload.description !== undefined) body.description = payload.description;

    const data = await this._client.put(`/v2/webhooks/${webhookId}`, body);

    this._logger.info('updateWebhook success', {
      webhookId,
      status: data.status,
    });

    return data;
  }

  /**
   * Delete a webhook.
   *
   * @param {string} webhookId - The webhook ID
   * @returns {Promise<object>} Delete response
   * @see https://www.figma.com/developers/api#delete-webhook-endpoint
   */
  async deleteWebhook(webhookId) {
    this._logger.info('deleteWebhook', { webhookId });

    const data = await this._client.delete(`/v2/webhooks/${webhookId}`);

    this._logger.info('deleteWebhook success', { webhookId });

    return data;
  }

  /**
   * Get webhook request history.
   *
   * @param {string} webhookId - The webhook ID
   * @returns {Promise<object>} Webhook requests history
   * @see https://www.figma.com/developers/api#get-webhook-requests-endpoint
   */
  async getWebhookRequests(webhookId) {
    this._logger.info('getWebhookRequests', { webhookId });

    const data = await this._client.get(`/v2/webhooks/${webhookId}/requests`);

    this._logger.info('getWebhookRequests success', {
      webhookId,
      requestCount: data.requests?.length ?? 0,
    });

    return data;
  }
}
