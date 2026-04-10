/**
 * GitHub Actions SDK client.
 * Provides methods for workflow runs, jobs, artifacts, and workflows.
 * @module sdk/actions/client
 */

import { createLogger } from '../client.mjs';
import { validateUsername, validateRepositoryName } from '../validation.mjs';

/**
 * Client for GitHub Actions API operations.
 */
export class ActionsClient {
  /**
   * @param {import('../client.mjs').GitHubClient} client - The base GitHub HTTP client
   */
  constructor(client) {
    this.client = client;
    this.log = createLogger('actions');
  }

  // ── Workflow Runs ──────────────────────────────────────────────────

  /**
   * List workflow runs for a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {string} [options.actor]
   * @param {string} [options.branch]
   * @param {string} [options.event]
   * @param {string} [options.status]
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @param {string} [options.created]
   * @param {boolean} [options.exclude_pull_requests]
   * @returns {Promise<import('./types.mjs').WorkflowRun[]>}
   */
  async listWorkflowRuns(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing workflow runs', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/actions/runs`, {
      params: options,
    });
  }

  /**
   * Get a specific workflow run.
   * @param {string} owner
   * @param {string} repo
   * @param {number} runId
   * @returns {Promise<import('./types.mjs').WorkflowRun>}
   */
  async getWorkflowRun(owner, repo, runId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting workflow run', { owner, repo, runId });
    return this.client.get(`/repos/${owner}/${repo}/actions/runs/${runId}`);
  }

  /**
   * Cancel a workflow run.
   * @param {string} owner
   * @param {string} repo
   * @param {number} runId
   * @returns {Promise<Object>}
   */
  async cancelWorkflowRun(owner, repo, runId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.warn('Cancelling workflow run', { owner, repo, runId });
    return this.client.post(
      `/repos/${owner}/${repo}/actions/runs/${runId}/cancel`,
    );
  }

  /**
   * Re-run a workflow.
   * @param {string} owner
   * @param {string} repo
   * @param {number} runId
   * @returns {Promise<Object>}
   */
  async rerunWorkflow(owner, repo, runId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Re-running workflow', { owner, repo, runId });
    return this.client.post(
      `/repos/${owner}/${repo}/actions/runs/${runId}/rerun`,
    );
  }

  /**
   * Re-run failed jobs in a workflow run.
   * @param {string} owner
   * @param {string} repo
   * @param {number} runId
   * @returns {Promise<Object>}
   */
  async rerunFailedJobs(owner, repo, runId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Re-running failed jobs', { owner, repo, runId });
    return this.client.post(
      `/repos/${owner}/${repo}/actions/runs/${runId}/rerun-failed-jobs`,
    );
  }

  // ── Jobs ───────────────────────────────────────────────────────────

  /**
   * List jobs for a workflow run.
   * @param {string} owner
   * @param {string} repo
   * @param {number} runId
   * @param {Object} [options]
   * @param {string} [options.filter] - latest or all (default: latest)
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @returns {Promise<import('./types.mjs').WorkflowJob[]>}
   */
  async listJobsForWorkflowRun(owner, repo, runId, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing jobs for workflow run', { owner, repo, runId });
    return this.client.get(
      `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
      { params: options },
    );
  }

  /**
   * Get a specific job.
   * @param {string} owner
   * @param {string} repo
   * @param {number} jobId
   * @returns {Promise<import('./types.mjs').WorkflowJob>}
   */
  async getJob(owner, repo, jobId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting job', { owner, repo, jobId });
    return this.client.get(`/repos/${owner}/${repo}/actions/jobs/${jobId}`);
  }

  // ── Artifacts ──────────────────────────────────────────────────────

  /**
   * List artifacts for a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @param {string} [options.name]
   * @returns {Promise<Object>}
   */
  async listArtifacts(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing artifacts', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/actions/artifacts`, {
      params: options,
    });
  }

  /**
   * List artifacts for a specific workflow run.
   * @param {string} owner
   * @param {string} repo
   * @param {number} runId
   * @param {Object} [options]
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @param {string} [options.name]
   * @returns {Promise<Object>}
   */
  async listWorkflowRunArtifacts(owner, repo, runId, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing artifacts for workflow run', {
      owner,
      repo,
      runId,
    });
    return this.client.get(
      `/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
      { params: options },
    );
  }

  /**
   * Get a specific artifact.
   * @param {string} owner
   * @param {string} repo
   * @param {number} artifactId
   * @returns {Promise<import('./types.mjs').Artifact>}
   */
  async getArtifact(owner, repo, artifactId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting artifact', { owner, repo, artifactId });
    return this.client.get(
      `/repos/${owner}/${repo}/actions/artifacts/${artifactId}`,
    );
  }

  /**
   * Delete an artifact.
   * @param {string} owner
   * @param {string} repo
   * @param {number} artifactId
   * @returns {Promise<Object>}
   */
  async deleteArtifact(owner, repo, artifactId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.warn('Deleting artifact', { owner, repo, artifactId });
    return this.client.delete(
      `/repos/${owner}/${repo}/actions/artifacts/${artifactId}`,
    );
  }

  // ── Workflows ──────────────────────────────────────────────────────

  // ── Downloads ────────────────────────────────────────────────────

  /**
   * Download an artifact archive (ZIP).
   * Returns a raw Response whose body can be streamed.
   * @param {string} owner
   * @param {string} repo
   * @param {number} artifactId
   * @returns {Promise<Response>}
   */
  async downloadArtifact(owner, repo, artifactId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Downloading artifact', { owner, repo, artifactId });
    return this.client.getRaw(
      `/repos/${owner}/${repo}/actions/artifacts/${artifactId}/zip`,
    );
  }

  /**
   * Download workflow run logs (ZIP).
   * Returns a raw Response whose body can be streamed.
   * @param {string} owner
   * @param {string} repo
   * @param {number} runId
   * @returns {Promise<Response>}
   */
  async downloadRunLogs(owner, repo, runId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Downloading run logs', { owner, repo, runId });
    return this.client.getRaw(
      `/repos/${owner}/${repo}/actions/runs/${runId}/logs`,
    );
  }

  /**
   * Download job logs (plain text).
   * Returns a raw Response whose body can be streamed.
   * @param {string} owner
   * @param {string} repo
   * @param {number} jobId
   * @returns {Promise<Response>}
   */
  async downloadJobLogs(owner, repo, jobId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Downloading job logs', { owner, repo, jobId });
    return this.client.getRaw(
      `/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`,
    );
  }

  // ── Workflow Dispatch ───────────────────────────────────────────

  /**
   * Dispatch a workflow run.
   * @param {string} owner
   * @param {string} repo
   * @param {number|string} workflowId
   * @param {string} ref - Branch or tag to run against
   * @param {Object} [inputs] - Input key/value pairs
   * @returns {Promise<Object>}
   */
  async dispatchWorkflow(owner, repo, workflowId, ref, inputs = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Dispatching workflow', { owner, repo, workflowId, ref });
    return this.client.post(
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
      { ref, inputs },
    );
  }

  // ── Workflows ──────────────────────────────────────────────────────

  /**
   * List workflows for a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @returns {Promise<Object>}
   */
  async listWorkflows(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing workflows', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/actions/workflows`, {
      params: options,
    });
  }

  /**
   * Get a specific workflow.
   * @param {string} owner
   * @param {string} repo
   * @param {number|string} workflowId - Workflow ID or filename
   * @returns {Promise<import('./types.mjs').Workflow>}
   */
  async getWorkflow(owner, repo, workflowId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting workflow', { owner, repo, workflowId });
    return this.client.get(
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}`,
    );
  }

  /**
   * List workflow runs for a specific workflow.
   * @param {string} owner
   * @param {string} repo
   * @param {number|string} workflowId - Workflow ID or filename
   * @param {Object} [options]
   * @param {string} [options.actor]
   * @param {string} [options.branch]
   * @param {string} [options.event]
   * @param {string} [options.status]
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @returns {Promise<Object>}
   */
  async listWorkflowRunsForWorkflow(owner, repo, workflowId, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing runs for workflow', { owner, repo, workflowId });
    return this.client.get(
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`,
      { params: options },
    );
  }
}
