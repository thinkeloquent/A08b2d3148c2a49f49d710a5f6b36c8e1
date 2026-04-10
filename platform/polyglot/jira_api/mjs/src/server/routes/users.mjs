/**
 * @module server/routes/users
 * @description Fastify user routes for the Jira API server.
 */

/**
 * Register user routes.
 * @param {import('fastify').FastifyInstance} scope
 * @param {{ userService: import('../../services/user-service.mjs').UserService }} opts
 */
export async function userRoutes(scope, { userService }) {
  scope.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string' },
          max_results: { type: 'integer', default: 50 },
        },
      },
    },
  }, async (request) => {
    const { query, max_results = 50 } = request.query;
    return userService.searchUsers(query, max_results);
  });

  scope.get('/:identifier', async (request) => {
    const { identifier } = request.params;
    const user = await userService.getUserByIdentifier(identifier);
    if (!user) {
      return scope.httpErrors.notFound(`User '${identifier}' not found`);
    }
    return user;
  });
}
