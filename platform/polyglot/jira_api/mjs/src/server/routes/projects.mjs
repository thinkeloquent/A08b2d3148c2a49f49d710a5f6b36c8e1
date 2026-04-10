/**
 * @module server/routes/projects
 * @description Fastify project routes for the Jira API server.
 */

/**
 * Register project routes.
 * @param {import('fastify').FastifyInstance} scope
 * @param {{ projectService: import('../../services/project-service.mjs').ProjectService }} opts
 */
export async function projectRoutes(scope, { projectService }) {
  scope.get('/:projectKey', async (request) => {
    return projectService.getProject(request.params.projectKey);
  });

  scope.get('/:projectKey/versions', async (request) => {
    const { projectKey } = request.params;
    const { released } = request.query;
    const releasedOnly = released === undefined ? null : released === 'true';
    return projectService.getProjectVersions(projectKey, releasedOnly);
  });

  scope.post('/:projectKey/versions', async (request) => {
    const { projectKey } = request.params;
    const { name, description } = request.body;
    return projectService.createVersion({
      projectKey, versionName: name, description,
    });
  });
}
