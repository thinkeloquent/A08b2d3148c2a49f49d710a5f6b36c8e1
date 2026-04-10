/**
 * Events Module — Statsig Console API Client
 *
 * Domain module for managing Statsig events.
 * Events represent user actions and are used for metrics and experiment analysis.
 *
 * @see https://docs.statsig.com/console-api/events
 */

import { create } from '../../logger.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Domain client for Statsig event operations.
 *
 * @example
 * const events = new EventsModule(client);
 * const list = await events.list();
 */
export class EventsModule {
  /**
   * @param {import('../../client.mjs').StatsigClient} client - The core HTTP client
   * @param {object} [options={}]
   * @param {object} [options.logger] - Custom logger instance
   */
  constructor(client, options = {}) {
    /** @type {import('../../client.mjs').StatsigClient} */
    this._client = client;
    /** @type {object} */
    this._logger = options.logger || log;
  }

  /**
   * List all events.
   *
   * @param {object} [params={}] - Query parameters
   * @returns {Promise<Array<object>>} Array of event objects
   */
  async list(params = {}) {
    this._logger.info('list events');
    const data = await this._client.list('/events', { params });
    this._logger.info('list events complete', { count: data.length });
    return data;
  }

  /**
   * Get a single event by name.
   *
   * @param {string} eventName - The event name
   * @returns {Promise<object>} Event object
   */
  async get(eventName) {
    this._logger.info('get event', { eventName });
    return this._client.get(`/events/${encodeURIComponent(eventName)}`);
  }
}
