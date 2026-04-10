/**
 * @module services/issue-service
 * @description Issue service for JIRA operations.
 */

import { UserService } from './user-service.mjs';
import {
  issueCreateToJiraFormat,
  issueUpdateToJiraFormat,
  issueTransitionToJiraFormat,
} from '../models/issue.mjs';
import { createLogger } from '../logger.mjs';

const log = createLogger('jira-api', import.meta.url);

export class IssueService {
  /** @param {import('../client/JiraFetchClient.mjs').JiraFetchClient} client */
  constructor(client) {
    this._client = client;
    this._userService = new UserService(client);
  }

  /**
   * Create a new issue.
   * @param {object} params
   * @param {string} params.projectId
   * @param {string} params.summary
   * @param {string} params.issueTypeId
   * @param {string} [params.description]
   * @param {string} [params.priorityId]
   * @param {string} [params.assigneeEmail]
   * @param {string[]} [params.labels]
   * @returns {Promise<import('../models/issue.mjs').Issue>}
   */
  async createIssue({
    projectId, summary, issueTypeId, description,
    priorityId, assigneeEmail, labels = [],
  }) {
    let assigneeAccountId;
    if (assigneeEmail) {
      const user = await this._userService.getUserByEmail(assigneeEmail);
      if (user) assigneeAccountId = user.accountId;
    }

    const body = issueCreateToJiraFormat({
      projectId, summary, description, issueTypeId,
      priorityId, assigneeAccountId, labels,
    });

    const data = await this._client.post('/rest/api/3/issue', body);
    const issueKey = data?.key;
    if (!issueKey) throw new Error('Issue created but key not returned');
    return this.getIssue(issueKey);
  }

  /**
   * Create an issue by type name instead of ID.
   * @param {object} params
   * @param {string} params.projectKey
   * @param {string} params.summary
   * @param {string} params.issueTypeName
   * @param {string} [params.description]
   * @param {string} [params.priorityId]
   * @param {string} [params.assigneeEmail]
   * @param {string[]} [params.labels]
   * @returns {Promise<import('../models/issue.mjs').Issue>}
   */
  async createIssueByTypeName({
    projectKey, summary, issueTypeName, description,
    priorityId, assigneeEmail, labels = [],
  }) {
    const project = await this._client.get(`/rest/api/3/project/${encodeURIComponent(projectKey)}`);
    const issueTypes = project.issueTypes || [];
    const match = issueTypes.find(
      (t) => t.name.toLowerCase() === issueTypeName.toLowerCase(),
    );
    if (!match) {
      const available = issueTypes.map((t) => t.name).join(', ');
      throw new Error(
        `Issue type '${issueTypeName}' not found in project '${projectKey}'. Available: ${available}`,
      );
    }
    return this.createIssue({
      projectId: project.id,
      summary,
      issueTypeId: match.id,
      description,
      priorityId,
      assigneeEmail,
      labels,
    });
  }

  /**
   * Get an issue by key.
   * @param {string} issueKey
   * @returns {Promise<import('../models/issue.mjs').Issue>}
   */
  async getIssue(issueKey) {
    return this._client.get(`/rest/api/3/issue/${encodeURIComponent(issueKey)}`);
  }

  /**
   * Update an issue's summary.
   * @param {string} issueKey
   * @param {string} summary
   */
  async updateIssueSummary(issueKey, summary) {
    const body = issueUpdateToJiraFormat({ summary, labelsAdd: [], labelsRemove: [] });
    await this._client.put(`/rest/api/3/issue/${encodeURIComponent(issueKey)}`, body);
  }

  /**
   * Update an issue's description.
   * @param {string} issueKey
   * @param {string} description
   */
  async updateIssueDescription(issueKey, description) {
    const body = issueUpdateToJiraFormat({ description, labelsAdd: [], labelsRemove: [] });
    await this._client.put(`/rest/api/3/issue/${encodeURIComponent(issueKey)}`, body);
  }

  /**
   * Add labels to an issue.
   * @param {string} issueKey
   * @param {string[]} labels
   */
  async addLabels(issueKey, labels) {
    const body = issueUpdateToJiraFormat({ labelsAdd: labels, labelsRemove: [] });
    await this._client.put(`/rest/api/3/issue/${encodeURIComponent(issueKey)}`, body);
  }

  /**
   * Remove labels from an issue.
   * @param {string} issueKey
   * @param {string[]} labels
   */
  async removeLabels(issueKey, labels) {
    const body = issueUpdateToJiraFormat({ labelsAdd: [], labelsRemove: labels });
    await this._client.put(`/rest/api/3/issue/${encodeURIComponent(issueKey)}`, body);
  }

  /**
   * Assign an issue to a user by email.
   * @param {string} issueKey
   * @param {string} email
   */
  async assignIssueByEmail(issueKey, email) {
    const user = await this._userService.getUserByEmail(email);
    if (!user) throw new Error(`User with email '${email}' not found`);
    await this._client.put(
      `/rest/api/3/issue/${encodeURIComponent(issueKey)}/assignee`,
      { accountId: user.accountId },
    );
  }

  /**
   * Unassign an issue.
   * @param {string} issueKey
   */
  async unassignIssue(issueKey) {
    await this._client.put(
      `/rest/api/3/issue/${encodeURIComponent(issueKey)}/assignee`,
      { accountId: null },
    );
  }

  /**
   * Get available transitions for an issue.
   * @param {string} issueKey
   * @returns {Promise<Array<import('../models/issue.mjs').IssueTransition>>}
   */
  async getAvailableTransitions(issueKey) {
    const data = await this._client.get(
      `/rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions`,
    );
    return data.transitions || [];
  }

  /**
   * Transition an issue by transition name.
   * @param {string} issueKey
   * @param {string} transitionName
   * @param {string} [comment]
   * @param {string} [resolutionName]
   */
  async transitionIssueByName(issueKey, transitionName, comment, resolutionName) {
    const transitions = await this.getAvailableTransitions(issueKey);
    const match = transitions.find(
      (t) => t.name.toLowerCase() === transitionName.toLowerCase(),
    );
    if (!match) {
      const available = transitions.map((t) => t.name).join(', ');
      throw new Error(
        `Transition '${transitionName}' not found. Available: ${available}`,
      );
    }
    const body = issueTransitionToJiraFormat({
      transitionId: match.id, comment, resolutionName,
    });
    await this._client.post(
      `/rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions`,
      body,
    );
  }

  /**
   * Transition an issue by transition ID.
   * @param {string} issueKey
   * @param {string} transitionId
   * @param {string} [comment]
   * @param {string} [resolutionName]
   */
  async transitionIssueById(issueKey, transitionId, comment, resolutionName) {
    const body = issueTransitionToJiraFormat({
      transitionId, comment, resolutionName,
    });
    await this._client.post(
      `/rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions`,
      body,
    );
  }
}
