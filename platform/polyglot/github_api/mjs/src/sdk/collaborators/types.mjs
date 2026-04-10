/**
 * JSDoc type definitions for collaborator operations.
 * @module sdk/collaborators/types
 */

/**
 * @typedef {Object} Collaborator
 * @property {number} id
 * @property {string} login
 * @property {string} avatar_url
 * @property {string} type
 * @property {boolean} site_admin
 * @property {Object} permissions
 * @property {boolean} permissions.pull
 * @property {boolean} permissions.triage
 * @property {boolean} permissions.push
 * @property {boolean} permissions.maintain
 * @property {boolean} permissions.admin
 * @property {string} role_name
 */

/**
 * Permission levels in ascending order.
 * @typedef {'none'|'pull'|'triage'|'push'|'maintain'|'admin'} Permission
 */

/**
 * @typedef {Object} Invitation
 * @property {number} id
 * @property {Object} repository
 * @property {Object} invitee
 * @property {Object} inviter
 * @property {string} permissions
 * @property {string} created_at
 * @property {string} html_url
 */

export default {};
