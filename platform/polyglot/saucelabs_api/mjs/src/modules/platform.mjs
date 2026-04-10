/**
 * Platform Module — Sauce Labs API Client
 *
 * Check service status and supported configurations.
 *
 * Endpoints:
 *   GET /rest/v1/info/status                        - Service status
 *   GET /rest/v1/info/platforms/{automation_api}     - Supported platforms
 */

import { create } from '../logger.mjs';
import { SaucelabsValidationError } from '../errors.mjs';
import { AUTOMATION_API_VALUES } from '../types.mjs';

const log = create('saucelabs-api', import.meta.url);

export class PlatformModule {
  /**
   * @param {import('../client.mjs').SaucelabsClient} client
   */
  constructor(client) {
    this._client = client;
    this._logger = log;
  }

  /**
   * Get current Sauce Labs service status.
   * This is a public endpoint — no authentication required.
   *
   * @returns {Promise<object>} Service status object
   */
  async getStatus() {
    this._logger.debug('checking service status');
    return this._client.get('/rest/v1/info/status');
  }

  /**
   * Get supported platforms filtered by automation backend.
   * This is a public endpoint — no authentication required.
   *
   * @param {string} automationApi - Filter: 'all', 'appium', or 'webdriver'
   * @returns {Promise<Array>} List of platform configurations
   */
  async getPlatforms(automationApi = 'all') {
    if (!AUTOMATION_API_VALUES.includes(automationApi)) {
      throw new SaucelabsValidationError(
        `automationApi must be one of: ${AUTOMATION_API_VALUES.join(', ')} — got "${automationApi}"`,
      );
    }

    this._logger.debug('getting platforms', { automationApi });
    return this._client.get(`/rest/v1/info/platforms/${automationApi}`);
  }
}
