/**
 * Actions routes.
 * Exposes GitHub Actions API operations as REST endpoints.
 * @module routes/actions
 */

/**
 * Fastify plugin that registers GitHub Actions routes.
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} opts
 * @param {import('../sdk/actions/client.mjs').ActionsClient} opts.actions - Actions SDK client
 */
export default async function actionRoutes(fastify, opts) {
  const { actions } = opts;

  // ── Workflows ──────────────────────────────────────────────────────

  /**
   * GET /repos/:owner/:repo/actions/workflows - List workflows.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/workflows',
    async (request, reply) => {
      const { owner, repo } = request.params;
      const result = await actions.listWorkflows(owner, repo, request.query);
      return reply.send(result);
    },
  );

  /**
   * GET /repos/:owner/:repo/actions/workflows/:workflowId - Get a workflow.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/workflows/:workflowId',
    async (request, reply) => {
      const { owner, repo, workflowId } = request.params;
      const result = await actions.getWorkflow(owner, repo, workflowId);
      return reply.send(result);
    },
  );

  /**
   * GET /repos/:owner/:repo/actions/workflows/:workflowId/runs - List runs for a workflow.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/workflows/:workflowId/runs',
    async (request, reply) => {
      const { owner, repo, workflowId } = request.params;
      const result = await actions.listWorkflowRunsForWorkflow(
        owner,
        repo,
        workflowId,
        request.query,
      );
      return reply.send(result);
    },
  );

  // ── Workflow Runs ──────────────────────────────────────────────────

  /**
   * GET /repos/:owner/:repo/actions/runs - List workflow runs.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/runs',
    async (request, reply) => {
      const { owner, repo } = request.params;
      const result = await actions.listWorkflowRuns(
        owner,
        repo,
        request.query,
      );
      return reply.send(result);
    },
  );

  /**
   * GET /repos/:owner/:repo/actions/runs/:runId - Get a workflow run.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/runs/:runId',
    async (request, reply) => {
      const { owner, repo, runId } = request.params;
      const result = await actions.getWorkflowRun(
        owner,
        repo,
        parseInt(runId, 10),
      );
      return reply.send(result);
    },
  );

  /**
   * POST /repos/:owner/:repo/actions/runs/:runId/cancel - Cancel a workflow run.
   */
  fastify.post(
    '/repos/:owner/:repo/actions/runs/:runId/cancel',
    async (request, reply) => {
      const { owner, repo, runId } = request.params;
      await actions.cancelWorkflowRun(owner, repo, parseInt(runId, 10));
      return reply.status(202).send();
    },
  );

  /**
   * POST /repos/:owner/:repo/actions/runs/:runId/rerun - Re-run a workflow.
   */
  fastify.post(
    '/repos/:owner/:repo/actions/runs/:runId/rerun',
    async (request, reply) => {
      const { owner, repo, runId } = request.params;
      await actions.rerunWorkflow(owner, repo, parseInt(runId, 10));
      return reply.status(201).send();
    },
  );

  /**
   * POST /repos/:owner/:repo/actions/runs/:runId/rerun-failed-jobs - Re-run failed jobs.
   */
  fastify.post(
    '/repos/:owner/:repo/actions/runs/:runId/rerun-failed-jobs',
    async (request, reply) => {
      const { owner, repo, runId } = request.params;
      await actions.rerunFailedJobs(owner, repo, parseInt(runId, 10));
      return reply.status(201).send();
    },
  );

  // ── Jobs ───────────────────────────────────────────────────────────

  /**
   * GET /repos/:owner/:repo/actions/runs/:runId/jobs - List jobs for a workflow run.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/runs/:runId/jobs',
    async (request, reply) => {
      const { owner, repo, runId } = request.params;
      const result = await actions.listJobsForWorkflowRun(
        owner,
        repo,
        parseInt(runId, 10),
        request.query,
      );
      return reply.send(result);
    },
  );

  /**
   * GET /repos/:owner/:repo/actions/jobs/:jobId - Get a specific job.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/jobs/:jobId',
    async (request, reply) => {
      const { owner, repo, jobId } = request.params;
      const result = await actions.getJob(
        owner,
        repo,
        parseInt(jobId, 10),
      );
      return reply.send(result);
    },
  );

  // ── Artifacts ──────────────────────────────────────────────────────

  /**
   * GET /repos/:owner/:repo/actions/artifacts - List artifacts for a repo.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/artifacts',
    async (request, reply) => {
      const { owner, repo } = request.params;
      const result = await actions.listArtifacts(owner, repo, request.query);
      return reply.send(result);
    },
  );

  /**
   * GET /repos/:owner/:repo/actions/runs/:runId/artifacts - List artifacts for a run.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/runs/:runId/artifacts',
    async (request, reply) => {
      const { owner, repo, runId } = request.params;
      const result = await actions.listWorkflowRunArtifacts(
        owner,
        repo,
        parseInt(runId, 10),
        request.query,
      );
      return reply.send(result);
    },
  );

  /**
   * GET /repos/:owner/:repo/actions/artifacts/:artifactId - Get an artifact.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/artifacts/:artifactId',
    async (request, reply) => {
      const { owner, repo, artifactId } = request.params;
      const result = await actions.getArtifact(
        owner,
        repo,
        parseInt(artifactId, 10),
      );
      return reply.send(result);
    },
  );

  /**
   * DELETE /repos/:owner/:repo/actions/artifacts/:artifactId - Delete an artifact.
   */
  fastify.delete(
    '/repos/:owner/:repo/actions/artifacts/:artifactId',
    async (request, reply) => {
      const { owner, repo, artifactId } = request.params;
      await actions.deleteArtifact(
        owner,
        repo,
        parseInt(artifactId, 10),
      );
      return reply.status(204).send();
    },
  );

  // ── Downloads ───────────────────────────────────────────────────

  /**
   * GET /repos/:owner/:repo/actions/artifacts/:artifactId/zip - Download artifact ZIP.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/artifacts/:artifactId/zip',
    async (request, reply) => {
      const { owner, repo, artifactId } = request.params;
      const response = await actions.downloadArtifact(
        owner,
        repo,
        parseInt(artifactId, 10),
      );
      reply.header('Content-Type', 'application/zip');
      reply.header(
        'Content-Disposition',
        `attachment; filename="artifact-${artifactId}.zip"`,
      );
      return reply.send(response.body);
    },
  );

  /**
   * GET /repos/:owner/:repo/actions/runs/:runId/logs - Download run logs ZIP.
   */
  fastify.get(
    '/repos/:owner/:repo/actions/runs/:runId/logs',
    async (request, reply) => {
      const { owner, repo, runId } = request.params;
      const response = await actions.downloadRunLogs(
        owner,
        repo,
        parseInt(runId, 10),
      );
      reply.header('Content-Type', 'application/zip');
      reply.header(
        'Content-Disposition',
        `attachment; filename="run-${runId}-logs.zip"`,
      );
      return reply.send(response.body);
    },
  );

  /**
   * GET /repos/:owner/:repo/actions/jobs/:jobId/logs - Download job logs (text).
   */
  fastify.get(
    '/repos/:owner/:repo/actions/jobs/:jobId/logs',
    async (request, reply) => {
      const { owner, repo, jobId } = request.params;
      const response = await actions.downloadJobLogs(
        owner,
        repo,
        parseInt(jobId, 10),
      );
      reply.header('Content-Type', 'text/plain; charset=utf-8');
      return reply.send(response.body);
    },
  );

  // ── Workflow Dispatch ───────────────────────────────────────────

  /**
   * POST /repos/:owner/:repo/actions/workflows/:workflowId/dispatches - Dispatch a workflow.
   */
  fastify.post(
    '/repos/:owner/:repo/actions/workflows/:workflowId/dispatches',
    async (request, reply) => {
      const { owner, repo, workflowId } = request.params;
      const { ref, inputs } = request.body || {};
      await actions.dispatchWorkflow(owner, repo, workflowId, ref, inputs);
      return reply.status(204).send();
    },
  );

  return Promise.resolve();
}
