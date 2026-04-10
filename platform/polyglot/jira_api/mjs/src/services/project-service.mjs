/**
 * @module services/project-service
 * @description Project service for JIRA operations.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('jira-api', import.meta.url);

export class ProjectService {
  /** @param {import('../client/JiraFetchClient.mjs').JiraFetchClient} client */
  constructor(client) {
    this._client = client;
  }

  /**
   * Get a project by key.
   * @param {string} projectKey
   * @returns {Promise<import('../models/project.mjs').Project>}
   */
  async getProject(projectKey) {
    return this._client.get(`/rest/api/3/project/${encodeURIComponent(projectKey)}`);
  }

  /**
   * Get all versions for a project.
   * @param {string} projectKey
   * @param {boolean|null} [releasedOnly=null]
   * @returns {Promise<Array<import('../models/project.mjs').ProjectVersion>>}
   */
  async getProjectVersions(projectKey, releasedOnly = null) {
    const versions = await this._client.get(
      `/rest/api/3/project/${encodeURIComponent(projectKey)}/versions`,
    );
    if (releasedOnly === null) return versions;
    return releasedOnly
      ? versions.filter((v) => v.released)
      : versions.filter((v) => !v.released);
  }

  /**
   * Create a new version for a project.
   * @param {object} params
   * @param {string} params.projectKey
   * @param {string} params.versionName
   * @param {string} [params.description]
   * @param {string} [params.startDate]
   * @param {string} [params.releaseDate]
   * @param {boolean} [params.released=false]
   * @param {boolean} [params.archived=false]
   * @returns {Promise<import('../models/project.mjs').ProjectVersion>}
   */
  async createVersion({
    projectKey, versionName, description,
    startDate, releaseDate, released = false, archived = false,
  }) {
    const project = await this.getProject(projectKey);
    const body = {
      name: versionName,
      projectId: Number(project.id),
      archived,
      released,
    };
    if (description) body.description = description;
    if (startDate) body.startDate = startDate;
    if (releaseDate) body.releaseDate = releaseDate;
    return this._client.post('/rest/api/3/version', body);
  }

  /**
   * Get a version by name.
   * @param {string} projectKey
   * @param {string} versionName
   * @returns {Promise<import('../models/project.mjs').ProjectVersion|null>}
   */
  async getVersionByName(projectKey, versionName) {
    const versions = await this.getProjectVersions(projectKey);
    return versions.find((v) => v.name === versionName) || null;
  }

  /**
   * Get released versions.
   * @param {string} projectKey
   * @returns {Promise<Array<import('../models/project.mjs').ProjectVersion>>}
   */
  async getReleasedVersions(projectKey) {
    return this.getProjectVersions(projectKey, true);
  }

  /**
   * Get unreleased versions.
   * @param {string} projectKey
   * @returns {Promise<Array<import('../models/project.mjs').ProjectVersion>>}
   */
  async getUnreleasedVersions(projectKey) {
    return this.getProjectVersions(projectKey, false);
  }

  /**
   * Get all issue types.
   * @returns {Promise<Array<object>>}
   */
  async getIssueTypes() {
    return this._client.get('/rest/api/3/issuetype');
  }
}
