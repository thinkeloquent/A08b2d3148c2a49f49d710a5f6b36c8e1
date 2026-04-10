/**
 * Projects Routes — Figma API SDK
 */

export default async function projectsRoutes(server, { projectsClient }) {
  server.get('/teams/:teamId/projects', async (request) => {
    const { teamId } = request.params;
    return projectsClient.getTeamProjects(teamId);
  });

  server.get('/projects/:projectId/files', async (request) => {
    const { projectId } = request.params;
    const { branch_data } = request.query;
    return projectsClient.getProjectFiles(projectId, { branchData: branch_data === 'true' });
  });

  return Promise.resolve();
}
