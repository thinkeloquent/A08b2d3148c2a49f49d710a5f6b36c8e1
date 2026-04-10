/**
 * Routes Aggregator
 * Registers all CRUD routes under the /api/group-role-management prefix
 */

import roleRoutes from './roles.mjs';
import groupRoutes from './groups.mjs';
import labelRoutes from './labels.mjs';
import actionRoutes from './actions.mjs';
import restrictionRoutes from './restrictions.mjs';

export default async function routes(fastify, _options) {
  fastify.register(roleRoutes);
  fastify.register(groupRoutes);
  fastify.register(labelRoutes);
  fastify.register(actionRoutes);
  fastify.register(restrictionRoutes);

  fastify.log.info('  ✓ Registered CRUD routes for roles, groups, labels, actions, and restrictions');

  return Promise.resolve();
}

export { roleRoutes, groupRoutes, labelRoutes, actionRoutes, restrictionRoutes };
