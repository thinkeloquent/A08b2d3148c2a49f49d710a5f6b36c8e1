/**
 * @module services/backup-service
 * @description Service for Confluence Backup & Restore REST API operations.
 *
 * Provides site and space backup/restore operations, job management (polling,
 * cancellation, download), and file-based restore uploads. Includes a polling
 * utility for monitoring long-running backup/restore jobs.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence backup and restore operations.
 */
export class BackupService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  // ---------------------------------------------------------------------------
  // Site Backup & Restore
  // ---------------------------------------------------------------------------

  /**
   * Initiate a full site backup.
   *
   * @param {Object} data - Backup configuration payload.
   * @param {boolean} [data.cbAttachments] - Whether to include attachments.
   * @returns {Promise<Object>} Backup job details.
   */
  async backupSite(data) {
    log.debug('backupSite called', { cbAttachments: data?.cbAttachments });
    try {
      const result = await this._client.post('backup/site', data);
      log.info('backupSite succeeded', { jobId: result.jobId ?? result.id });
      return result;
    } catch (error) {
      log.error('backupSite failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Initiate a site restore from a server-side backup file.
   *
   * @param {Object} data - Restore configuration payload.
   * @param {string} data.fileName - Name of the backup file on the server.
   * @returns {Promise<Object>} Restore job details.
   */
  async restoreSite(data) {
    log.debug('restoreSite called', { fileName: data?.fileName });
    try {
      const result = await this._client.post('backup/site/restore', data);
      log.info('restoreSite succeeded', { jobId: result.jobId ?? result.id });
      return result;
    } catch (error) {
      log.error('restoreSite failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Upload a backup file and initiate a site restore (multipart upload).
   *
   * @param {FormData} formData - Multipart form data containing the backup file.
   * @returns {Promise<Object>} Restore job details.
   */
  async restoreSiteUpload(formData) {
    log.debug('restoreSiteUpload called');
    try {
      const result = await this._client.post('backup/site/restore/upload', formData, {
        headers: { 'X-Atlassian-Token': 'nocheck' },
      });
      log.info('restoreSiteUpload succeeded', { jobId: result.jobId ?? result.id });
      return result;
    } catch (error) {
      log.error('restoreSiteUpload failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Space Backup & Restore
  // ---------------------------------------------------------------------------

  /**
   * Initiate a space backup.
   *
   * @param {Object} data - Backup configuration payload.
   * @param {string} data.spaceKey - The space key to back up.
   * @param {boolean} [data.cbAttachments] - Whether to include attachments.
   * @returns {Promise<Object>} Backup job details.
   */
  async backupSpace(data) {
    log.debug('backupSpace called', { spaceKey: data?.spaceKey });
    try {
      const result = await this._client.post('backup/space', data);
      log.info('backupSpace succeeded', { spaceKey: data?.spaceKey, jobId: result.jobId ?? result.id });
      return result;
    } catch (error) {
      log.error('backupSpace failed', { spaceKey: data?.spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Initiate a space restore from a server-side backup file.
   *
   * @param {Object} data - Restore configuration payload.
   * @param {string} data.fileName - Name of the backup file on the server.
   * @returns {Promise<Object>} Restore job details.
   */
  async restoreSpace(data) {
    log.debug('restoreSpace called', { fileName: data?.fileName });
    try {
      const result = await this._client.post('backup/space/restore', data);
      log.info('restoreSpace succeeded', { jobId: result.jobId ?? result.id });
      return result;
    } catch (error) {
      log.error('restoreSpace failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Upload a backup file and initiate a space restore (multipart upload).
   *
   * @param {FormData} formData - Multipart form data containing the backup file.
   * @returns {Promise<Object>} Restore job details.
   */
  async restoreSpaceUpload(formData) {
    log.debug('restoreSpaceUpload called');
    try {
      const result = await this._client.post('backup/space/restore/upload', formData, {
        headers: { 'X-Atlassian-Token': 'nocheck' },
      });
      log.info('restoreSpaceUpload succeeded', { jobId: result.jobId ?? result.id });
      return result;
    } catch (error) {
      log.error('restoreSpaceUpload failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Job Management
  // ---------------------------------------------------------------------------

  /**
   * Get all backup/restore jobs.
   *
   * @returns {Promise<Object>} List of jobs.
   */
  async getJobs() {
    log.debug('getJobs called');
    try {
      const result = await this._client.get('backup/queue');
      log.info('getJobs succeeded', { count: result.results?.length ?? result.length });
      return result;
    } catch (error) {
      log.error('getJobs failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get details of a specific backup/restore job.
   *
   * @param {string} jobId - The job ID.
   * @returns {Promise<Object>} Job details including status and progress.
   */
  async getJob(jobId) {
    log.debug('getJob called', { jobId });
    try {
      const result = await this._client.get(`backup/queue/${jobId}`);
      log.info('getJob succeeded', { jobId, status: result.status });
      return result;
    } catch (error) {
      log.error('getJob failed', { jobId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Download the output file of a completed backup job.
   *
   * Returns the raw Response object for binary streaming.
   *
   * @param {string} jobId - The job ID.
   * @returns {Promise<Response>} Raw HTTP response with the backup file body.
   */
  async downloadJob(jobId) {
    log.debug('downloadJob called', { jobId });
    try {
      const result = await this._client.getRaw(`backup/queue/${jobId}/download`);
      log.info('downloadJob succeeded', { jobId });
      return result;
    } catch (error) {
      log.error('downloadJob failed', { jobId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Clear all completed and failed jobs from the queue.
   *
   * @returns {Promise<void>}
   */
  async clearJobQueue() {
    log.debug('clearJobQueue called');
    try {
      const result = await this._client.delete('backup/queue');
      log.info('clearJobQueue succeeded');
      return result;
    } catch (error) {
      log.error('clearJobQueue failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Cancel a running backup/restore job.
   *
   * @param {string} jobId - The job ID.
   * @returns {Promise<void>}
   */
  async cancelJob(jobId) {
    log.debug('cancelJob called', { jobId });
    try {
      const result = await this._client.post(`backup/queue/${jobId}/cancel`);
      log.info('cancelJob succeeded', { jobId });
      return result;
    } catch (error) {
      log.error('cancelJob failed', { jobId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * List available restore files on the server.
   *
   * @returns {Promise<Object>} List of restore file names.
   */
  async listRestoreFiles() {
    log.debug('listRestoreFiles called');
    try {
      const result = await this._client.get('backup/restore/files');
      log.info('listRestoreFiles succeeded');
      return result;
    } catch (error) {
      log.error('listRestoreFiles failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Polling Utility
  // ---------------------------------------------------------------------------

  /**
   * Poll a backup/restore job until it completes or times out.
   *
   * Periodically fetches job status and invokes an optional progress callback.
   * Resolves when the job reaches a terminal state (completed, failed, cancelled).
   * Rejects if the polling timeout is exceeded or the job fails.
   *
   * @param {string} jobId - The job ID to poll.
   * @param {Object} [options={}] - Polling options.
   * @param {number} [options.interval=2000] - Polling interval in milliseconds.
   * @param {number} [options.timeout=300000] - Maximum polling duration in milliseconds (default 5 minutes).
   * @param {Function} [options.onProgress] - Callback invoked with the job status on each poll.
   * @returns {Promise<Object>} The final job status object.
   * @throws {Error} If the job fails or the timeout is exceeded.
   */
  async pollJob(jobId, { interval = 2000, timeout = 300000, onProgress } = {}) {
    log.debug('pollJob called', { jobId, interval, timeout });
    const startTime = Date.now();

    while (true) {
      const job = await this.getJob(jobId);

      if (typeof onProgress === 'function') {
        onProgress(job);
      }

      const status = (job.status || '').toLowerCase();

      if (status === 'completed' || status === 'complete') {
        log.info('pollJob completed', { jobId, status: job.status });
        return job;
      }

      if (status === 'failed' || status === 'error') {
        const errorMsg = `Backup/restore job ${jobId} failed: ${job.message || job.status}`;
        log.error('pollJob job failed', { jobId, status: job.status, message: job.message });
        throw new Error(errorMsg);
      }

      if (status === 'cancelled' || status === 'canceled') {
        const cancelMsg = `Backup/restore job ${jobId} was cancelled`;
        log.info('pollJob job cancelled', { jobId });
        throw new Error(cancelMsg);
      }

      const elapsed = Date.now() - startTime;
      if (elapsed >= timeout) {
        const timeoutMsg = `Polling timed out after ${timeout}ms for job ${jobId}`;
        log.error('pollJob timed out', { jobId, elapsed, timeout });
        throw new Error(timeoutMsg);
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
}
