/**
 * Projects Client — Figma API SDK
 *
 * Domain client for Figma team projects and project files.
 * Wraps FigmaClient HTTP methods with structured logging.
 */

import { create } from '../../logger.mjs';

const log = create('figma-api', import.meta.url);

export class ProjectsClient {
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
   * List projects for a team.
   *
   * @param {string} teamId - The team ID
   * @returns {Promise<object>} Team projects response
   * @see https://www.figma.com/developers/api#get-team-projects-endpoint
   */
  async getTeamProjects(teamId) {
    this._logger.info('getTeamProjects', { teamId });

    const data = await this._client.get(`/v1/teams/${teamId}/projects`);

    this._logger.info('getTeamProjects success', {
      teamId,
      projectCount: data.projects?.length ?? 0,
    });

    return data;
  }

  /**
   * List files in a project.
   *
   * @param {string} projectId - The project ID
   * @param {object} [options]
   * @param {boolean} [options.branchData] - Include branch metadata
   * @returns {Promise<object>} Project files response
   * @see https://www.figma.com/developers/api#get-project-files-endpoint
   */
  async getProjectFiles(projectId, { branchData } = {}) {
    this._logger.info('getProjectFiles', { projectId, branchData });

    const params = {};
    if (branchData !== undefined) params.branch_data = branchData;

    const data = await this._client.get(`/v1/projects/${projectId}/files`, { params });

    this._logger.info('getProjectFiles success', {
      projectId,
      fileCount: data.files?.length ?? 0,
    });

    return data;
  }
}
