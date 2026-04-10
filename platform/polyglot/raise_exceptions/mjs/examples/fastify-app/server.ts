/**
 * Common Exceptions - Fastify Integration Example
 *
 * This example demonstrates integrating common-exceptions with Fastify:
 * - Registering exception handlers
 * - Using request ID plugin
 * - Raising standardized exceptions from routes
 * - Validation error handling with Zod
 *
 * Run with: npx tsx watch fastify-app/server.ts
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  // Logger
  createLogger,
  // Exceptions
  NotFoundException,
  ValidationException,
  BadRequestException,
  NotAuthenticatedException,
  NotAuthorizedException,
  ConflictException,
  TooManyRequestsException,
  InternalServerException,
  // Fastify integration
  registerExceptionHandlers,
  requestIdPlugin,
  normalizeZodErrors,
} from '../../src/index.js';

// Create logger for this module
const logger = createLogger('fastify-app', __filename);

// =============================================================================
// Mock Data
// =============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface TokenData {
  userId: string;
  expires: string;
}

const MOCK_USERS: Map<string, User> = new Map([
  ['user-1', { id: 'user-1', name: 'Alice', email: 'alice@example.com', role: 'admin' }],
  ['user-2', { id: 'user-2', name: 'Bob', email: 'bob@example.com', role: 'viewer' }],
]);

const MOCK_TOKENS: Map<string, TokenData> = new Map([
  ['valid-token', { userId: 'user-1', expires: '2099-12-31' }],
  ['expired-token', { userId: 'user-2', expires: '2020-01-01' }],
]);

// =============================================================================
// Zod Schemas
// =============================================================================

const UserCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
});

type UserCreateInput = z.infer<typeof UserCreateSchema>;

// =============================================================================
// Authentication Helpers
// =============================================================================

function getCurrentUser(request: FastifyRequest): User {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    logger.debug('No authorization header provided');
    throw new NotAuthenticatedException({ message: 'Authorization header required' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new NotAuthenticatedException({ message: 'Invalid authorization format' });
  }

  const token = authHeader.slice(7);
  const tokenData = MOCK_TOKENS.get(token);

  if (!tokenData) {
    logger.debug(`Unknown token: ${token.slice(0, 10)}...`);
    throw new NotAuthenticatedException({ message: 'Invalid or expired token' });
  }

  if (tokenData.expires < '2025-01-01') {
    throw new NotAuthenticatedException({
      message: 'Token has expired',
      details: { expiredAt: tokenData.expires },
    });
  }

  const user = MOCK_USERS.get(tokenData.userId);
  if (!user) {
    throw new InternalServerException({ message: 'User associated with token not found' });
  }

  return user;
}

function requireAdmin(request: FastifyRequest): User {
  const user = getCurrentUser(request);

  if (user.role !== 'admin') {
    logger.debug(`User ${user.id} attempted admin action with role ${user.role}`);
    throw new NotAuthorizedException({
      message: 'Admin role required',
      details: { requiredRole: 'admin', userRole: user.role },
    });
  }

  return user;
}

// =============================================================================
// Server Setup
// =============================================================================

async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: false, // We use our own logger
  });

  // Register request ID plugin
  await server.register(requestIdPlugin);

  // Register exception handlers
  registerExceptionHandlers(server);

  // =============================================================================
  // Routes
  // =============================================================================

  // Health check
  server.get('/health', async () => {
    return { status: 'healthy', version: '1.0.0' };
  });

  // Get user by ID
  server.get<{ Params: { userId: string } }>(
    '/users/:userId',
    async (request, reply) => {
      getCurrentUser(request); // Verify authentication
      const { userId } = request.params;

      logger.debug(`Fetching user: ${userId}`);

      const user = MOCK_USERS.get(userId);
      if (!user) {
        throw new NotFoundException({
          message: `User with ID '${userId}' not found`,
          details: { userId },
        });
      }

      return user;
    }
  );

  // Create user
  server.post<{ Body: UserCreateInput }>(
    '/users',
    async (request, reply) => {
      requireAdmin(request); // Verify admin role

      // Validate input with Zod
      const parseResult = UserCreateSchema.safeParse(request.body);
      if (!parseResult.success) {
        const fieldErrors = normalizeZodErrors(parseResult.error.issues);
        throw ValidationException.fromFieldErrors(fieldErrors, {
          message: `Validation failed for ${fieldErrors.length} field(s)`,
        });
      }

      const userData = parseResult.data;
      logger.debug(`Creating user: ${userData.email}`);

      // Check for duplicate email
      for (const existingUser of MOCK_USERS.values()) {
        if (existingUser.email === userData.email) {
          throw new ConflictException({
            message: 'User with this email already exists',
            details: { email: userData.email },
          });
        }
      }

      // Create new user
      const newId = `user-${MOCK_USERS.size + 1}`;
      const newUser: User = {
        id: newId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      MOCK_USERS.set(newId, newUser);
      logger.info(`Created user: ${newId}`);

      reply.status(201);
      return newUser;
    }
  );

  // Delete user
  server.delete<{ Params: { userId: string } }>(
    '/users/:userId',
    async (request, reply) => {
      requireAdmin(request); // Verify admin role
      const { userId } = request.params;

      logger.debug(`Deleting user: ${userId}`);

      if (!MOCK_USERS.has(userId)) {
        throw new NotFoundException({
          message: `User with ID '${userId}' not found`,
          details: { userId },
        });
      }

      MOCK_USERS.delete(userId);
      logger.info(`Deleted user: ${userId}`);

      reply.status(204);
      return;
    }
  );

  // Manual validation demo
  server.get<{ Querystring: { name?: string; email?: string; age?: string } }>(
    '/validate',
    async (request) => {
      const { name, email, age } = request.query;
      const errors: Array<{ field: string; message: string; code?: string }> = [];

      if (!name) {
        errors.push({ field: 'query.name', message: 'Name is required', code: 'required' });
      } else if (name.length < 2) {
        errors.push({ field: 'query.name', message: 'Name must be at least 2 characters', code: 'min_length' });
      }

      if (!email) {
        errors.push({ field: 'query.email', message: 'Email is required', code: 'required' });
      } else if (!email.includes('@')) {
        errors.push({ field: 'query.email', message: 'Invalid email format', code: 'invalid_email' });
      }

      if (age !== undefined) {
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 0) {
          errors.push({ field: 'query.age', message: 'Age must be a non-negative number', code: 'min_value' });
        }
      }

      if (errors.length > 0) {
        throw ValidationException.fromFieldErrors(errors, {
          message: `Validation failed for ${errors.length} field(s)`,
        });
      }

      return { status: 'valid', name, email };
    }
  );

  // Rate limited demo
  server.get('/rate-limited', async () => {
    throw new TooManyRequestsException({
      message: 'Rate limit exceeded',
      retryAfter: 60,
      details: { limit: 100, window: '1m', current: 150 },
    });
  });

  // Bad request demo
  server.get<{ Querystring: { value?: string } }>('/bad-request', async (request) => {
    const { value } = request.query;

    if (!value) {
      throw new BadRequestException({
        message: "Query parameter 'value' is required",
        details: { missingParam: 'value' },
      });
    }

    return { value };
  });

  // Internal error demo
  server.get('/internal-error', async () => {
    throw new InternalServerException({
      message: 'An unexpected error occurred',
      details: { component: 'demo_endpoint' },
    });
  });

  return server;
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main(): Promise<void> {
  const server = await buildServer();

  try {
    const address = await server.listen({ port: 3000, host: '0.0.0.0' });
    logger.info(`Fastify server listening at ${address}`);
    console.log(`Server running at ${address}`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  GET  /health          - Health check');
    console.log('  GET  /users/:userId   - Get user (requires auth)');
    console.log('  POST /users           - Create user (requires admin)');
    console.log('  DELETE /users/:userId - Delete user (requires admin)');
    console.log('  GET  /validate        - Validation demo');
    console.log('  GET  /rate-limited    - Rate limit demo');
    console.log('  GET  /bad-request     - Bad request demo');
    console.log('  GET  /internal-error  - Internal error demo');
    console.log('');
    console.log('Example:');
    console.log('  curl http://localhost:3000/health');
    console.log('  curl -H "Authorization: Bearer valid-token" http://localhost:3000/users/user-1');
  } catch (err) {
    logger.error(`Failed to start server: ${err}`);
    process.exit(1);
  }
}

main();
