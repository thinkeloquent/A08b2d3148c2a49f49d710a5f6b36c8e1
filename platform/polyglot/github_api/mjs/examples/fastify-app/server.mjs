/**
 * GitHub API SDK -- Fastify Server Example
 *
 * Demonstrates how to build a Fastify server that proxies GitHub API
 * operations through the SDK with proper error handling, validation,
 * and rate limit awareness.
 *
 * Prerequisites:
 *   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
 *
 * Usage:
 *   node server.mjs
 *   # Server starts on http://localhost:3100
 *
 * Endpoints:
 *   GET  /health                           - Health check with rate limit info
 *   GET  /api/repos/:owner/:repo           - Get repository details
 *   GET  /api/repos/user/:username         - List user repositories
 *   GET  /api/repos/:owner/:repo/branches  - List branches
 *   GET  /api/repos/:owner/:repo/tags      - List tags
 *   POST /api/repos                        - Create repository
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';

import { GitHubClient, createLogger } from '../../src/sdk/client.mjs';
import { resolveToken, maskToken } from '../../src/sdk/auth.mjs';
import { ReposClient } from '../../src/sdk/repos/client.mjs';
import { BranchesClient } from '../../src/sdk/branches/client.mjs';
import { TagsClient } from '../../src/sdk/tags/client.mjs';
import { createErrorHandler } from '../../src/middleware/error-handler.mjs';
import {
  GitHubError,
  ValidationError,
  NotFoundError,
  AuthError,
  RateLimitError,
} from '../../src/sdk/errors.mjs';

// =============================================================================
// Configuration
// =============================================================================

const PORT = parseInt(process.env.PORT || '3100', 10);
const HOST = process.env.HOST || '0.0.0.0';

// =============================================================================
// SDK Client Setup
// =============================================================================

/**
 * Initialize all SDK clients from a resolved token.
 * @returns {{ github: GitHubClient, repos: ReposClient, branches: BranchesClient, tags: TagsClient }}
 */
function createClients() {
  const resolved = resolveToken();
  const logger = createLogger('example-server');

  logger.info(`Token resolved from ${resolved.source} (type: ${resolved.type})`);
  logger.info(`Masked token: ${maskToken(resolved.token)}`);

  const github = new GitHubClient({
    token: resolved.token,
    rateLimitAutoWait: true,
    rateLimitThreshold: 10,
    onRateLimit: (info) => {
      logger.info('Rate limit update', {
        remaining: info.remaining,
        limit: info.limit,
        resource: info.resource,
      });
    },
    logger,
  });

  const repos = new ReposClient(github);
  const branches = new BranchesClient(github);
  const tags = new TagsClient(github);

  return { github, repos, branches, tags };
}

// =============================================================================
// Route Plugin: Health Check
// =============================================================================

/**
 * Health check route plugin.
 * Returns server status and current rate limit information.
 *
 * @param {import('fastify').FastifyInstance} fastify
 * @param {{ github: GitHubClient }} opts
 */
async function healthRoutes(fastify, opts) {
  const { github } = opts;

  fastify.get('/health', async (request, reply) => {
    const rateLimit = github.lastRateLimit;

    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      rateLimit: rateLimit
        ? {
            remaining: rateLimit.remaining,
            limit: rateLimit.limit,
            used: rateLimit.used,
            resource: rateLimit.resource,
            resetsAt: new Date(rateLimit.reset * 1000).toISOString(),
          }
        : null,
    });
  });
}

// =============================================================================
// Route Plugin: Repository Operations
// =============================================================================

/**
 * Repository routes plugin.
 * Exposes CRUD operations for GitHub repositories.
 *
 * @param {import('fastify').FastifyInstance} fastify
 * @param {{ repos: ReposClient }} opts
 */
async function repoRoutes(fastify, opts) {
  const { repos } = opts;

  /**
   * GET /api/repos/:owner/:repo - Get repository details.
   *
   * Example: GET /api/repos/octocat/Hello-World
   */
  fastify.get('/api/repos/:owner/:repo', async (request, reply) => {
    const { owner, repo } = request.params;
    request.log.info({ owner, repo }, 'Getting repository');

    const result = await repos.get(owner, repo);
    return reply.send({
      full_name: result.full_name,
      description: result.description,
      html_url: result.html_url,
      stargazers_count: result.stargazers_count,
      language: result.language,
      default_branch: result.default_branch,
      topics: result.topics,
      created_at: result.created_at,
      updated_at: result.updated_at,
    });
  });

  /**
   * GET /api/repos/user/:username - List repositories for a user.
   *
   * Query params: sort, direction, per_page, page
   * Example: GET /api/repos/user/octocat?sort=updated&per_page=10
   */
  fastify.get('/api/repos/user/:username', async (request, reply) => {
    const { username } = request.params;
    const { sort, direction, per_page, page } = request.query;
    request.log.info({ username }, 'Listing user repositories');

    const results = await repos.listForUser(username, {
      sort,
      direction,
      per_page: per_page ? parseInt(per_page, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
    });

    return reply.send(
      results.map((r) => ({
        full_name: r.full_name,
        description: r.description,
        stargazers_count: r.stargazers_count,
        language: r.language,
        updated_at: r.updated_at,
      })),
    );
  });

  /**
   * POST /api/repos - Create a new repository for the authenticated user.
   *
   * Body: { name, description, private, auto_init }
   * Example: POST /api/repos { "name": "my-new-repo", "private": true }
   */
  fastify.post('/api/repos', async (request, reply) => {
    const { name, description, private: isPrivate, auto_init } = request.body || {};
    request.log.info({ name }, 'Creating repository');

    const result = await repos.create({
      name,
      description,
      private: isPrivate,
      auto_init,
    });

    return reply.status(201).send({
      full_name: result.full_name,
      html_url: result.html_url,
      clone_url: result.clone_url,
      created_at: result.created_at,
    });
  });
}

// =============================================================================
// Route Plugin: Branch Operations
// =============================================================================

/**
 * Branch routes plugin.
 * Exposes branch listing for GitHub repositories.
 *
 * @param {import('fastify').FastifyInstance} fastify
 * @param {{ branches: BranchesClient }} opts
 */
async function branchRoutes(fastify, opts) {
  const { branches } = opts;

  /**
   * GET /api/repos/:owner/:repo/branches - List branches.
   *
   * Query params: protected, per_page, page
   * Example: GET /api/repos/octocat/Hello-World/branches?per_page=10
   */
  fastify.get('/api/repos/:owner/:repo/branches', async (request, reply) => {
    const { owner, repo } = request.params;
    const { protected: isProtected, per_page, page } = request.query;
    request.log.info({ owner, repo }, 'Listing branches');

    const results = await branches.list(owner, repo, {
      protected: isProtected === 'true' ? true : undefined,
      per_page: per_page ? parseInt(per_page, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
    });

    return reply.send(
      results.map((b) => ({
        name: b.name,
        protected: b.protected,
        commit_sha: b.commit?.sha,
      })),
    );
  });
}

// =============================================================================
// Route Plugin: Tag Operations
// =============================================================================

/**
 * Tag routes plugin.
 * Exposes tag listing for GitHub repositories.
 *
 * @param {import('fastify').FastifyInstance} fastify
 * @param {{ tags: TagsClient }} opts
 */
async function tagRoutes(fastify, opts) {
  const { tags } = opts;

  /**
   * GET /api/repos/:owner/:repo/tags - List tags.
   *
   * Query params: per_page, page
   * Example: GET /api/repos/octocat/Hello-World/tags?per_page=10
   */
  fastify.get('/api/repos/:owner/:repo/tags', async (request, reply) => {
    const { owner, repo } = request.params;
    const { per_page, page } = request.query;
    request.log.info({ owner, repo }, 'Listing tags');

    const results = await tags.listTags(owner, repo, {
      per_page: per_page ? parseInt(per_page, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
    });

    // Demonstrate semantic version sorting
    const sorted = tags.sortByVersion(results);

    return reply.send(
      sorted.map((t) => {
        const semver = tags.parseSemanticVersion(t.name);
        return {
          name: t.name,
          sha: t.commit?.sha,
          semver: semver || null,
        };
      }),
    );
  });
}

// =============================================================================
// Server Assembly
// =============================================================================

async function buildServer() {
  // Initialize SDK clients
  const { github, repos, branches, tags } = createClients();

  // Create Fastify instance
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register plugins
  await server.register(cors, { origin: true });
  await server.register(sensible);

  // Decorate the Fastify instance with SDK clients for access in hooks/plugins
  server.decorate('github', github);
  server.decorate('repos', repos);
  server.decorate('branches', branches);
  server.decorate('tags', tags);

  // Set the error handler from the SDK middleware
  server.setErrorHandler(createErrorHandler());

  // Register route plugins
  await server.register(healthRoutes, { github });
  await server.register(repoRoutes, { repos });
  await server.register(branchRoutes, { branches });
  await server.register(tagRoutes, { tags });

  return server;
}

// =============================================================================
// Server Start with Graceful Shutdown
// =============================================================================

async function main() {
  const server = await buildServer();

  // Graceful shutdown handler
  const signals = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      server.log.info(`Received ${signal}, shutting down gracefully...`);
      try {
        await server.close();
        server.log.info('Server closed successfully.');
        process.exit(0);
      } catch (err) {
        server.log.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
    });
  }

  // Handle uncaught errors
  process.on('unhandledRejection', (err) => {
    server.log.error({ err }, 'Unhandled rejection');
    process.exit(1);
  });

  // Start listening
  try {
    const address = await server.listen({ port: PORT, host: HOST });
    server.log.info(`GitHub API example server listening on ${address}`);
    server.log.info('Available endpoints:');
    server.log.info(`  GET  ${address}/health`);
    server.log.info(`  GET  ${address}/api/repos/:owner/:repo`);
    server.log.info(`  GET  ${address}/api/repos/user/:username`);
    server.log.info(`  GET  ${address}/api/repos/:owner/:repo/branches`);
    server.log.info(`  GET  ${address}/api/repos/:owner/:repo/tags`);
    server.log.info(`  POST ${address}/api/repos`);
  } catch (err) {
    server.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

main();
