/**
 * @module server/routes/issues
 * @description Fastify issue routes for the Jira API server.
 */

/**
 * Register issue routes.
 * @param {import('fastify').FastifyInstance} scope
 * @param {{ issueService: import('../../services/issue-service.mjs').IssueService }} opts
 */
export async function issueRoutes(scope, { issueService }) {
  scope.post('/', async (request) => {
    const {
      projectId, summary, issueTypeId, description,
      priorityId, labels,
    } = request.body;
    return issueService.createIssue({
      projectId, summary, issueTypeId, description, priorityId, labels,
    });
  });

  scope.get('/:issueKey', async (request) => {
    return issueService.getIssue(request.params.issueKey);
  });

  scope.patch('/:issueKey', async (request) => {
    const { issueKey } = request.params;
    const { summary, labelsAdd, labelsRemove } = request.body;
    if (summary) await issueService.updateIssueSummary(issueKey, summary);
    if (labelsAdd?.length) await issueService.addLabels(issueKey, labelsAdd);
    if (labelsRemove?.length) await issueService.removeLabels(issueKey, labelsRemove);
    return { message: `Issue ${issueKey} updated successfully` };
  });

  scope.put('/:issueKey/assign/:email', async (request) => {
    const { issueKey, email } = request.params;
    await issueService.assignIssueByEmail(issueKey, email);
    return { message: `Issue ${issueKey} assigned to ${email}` };
  });

  scope.get('/:issueKey/transitions', async (request) => {
    return issueService.getAvailableTransitions(request.params.issueKey);
  });

  scope.post('/:issueKey/transitions', async (request) => {
    const { issueKey } = request.params;
    const { transition_name, comment, resolution_name } = request.body;
    await issueService.transitionIssueByName(issueKey, transition_name, comment, resolution_name);
    return { message: `Issue ${issueKey} transitioned using '${transition_name}'` };
  });
}
