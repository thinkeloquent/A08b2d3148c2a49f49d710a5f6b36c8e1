/**
 * Users Module — Sauce Labs API Client
 *
 * Retrieve user account details and concurrency/usage statistics.
 *
 * Endpoints:
 *   GET /rest/v1.2/users/{username}              - User info
 *   GET /rest/v1.2/users/{username}/concurrency   - Concurrency stats
 */

import { create } from '../logger.mjs';
import { SaucelabsValidationError } from '../errors.mjs';

const log = create('saucelabs-api', import.meta.url);

export class UsersModule {
  /**
   * @param {import('../client.mjs').SaucelabsClient} client
   */
  constructor(client) {
    this._client = client;
    this._logger = log;
  }

  /**
   * Get user account information.
   *
   * @param {string} [username] - Username (defaults to configured username)
   * @returns {Promise<object>} User info object
   */
  async getUser(username) {
    const user = username || this._client.username;
    if (!user) {
      throw new SaucelabsValidationError('username is required to get user info');
    }

    this._logger.debug('getting user info', { username: user });
    return this._client.get(`/rest/v1.2/users/${user}`);
  }

  /**
   * Get concurrency and usage statistics.
   *
   * @param {string} [username] - Username (defaults to configured username)
   * @returns {Promise<object>} Concurrency info object
   */
  async getConcurrency(username) {
    const user = username || this._client.username;
    if (!user) {
      throw new SaucelabsValidationError('username is required to get concurrency');
    }

    this._logger.debug('getting concurrency', { username: user });
    return this._client.get(`/rest/v1.2/users/${user}/concurrency`);
  }
}
