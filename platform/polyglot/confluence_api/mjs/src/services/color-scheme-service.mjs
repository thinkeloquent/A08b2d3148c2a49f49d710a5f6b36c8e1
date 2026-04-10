/**
 * @module services/color-scheme-service
 * @description Service for Confluence Color Scheme (Look and Feel) REST API operations.
 *
 * Manages the visual theme configuration at global and space levels.
 * Supports reading default, global, and space-specific color schemes,
 * updating them, and resetting to defaults.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence color scheme / look-and-feel operations.
 */
export class ColorSchemeService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  // ---------------------------------------------------------------------------
  // Global Color Scheme
  // ---------------------------------------------------------------------------

  /**
   * Get the default (built-in) color scheme.
   *
   * Returns the base color scheme that ships with Confluence before
   * any customizations are applied.
   *
   * @returns {Promise<Object>} Default color scheme object.
   */
  async getDefaultColorScheme() {
    log.debug('getDefaultColorScheme called');
    try {
      const result = await this._client.get('settings/lookandfeel/default');
      log.info('getDefaultColorScheme succeeded');
      return result;
    } catch (error) {
      log.error('getDefaultColorScheme failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get the current global color scheme.
   *
   * Returns the color scheme currently applied to the Confluence instance
   * at the global level.
   *
   * @returns {Promise<Object>} Global color scheme object.
   */
  async getGlobalColorScheme() {
    log.debug('getGlobalColorScheme called');
    try {
      const result = await this._client.get('settings/lookandfeel');
      log.info('getGlobalColorScheme succeeded');
      return result;
    } catch (error) {
      log.error('getGlobalColorScheme failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Update the global color scheme.
   *
   * @param {Object} data - Color scheme update payload.
   * @param {Object} [data.headings] - Heading color configuration.
   * @param {Object} [data.links] - Link color configuration.
   * @param {Object} [data.menus] - Menu color configuration.
   * @param {Object} [data.header] - Header color configuration.
   * @param {Object} [data.content] - Content area color configuration.
   * @param {Object} [data.bordersAndDividers] - Borders color configuration.
   * @returns {Promise<Object>} The updated global color scheme.
   */
  async updateGlobalColorScheme(data) {
    log.debug('updateGlobalColorScheme called');
    try {
      const result = await this._client.put('settings/lookandfeel', data);
      log.info('updateGlobalColorScheme succeeded');
      return result;
    } catch (error) {
      log.error('updateGlobalColorScheme failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Reset the global color scheme to the default.
   *
   * Removes all global customizations and reverts to the built-in theme.
   *
   * @returns {Promise<Object>} The reset color scheme.
   */
  async resetGlobalColorScheme() {
    log.debug('resetGlobalColorScheme called');
    try {
      const result = await this._client.delete('settings/lookandfeel');
      log.info('resetGlobalColorScheme succeeded');
      return result;
    } catch (error) {
      log.error('resetGlobalColorScheme failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Space Color Scheme
  // ---------------------------------------------------------------------------

  /**
   * Get the color scheme type for a space.
   *
   * Returns whether the space uses the global theme or a custom theme.
   *
   * @param {string} spaceKey - The space key.
   * @returns {Promise<Object>} Space color scheme type (global or custom).
   */
  async getSpaceColorSchemeType(spaceKey) {
    log.debug('getSpaceColorSchemeType called', { spaceKey });
    try {
      const result = await this._client.get(`settings/lookandfeel/custom/${spaceKey}/type`);
      log.info('getSpaceColorSchemeType succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('getSpaceColorSchemeType failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Set the color scheme type for a space.
   *
   * Switches a space between using the global theme and a custom theme.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} data - Type configuration payload.
   * @param {string} data.themeType - Theme type ("global" or "custom").
   * @returns {Promise<Object>} The updated space color scheme type.
   */
  async setSpaceColorSchemeType(spaceKey, data) {
    log.debug('setSpaceColorSchemeType called', { spaceKey, themeType: data?.themeType });
    try {
      const result = await this._client.put(`settings/lookandfeel/custom/${spaceKey}/type`, data);
      log.info('setSpaceColorSchemeType succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('setSpaceColorSchemeType failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get the custom color scheme for a space.
   *
   * @param {string} spaceKey - The space key.
   * @returns {Promise<Object>} Space color scheme object.
   */
  async getSpaceColorScheme(spaceKey) {
    log.debug('getSpaceColorScheme called', { spaceKey });
    try {
      const result = await this._client.get(`settings/lookandfeel/custom/${spaceKey}`);
      log.info('getSpaceColorScheme succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('getSpaceColorScheme failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Update the custom color scheme for a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} data - Color scheme update payload.
   * @returns {Promise<Object>} The updated space color scheme.
   */
  async updateSpaceColorScheme(spaceKey, data) {
    log.debug('updateSpaceColorScheme called', { spaceKey });
    try {
      const result = await this._client.put(`settings/lookandfeel/custom/${spaceKey}`, data);
      log.info('updateSpaceColorScheme succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('updateSpaceColorScheme failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Reset a space's color scheme to the global default.
   *
   * Removes the space-level customization and reverts to the global theme.
   *
   * @param {string} spaceKey - The space key.
   * @returns {Promise<Object>} The reset result.
   */
  async resetSpaceColorScheme(spaceKey) {
    log.debug('resetSpaceColorScheme called', { spaceKey });
    try {
      const result = await this._client.delete(`settings/lookandfeel/custom/${spaceKey}`);
      log.info('resetSpaceColorScheme succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('resetSpaceColorScheme failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }
}
