/**
 * Jobs Module — Sauce Labs API Client
 *
 * Manage test execution history (VDC & RDC).
 *
 * Endpoints:
 *   GET /rest/v1/{username}/jobs          - List jobs
 *   GET /rest/v1.1/{username}/jobs/{id}   - Get job details
 */

import { create } from '../logger.mjs';
import { SaucelabsValidationError } from '../errors.mjs';

const log = create('saucelabs-api', import.meta.url);

export class JobsModule {
  /**
   * @param {import('../client.mjs').SaucelabsClient} client
   */
  constructor(client) {
    this._client = client;
    this._logger = log;
  }

  /**
   * List test jobs for the configured user.
   *
   * @param {object} [params={}]
   * @param {number} [params.limit=25] - Number of jobs to return
   * @param {number} [params.skip] - Number of jobs to skip
   * @param {number} [params.from] - Unix timestamp start filter
   * @param {number} [params.to] - Unix timestamp end filter
   * @returns {Promise<Array>} List of job objects
   */
  async list(params = {}) {
    const username = this._client.username;
    if (!username) {
      throw new SaucelabsValidationError('username is required to list jobs');
    }

    const queryParams = { limit: params.limit ?? 25, format: 'json' };
    if (params.skip !== undefined) queryParams.skip = params.skip;
    if (params.from !== undefined) {
      if (!Number.isInteger(params.from) || params.from < 0) {
        throw new SaucelabsValidationError('"from" must be a positive integer (Unix timestamp)');
      }
      queryParams.from = params.from;
    }
    if (params.to !== undefined) {
      if (!Number.isInteger(params.to) || params.to < 0) {
        throw new SaucelabsValidationError('"to" must be a positive integer (Unix timestamp)');
      }
      queryParams.to = params.to;
    }

    this._logger.debug('listing jobs', { username, params: queryParams });
    return this._client.get(`/rest/v1/${username}/jobs`, { params: queryParams });
  }

  /**
   * Get details for a specific job.
   *
   * @param {string} jobId - The job identifier
   * @returns {Promise<object>} Job details
   */
  async get(jobId) {
    const username = this._client.username;
    if (!username) {
      throw new SaucelabsValidationError('username is required to get job');
    }
    if (!jobId) {
      throw new SaucelabsValidationError('jobId is required');
    }

    this._logger.debug('getting job', { username, jobId });
    return this._client.get(`/rest/v1.1/${username}/jobs/${jobId}`);
  }
}
